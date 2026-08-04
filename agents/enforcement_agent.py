"""
Enforcement Agent.
 
Reads ONLY a schema.sql (RLS policy) file and reports what the database
actually enforces, per (table, operation). Never sees application code --
see agents/prompts/enforcement_prompt.md for the full rules it follows.
 
Uses OpenAI's function-calling to force structured output.
"""
 
from pathlib import Path
import json
import os
 
from openai import OpenAI
from config import CONFIG, get_client
from schemas.models import EnforcementClaim, Operation
 
PROMPT_PATH = Path(__file__).parent / "prompts" / "enforcement_prompt.md"
  
REPORT_TOOL = {
    "type": "function",
    "function": {
        "name": "report_enforcement_claims",
        "description": "Report the enforcement claims found in the schema file.",
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
                            "enforced_condition": {"type": "string"},
                            "rls_enabled": {"type": "boolean"},
                            "source": {"type": "string"},
                            "confidence": {"type": "number"},
                        },
                        "required": [
                            "table",
                            "operation",
                            "enforced_condition",
                            "rls_enabled",
                            "source",
                        ],
                    },
                }
            },
            "required": ["claims"],
        },
    },
}
 
 
 
def run_enforcement_agent(schema_sql: str) -> list[EnforcementClaim]:
    """
    Given the raw text of a schema.sql file, return one EnforcementClaim per
    (table, operation) pair the file defines behavior for.
    """
    system_prompt = PROMPT_PATH.read_text()
 
    response = get_client().chat.completions.create(
        model=CONFIG.enforcement_model,
        temperature=CONFIG.temperature,
        max_completion_tokens=CONFIG.max_completion_tokens,
        reasoning_effort=CONFIG.reasoning_effort,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"schema.sql:\n\n```sql\n{schema_sql}\n```",
            },
        ],
        tools=[REPORT_TOOL],
        tool_choice={
            "type": "function",
            "function": {"name": "report_enforcement_claims"},
        },
    )

 
    tool_call = response.choices[0].message.tool_calls[0]
    raw_claims = json.loads(tool_call.function.arguments)["claims"]
 
    return [EnforcementClaim(**claim) for claim in raw_claims]
 
 
if __name__ == "__main__":
    import sys
 
    schema_path = Path(sys.argv[1])
    claims = run_enforcement_agent(schema_path.read_text())
    for c in claims:
        print(json.dumps(c.model_dump(), indent=2))
 
