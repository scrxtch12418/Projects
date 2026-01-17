import re
from typing import Dict, List

INJECTION_PATTERNS: List[str] = [
    r"ignore (all|previous|earlier) instructions",
    r"disregard (all|previous) rules",
    r"you are now",
    r"act as",
    r"pretend to be",
    r"developer mode",
    r"system prompt",
    r"reveal .* prompt",
    r"bypass (safety|filters|restrictions)",
    r"override .* instructions"
]

def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower())

def check_for_prompt_injection(user_input: str) -> Dict[str, List[str]]:
    user_input_lower = normalize_text(user_input)
    matches = []
    
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, user_input_lower):
            matches.append(pattern)
    
    confidence = min(1.0, len(matches) / len(INJECTION_PATTERNS) + 0.4)

    if(matches):
        return{
            "detected": True,
            "attack_type": "Prompt Injection",
            "severity": severity_from_confidence(confidence),
            "confidence": round(confidence, 2),
            "evidence": matches
        }
    else:    
        return {
        "detected": False,
        "attack_type": None,
        "severity": "LOW",
        "confidence": 0.0,
        "evidence": []
    }


def severity_from_confidence(confidence: float) -> str:
    if confidence > 0.85:
        return "CRITICAL"
    elif confidence > 0.65:
        return "HIGH"
    elif confidence > 0.4:
        return "MEDIUM"
    return "LOW"
