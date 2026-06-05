import re

def extract_profile_signals(linkedin_text: str) -> dict:
    """
    Extracts lightweight signals from raw LinkedIn text.
    This is pre-processing before we send to the LLM.
    """
    signals = {}

    lines = [line.strip() for line in linkedin_text.strip().splitlines() if line.strip()]

    # Heuristic: first non-empty line is usually the name
    if lines:
        signals["probable_name"] = lines[0]

    # Look for role/company patterns
    role_patterns = [
        r"(CEO|CTO|CFO|COO|Founder|Co-Founder|Director|Manager|Engineer|Developer|Designer|Lead|Head of|VP|President|Analyst|Consultant|Intern)",
    ]
    for line in lines[:10]:
        for pattern in role_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                signals["probable_role_line"] = line
                break

    # Look for company signals
    at_pattern = re.search(r"at ([A-Z][a-zA-Z0-9\s&]+)", linkedin_text)
    if at_pattern:
        signals["probable_company"] = at_pattern.group(1).strip()

    # Word count as a quality signal
    signals["profile_word_count"] = len(linkedin_text.split())

    return signals