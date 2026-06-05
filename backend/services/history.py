import json
import os
from datetime import datetime
from pathlib import Path

HISTORY_PATH = Path(__file__).parent.parent / "history.json"


def _load_history() -> list:
    if not HISTORY_PATH.exists() or HISTORY_PATH.stat().st_size == 0:
        return []
    with open(HISTORY_PATH, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_to_history(request_data: dict, response_data: dict):
    history = _load_history()
    entry = {
        "id": len(history) + 1,
        "timestamp": datetime.now().isoformat(),
        "request": request_data,
        "response": response_data,
    }
    history.append(entry)
    with open(HISTORY_PATH, "w") as f:
        json.dump(history, f, indent=2)


def get_history() -> list:
    return _load_history()


def clear_history():
    with open(HISTORY_PATH, "w") as f:
        json.dump([], f)