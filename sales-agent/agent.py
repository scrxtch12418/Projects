import json
from openai import OpenAI
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
    conversation = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    for i in range(max_iterations):
        response = client.chat.completions.create(
            model="qwen3-sales",
            messages=conversation,
            tools=TOOLS,
            tool_choice="auto"
        )

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
            ]
        })

        # Run each tool and append results
        for tc in message.tool_calls:
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