from fastapi import APIRouter, HTTPException
from models import OutreachRequest, OutreachResponse
from services.email_generator import generate_outreach
from services.parser import extract_profile_signals
from services.history import save_to_history, get_history, clear_history

router = APIRouter()


@router.post("/generate-outreach", response_model=OutreachResponse)
async def generate_outreach_endpoint(request: OutreachRequest):
    # Basic validation
    if len(request.linkedin_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="LinkedIn profile text is too short. Paste more content.")
    if len(request.your_profile.strip()) < 20:
        raise HTTPException(status_code=400, detail="Your profile description is too short.")
    if request.goal not in ["job", "internship", "networking", "consulting"]:
        raise HTTPException(status_code=400, detail="Goal must be one of: job, internship, networking, consulting")

    # Extract lightweight signals (used for logging/history context)
    signals = extract_profile_signals(request.linkedin_text)

    try:
        result = generate_outreach(
            linkedin_text=request.linkedin_text,
            your_profile=request.your_profile,
            goal=request.goal,
            tone=request.tone or "professional",
        )
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    # Validate expected keys came back
    for key in ["subject", "email", "linkedin_message", "key_insights"]:
        if key not in result:
            raise HTTPException(status_code=500, detail=f"LLM response missing field: {key}")

    # Save to history
    save_to_history(
        request_data={
            "goal": request.goal,
            "tone": request.tone,
            "target_signals": signals,
            "your_profile_snippet": request.your_profile[:100],
        },
        response_data=result,
    )

    return OutreachResponse(**result)


@router.get("/history")
async def get_history_endpoint():
    return {"history": get_history()}


@router.delete("/history")
async def clear_history_endpoint():
    clear_history()
    return {"message": "History cleared."}