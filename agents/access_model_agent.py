"""
Access-Model Agent.
 
Reads ONLY a backend route/query file and reports what the application
code appears to assume about who is allowed to access which rows. Never
sees the database schema/RLS file -- see
agents/prompts/access_model_prompt.md for the full rules it follows.
"""
 
from pathlib import Path
import json
 
from config import CONFIG, get_client
from schemas.models import AccessClaim, Operation
 
PROMPT_PATH = Path(__file__).parent / "prompts" / "access_model_prompt.md"
 
REPORT_TOOL = {
    "type": "function",
    "function": {
        "name": "report_access_claims",
        "description": "Report the access claims found in the application code.",
        "parameters": {
            "type": "object",
            "properties": {
                "claims": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "table": {"type": "string"},
                            "operation": {
                                "type": "string",
                                "enum": [op.value for op in Operation],
                            },
                            "assumed_condition": {"type": "string"},
                            "source": {"type": "string"},
                            "confidence": {"type": "number"},
                        },
                        "required": [
                            "table",
                            "operation",
                            "assumed_condition",
                            "source",
                        ],
                    },
                }
            },
            "required": ["claims"],
        },
    },
}
 
 
def run_access_model_agent(app_code: str) -> list[AccessClaim]:
    """
    Given the raw text of a backend route/query file, return one
    AccessClaim per (table, operation) pair the code touches.
    """
    system_prompt = PROMPT_PATH.read_text()
        
    response = get_client().chat.completions.create(
        model=CONFIG.access_model_model,
        temperature=CONFIG.temperature,
        max_completion_tokens=CONFIG.max_completion_tokens,
        reasoning_effort=CONFIG.reasoning_effort,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"app_code:\n\n```\n{app_code}\n```",
            },
        ],
        tools=[REPORT_TOOL],
        tool_choice={
            "type": "function",
            "function": {"name": "report_access_claims"},
        },
    )
 
    tool_call = response.choices[0].message.tool_calls[0]
    raw_claims = json.loads(tool_call.function.arguments)["claims"]
 
    return [AccessClaim(**claim) for claim in raw_claims]
 
 
if __name__ == "__main__":
    import sys
 
    code_path = Path(sys.argv[1])
    claims = run_access_model_agent(code_path.read_text())
    for c in claims:
        print(json.dumps(c.model_dump(), indent=2))
 
