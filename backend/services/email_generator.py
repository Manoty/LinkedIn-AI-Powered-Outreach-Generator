import os
import re
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
from services.company_insight import derive_company_context

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "outreach_prompt.txt"


def load_prompt_template() -> str:
    with open(PROMPT_PATH, "r") as f:
        return f.read()


def generate_outreach(linkedin_text: str, your_profile: str, goal: str, tone: str = "professional") -> dict:
    prompt_template = load_prompt_template()

    company_context = derive_company_context(linkedin_text)
    enriched_linkedin_text = linkedin_text + f"\n\n[CONTEXT HINT: {company_context}]"

    filled_prompt = prompt_template.format(
        linkedin_text=enriched_linkedin_text,
        your_profile=your_profile,
        goal=goal,
        tone=tone,
    )

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": filled_prompt,
        "stream": False,
        "options": {
        "temperature": 0.7,
        }
    }
    
    print("OLLAMA_BASE_URL =", OLLAMA_BASE_URL)
    print("OLLAMA_MODEL =", OLLAMA_MODEL)
    print("FULL URL =", f"{OLLAMA_BASE_URL}/api/generate")

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=120,
        )
        print("STATUS:", response.status_code)
        print("BODY:", response.text)
        response.raise_for_status()
        raw = response.json().get("response", "")
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Cannot connect to Ollama. Make sure it is running on localhost:11434")
    except requests.exceptions.Timeout:
        raise RuntimeError("Ollama request timed out. Try a smaller model or shorter input.")
    except Exception as e:
        raise RuntimeError(f"Ollama error: {str(e)}")

    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```[a-z]*\n?", "", cleaned)
            cleaned = cleaned.rstrip("`").strip()
        result = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            result = json.loads(match.group())
        else:
            raise RuntimeError(f"LLM did not return valid JSON. Raw response: {raw[:300]}")

    return result