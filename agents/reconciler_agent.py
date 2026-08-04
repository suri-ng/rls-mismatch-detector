"""
Reconciler.
 
Takes one AccessClaim and one EnforcementClaim for the same (table,
operation) and produces a ReconcileResult.
 
Hybrid design:
1. Try to classify each condition into a small fixed category (deterministic,
   no LLM call). If both classify cleanly and unambiguously, compare them
   with plain code and return the result immediately.
2. If either condition doesn't reduce to a clean category, or the categories
   match but reference different fields, escalate to the LLM -- this is the
   only path that calls the model.
 
See the module docstring in agents/prompts/reconciler_prompt.md for why
some cases genuinely need judgment a rule can't provide (e.g. case_03's
note_shares scenario below).
"""
 
from enum import Enum
import json
import re
from typing import Optional
 
from config import CONFIG, get_client
from schemas.models import (
    AccessClaim,
    EnforcementClaim,
    ReconcileResult,
    MismatchStatus,
    Severity,
)
 
PROMPT_PATH = __file__.replace("reconciler_agent.py", "prompts/reconciler_prompt.md")
 
 
class ConditionCategory(str, Enum):
    UNRESTRICTED = "UNRESTRICTED"       # no restriction at all
    OWN_ROW_ONLY = "OWN_ROW_ONLY"       # restricted to rows matching current user, on some field
    DEFAULT_DENY = "DEFAULT_DENY"       # RLS enabled, no matching policy -> deny all
    CUSTOM = "CUSTOM"                   # anything that doesn't fit the above
 
 
_OWN_ROW_PATTERNS = [
    # matches e.g. "user_id == current_user.id", "auth.uid() = user_id"
    re.compile(r"^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*==?\s*current_user\.id\s*$"),
    re.compile(r"^\s*auth\.uid\(\)\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*$"),
    re.compile(r"^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*auth\.uid\(\)\s*$"),
]
 
 
def classify(condition: str) -> tuple[ConditionCategory, Optional[str]]:
    """
    Classify a condition string into a fixed category, plus the field name
    when the category is OWN_ROW_ONLY. Returns (CUSTOM, None) for anything
    that doesn't match a known, unambiguous shape -- callers should treat
    CUSTOM as "needs escalation," not as its own resolved answer.
    """
    text = condition.strip().lower()
 
    if text in ("no restriction assumed",):
        return ConditionCategory.UNRESTRICTED, None
    if text.startswith("true (unrestricted"):
        return ConditionCategory.UNRESTRICTED, None
    if "default deny" in text:
        return ConditionCategory.DEFAULT_DENY, None
 
    for pattern in _OWN_ROW_PATTERNS:
        match = pattern.match(condition.strip())
        if match:
            return ConditionCategory.OWN_ROW_ONLY, match.group(1)
 
    return ConditionCategory.CUSTOM, None
 
 
# (assumed_category, enforced_category) -> (status, severity, explanation template)
# Only pairs that are SAFE to resolve without reading intent live here.
# Anything not in this table falls through to LLM escalation.
_DETERMINISTIC_MATRIX: dict[
    tuple[ConditionCategory, ConditionCategory], tuple[MismatchStatus, Severity, str]
] = {
    (ConditionCategory.UNRESTRICTED, ConditionCategory.UNRESTRICTED): (
        MismatchStatus.MISMATCH,
        Severity.CRITICAL,
        "Neither the application code nor the database restricts access -- "
        "every row is readable/writable by anyone who can reach this endpoint "
        "or the table directly.",
    ),
    (ConditionCategory.OWN_ROW_ONLY, ConditionCategory.UNRESTRICTED): (
        MismatchStatus.MISMATCH,
        Severity.CRITICAL,
        "The application assumes access is restricted to the current user, "
        "but the database enforces no restriction at all -- any client that "
        "bypasses the application (e.g. a direct API call) can read/write "
        "every row.",
    ),
    (ConditionCategory.OWN_ROW_ONLY, ConditionCategory.DEFAULT_DENY): (
        MismatchStatus.MISMATCH,
        Severity.MEDIUM,
        "The database denies this operation entirely (no matching policy), "
        "but the application assumes the current user's own rows should be "
        "reachable -- this will break the feature for legitimate users "
        "rather than expose data.",
    ),
}
 
 
def _deterministic_reconcile(
    access: AccessClaim, enforcement: EnforcementClaim
) -> Optional[ReconcileResult]:
    """
    Returns a ReconcileResult if this pair resolves cleanly and safely by
    rule, or None if it needs LLM escalation.
    """
    assumed_cat, assumed_field = classify(access.assumed_condition)
    enforced_cat, enforced_field = classify(enforcement.enforced_condition)
 
    if assumed_cat == ConditionCategory.CUSTOM or enforced_cat == ConditionCategory.CUSTOM:
        return None  # can't classify at all -> escalate
 
    if assumed_cat == ConditionCategory.OWN_ROW_ONLY and enforced_cat == ConditionCategory.OWN_ROW_ONLY:
        if assumed_field == enforced_field:
            return ReconcileResult(
                table=access.table,
                operation=access.operation,
                status=MismatchStatus.MATCH,
                severity=Severity.NONE,
                explanation=(
                    f"Both the application and the database restrict access to "
                    f"rows where {assumed_field} matches the current user. Assumption "
                    f"and enforcement agree."
                ),
                access_claim=access,
                enforcement_claim=enforcement,
            )
        # Same category, different field names -- could be equivalent columns
        # (e.g. owner_id vs created_by) or could be a real mismatch. Can't
        # tell without more context -> escalate.
        return None
 
    if assumed_cat == ConditionCategory.UNRESTRICTED and enforced_cat in (
        ConditionCategory.OWN_ROW_ONLY,
        ConditionCategory.DEFAULT_DENY,
    ):
        # The app applies no filter, trusting the database. That trust MIGHT
        # be well-placed (database properly restricts) or MIGHT be incomplete
        # (e.g. the app also expects a second, related table's rows to be
        # reachable -- see case_03's note_shares scenario -- and the database
        # policy doesn't account for that). Distinguishing these requires
        # reading intent from source/context, which is exactly the judgment
        # call a rule can't safely make. Always escalate.
        return None
 
    template = _DETERMINISTIC_MATRIX.get((assumed_cat, enforced_cat))
    if template is None:
        return None
 
    status, severity, explanation = template
    return ReconcileResult(
        table=access.table,
        operation=access.operation,
        status=status,
        severity=severity,
        explanation=explanation,
        access_claim=access,
        enforcement_claim=enforcement,
    )
 
 
REPORT_TOOL = {
    "type": "function",
    "function": {
        "name": "report_reconciliation",
        "description": "Report the reconciliation result for this (table, operation) pair.",
        "parameters": {
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": [s.value for s in MismatchStatus]},
                "severity": {"type": "string", "enum": [s.value for s in Severity]},
                "explanation": {"type": "string"},
            },
            "required": ["status", "severity", "explanation"],
        },
    },
}
 
 
def _llm_reconcile(access: AccessClaim, enforcement: EnforcementClaim) -> ReconcileResult:
    """Escalation path -- only reached when the deterministic pass returns None."""
    system_prompt = open(PROMPT_PATH).read()
 
    user_content = (
        f"AccessClaim:\n{access.model_dump_json(indent=2)}\n\n"
        f"EnforcementClaim:\n{enforcement.model_dump_json(indent=2)}"
    )
 
    response = get_client().chat.completions.create(
        model=CONFIG.reconciler_model,
        temperature=CONFIG.temperature,
        max_completion_tokens=CONFIG.max_completion_tokens,
        reasoning_effort=CONFIG.reasoning_effort,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        tools=[REPORT_TOOL],
        tool_choice={"type": "function", "function": {"name": "report_reconciliation"}},
    )
 
    tool_call = response.choices[0].message.tool_calls[0]
    result = json.loads(tool_call.function.arguments)
 
    return ReconcileResult(
        table=access.table,
        operation=access.operation,
        status=MismatchStatus(result["status"]),
        severity=Severity(result["severity"]),
        explanation=result["explanation"],
        access_claim=access,
        enforcement_claim=enforcement,
    )
 
 
def run_reconciler(access: AccessClaim, enforcement: EnforcementClaim) -> ReconcileResult:
    """Public entrypoint: deterministic first, LLM escalation only if needed."""
    result = _deterministic_reconcile(access, enforcement)
    if result is not None:
        return result
    return _llm_reconcile(access, enforcement)
 
