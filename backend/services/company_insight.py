def derive_company_context(linkedin_text: str) -> str:
    """
    Returns a short context string injected into the prompt
    to help the LLM reason about company stage.
    This uses keyword heuristics as a lightweight pre-pass.
    """
    text_lower = linkedin_text.lower()

    stage_hints = []

    startup_keywords = ["seed", "series a", "series b", "early stage", "founding team", "stealth", "pre-launch", "building from scratch"]
    scaling_keywords = ["series c", "series d", "growth stage", "scaling", "expanding", "hiring rapidly", "100+ employees", "500+ employees"]
    enterprise_keywords = ["fortune 500", "enterprise", "global operations", "publicly traded", "nasdaq", "nyse", "10,000+"]

    if any(kw in text_lower for kw in startup_keywords):
        stage_hints.append("Company appears to be an early-stage startup.")
    elif any(kw in text_lower for kw in scaling_keywords):
        stage_hints.append("Company appears to be in a growth/scaling phase.")
    elif any(kw in text_lower for kw in enterprise_keywords):
        stage_hints.append("Company appears to be a large enterprise.")
    else:
        stage_hints.append("Company stage is unclear — treat as mid-size or growing.")

    tech_keywords = ["saas", "api", "cloud", "machine learning", "ai", "software", "platform", "data", "devops"]
    if any(kw in text_lower for kw in tech_keywords):
        stage_hints.append("Company operates in the tech/software space.")

    return " ".join(stage_hints)