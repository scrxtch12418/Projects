import json
from typing import Any, cast
from openai import OpenAI
from openai import APIConnectionError
from tools.registry import TOOLS
from tools.functions import run_tool

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)

SYSTEM_PROMPT = """You are a sales assistant."""


def _parse_tool_arguments(raw_arguments: str) -> dict:
    """Parse tool-call arguments safely and fall back to an empty object."""
    if not raw_arguments:
        return {}

    try:
        parsed = json.loads(raw_arguments)
    except json.JSONDecodeError:
        return {}

    return parsed if isinstance(parsed, dict) else {}

def run_agent(messages: list, max_iterations: int = 5) -> str:
    conversation: list[dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    for i in range(max_iterations):
        try:
            response = client.chat.completions.create(
                model="qwen3-sales",
                messages=cast(Any, conversation),
                tools=cast(Any, TOOLS),
                tool_choice="auto"
            )
        except APIConnectionError:
            return (
                "I cannot reach the local LLM service at http://localhost:11434. "
                "Start Ollama and make sure the qwen3-sales model is available."
            )
        except Exception as exc:
            return f"I hit an unexpected model error: {exc}"

        message = response.choices[0].message

        # No tool calls means Qwen3 has a final answer
        if not message.tool_calls:
            return message.content or "I could not generate a response."

        # Append assistant's tool call decision to conversation
        conversation.append({
            "role": "assistant",
            "content": message.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                }
                for tc in message.tool_calls
                if tc.type == "function"
            ]
        })

        # Run each tool and append results
        for tc in message.tool_calls:
            if tc.type != "function":
                continue

            name = tc.function.name
            args = _parse_tool_arguments(tc.function.arguments)
            print(f"[agent] tool call: {name}({args})")
            result = run_tool(name, args)
            conversation.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result
            })

    return "Sorry, I could not complete the task."