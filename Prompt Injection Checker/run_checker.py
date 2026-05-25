import json
import os
from datetime import datetime

from prompt_injection import check_for_prompt_injection


def save_report(result: dict, folder: str = "reports") -> str:
    os.makedirs(folder, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"report_{timestamp}.json"
    path = os.path.join(folder, filename)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=4, ensure_ascii=False)

    return path


if __name__ == "__main__":
    text = input("Enter text to check: ")

    result = check_for_prompt_injection(text)

    result["timestamp"] = datetime.now().isoformat()
    result["input_preview"] = text[:120] + ("..." if len(text) > 120 else "")

    print("\nResult:")
    print(json.dumps(result, indent=4))

    report_path = save_report(result)
    print(f"\nSaved report to: {report_path}")
