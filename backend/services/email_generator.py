import os
import re
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
from services.company_insight import derive_company_context

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")
PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "outreach_prompt.txt"


def load_prompt_template() -> str:
    with open(PROMPT_PATH, "r") as f:
        return f.read()


def _salvage_truncated_json(raw: str) -> dict | None:
    """
    Recovers a truncated JSON object from LLM output.
    Extracts fully-present fields and fills missing ones with fallbacks.
    """
    result = {}

    subject_match = re.search(r'"subject"\s*:\s*"([^"]*)"', raw)
    if subject_match:
        result["subject"] = subject_match.group(1)

    email_match = re.search(r'"email"\s*:\s*"(.*?)(?<!\\)"(?=\s*,|\s*})', raw, re.DOTALL)
    if email_match:
        result["email"] = email_match.group(1).replace("\\n", "\n").replace('\\"', '"')

    dm_match = re.search(r'"linkedin_message"\s*:\s*"(.*?)(?<!\\)"(?=\s*,|\s*})', raw, re.DOTALL)
    if dm_match:
        result["linkedin_message"] = dm_match.group(1).replace("\\n", "\n").replace('\\"', '"')

    insights_match = re.search(r'"key_insights"\s*:\s*\[(.*?)\]', raw, re.DOTALL)
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
    tone: str = "professional"
) -> dict:

    prompt_template = load_prompt_template()

    company_context = derive_company_context(linkedin_text)

    # Trim inputs to avoid context overflow on smaller models
    linkedin_trimmed = linkedin_text[:3000]
    your_profile_trimmed = your_profile[:800]

    enriched_linkedin_text = linkedin_trimmed + f"\n\n[CONTEXT HINT: {company_context}]"

    filled_prompt = prompt_template.format(
        linkedin_text=enriched_linkedin_text,
        your_profile=your_profile_trimmed,
        goal=goal,
        tone=tone,
    )

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": filled_prompt,
        "stream": False,
        "options": {
            "temperature": 0.85,
            "top_p": 0.92,
            "repeat_penalty": 1.15,
            "num_predict": 1024,
            "num_ctx": 4096,
        }
    }

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=180,
        )
        response.raise_for_status()
        raw = response.json().get("response", "")
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Cannot connect to Ollama. Make sure it is running on localhost:11434")
    except requests.exceptions.Timeout:
        raise RuntimeError("Ollama timed out. Try a smaller model or shorter input.")
    except Exception as e:
        raise RuntimeError(f"Ollama error: {str(e)}")

    # Parse JSON from LLM response
    cleaned = raw.strip()

    # Strip markdown fences
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

    raise RuntimeError(f"LLM did not return valid JSON. Raw response: {raw[:300]}")