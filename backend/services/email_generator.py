import os
import re
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
from services.company_insight import derive_company_context

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "outreach_prompt.txt"


def load_prompt_template() -> str:
    with open(PROMPT_PATH, "r") as f:
        return f.read()


def _salvage_truncated_json(raw: str) -> dict | None:
    result = {}

    subject_match = re.search(r'"subject"\s*:\s*"([^"]*)"', raw)
    if subject_match:
        result["subject"] = subject_match.group(1)

    email_match = re.search(
        r'"email"\s*:\s*"(.*?)(?<!\\)"(?=\s*,|\s*})', raw, re.DOTALL
    )
    if email_match:
        result["email"] = (
            email_match.group(1).replace("\\n", "\n").replace('\\"', '"')
        )

    dm_match = re.search(
        r'"linkedin_message"\s*:\s*"(.*?)(?<!\\)"(?=\s*,|\s*})', raw, re.DOTALL
    )
    if dm_match:
        result["linkedin_message"] = (
            dm_match.group(1).replace("\\n", "\n").replace('\\"', '"')
        )

    insights_match = re.search(
        r'"key_insights"\s*:\s*\[(.*?)\]', raw, re.DOTALL
    )
    if insights_match:
        items = re.findall(r'"(.*?)(?<!\\)"', insights_match.group(1))
        result["key_insights"] = items

    if "subject" not in result or "email" not in result:
        return None

    result.setdefault("linkedin_message", result.get("email", "")[:200])
    result.setdefault("key_insights", ["See email for full context."])

    return result


def generate_outreach(
    linkedin_text: str,
    your_profile: str,
    goal: str,
    tone: str = "professional",
) -> dict:

    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to your .env file."
        )

    prompt_template = load_prompt_template()
    company_context = derive_company_context(linkedin_text)

    linkedin_trimmed = linkedin_text[:3000]
    your_profile_trimmed = your_profile[:800]
    enriched_linkedin_text = (
        linkedin_trimmed + f"\n\n[CONTEXT HINT: {company_context}]"
    )

    filled_prompt = prompt_template.format(
        linkedin_text=enriched_linkedin_text,
        your_profile=your_profile_trimmed,
        goal=goal,
        tone=tone,
    )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are an expert outreach copywriter. "
                    "You always respond with only a valid JSON object. "
                    "No markdown. No explanation. No preamble. Just JSON."
                ),
            },
            {
                "role": "user",
                "content": filled_prompt,
            },
        ],
        "temperature": 0.85,
        "max_tokens": 1024,
        "top_p": 0.92,
    }

    try:
        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=60,
        )
        response.raise_for_status()
        raw = response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Cannot connect to Groq API. Check your internet connection.")
    except requests.exceptions.Timeout:
        raise RuntimeError("Groq API timed out.")
    except requests.exceptions.HTTPError as e:
        status = e.response.status_code if e.response else "?"
        if status == 401:
            raise RuntimeError("Invalid Groq API key. Check your GROQ_API_KEY.")
        if status == 429:
            raise RuntimeError("Groq rate limit hit. Wait a moment and try again.")
        raise RuntimeError(f"Groq API error {status}: {e.response.text[:200]}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error: {str(e)}")

    # Parse JSON from response
    cleaned = raw.strip()

    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-z]*\n?", "", cleaned)
        cleaned = cleaned.rstrip("`").strip()

    # Attempt 1: direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Attempt 2: extract outermost {} block
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Attempt 3: salvage truncated JSON
    salvaged = _salvage_truncated_json(cleaned)
    if salvaged:
        return salvaged

    raise RuntimeError(
        f"LLM did not return valid JSON. Raw response: {raw[:300]}"
    )