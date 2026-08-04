"""
Structured output schemas for the RLS mismatch detector.
 
Three shapes, matching the three agents in the pipeline:
    AccessModelAgent   -> AccessClaim       (what the app code assumes)
    EnforcementAgent   -> EnforcementClaim  (what the DB actually enforces)
    ReconcilerAgent    -> ReconcileResult   (do the two agree, and so what)
 
Keeping these in one place means both upstream agents are forced into the
same (table, operation, condition) shape, which is what makes the
Reconciler's comparison mechanical instead of another vague LLM judgment.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
 
 
class Operation(str, Enum):
    """The four RLS-relevant operations. Matches Postgres/Supabase policy commands."""
    SELECT = "SELECT"
    INSERT = "INSERT"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
 
 
class AccessClaim(BaseModel):
    """
    One claim about what the APPLICATION CODE assumes is protecting a table.
 
    Produced by the Access-Model Agent, reading ONLY app code (routes, queries,
    ORM calls) — it never sees the schema/RLS file. This should describe what
    the developer appears to believe is true, not whether that belief is correct.
    """
    table: str = Field(..., description="Name of the table this claim concerns")
    operation: Operation
    assumed_condition: str = Field(
        ...,
        description=(
            "Plain-language or expression form of what the app code assumes "
            "restricts access, e.g. 'user_id == current_user.id', or "
            "'no restriction assumed' if the code applies no filter at all"
        ),
    )
    source: str = Field(
        ...,
        description="Short pointer to where in the code this was inferred from, e.g. 'getNotes(): .eq(\"user_id\", req.user.id)'",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Agent's confidence in this reading of the code (1.0 = explicit and unambiguous)",
    )
 
 
class EnforcementClaim(BaseModel):
    """
    One claim about what the DATABASE actually enforces for a table.
 
    Produced by the Enforcement Agent, reading ONLY the schema/RLS policy file
    (e.g. schema.sql) — it never sees the app code. This should describe what
    is actually wired in at the database layer, independent of what any
    application assumes.
    """
    table: str = Field(..., description="Name of the table this claim concerns")
    operation: Operation
    enforced_condition: str = Field(
        ...,
        description=(
            "Expression form of the actual enforced rule, e.g. "
            "'auth.uid() = user_id', or 'true (unrestricted)' if the policy "
            "allows all rows, or 'no policy defined (default deny)' if RLS is "
            "enabled but no matching policy exists"
        ),
    )
    rls_enabled: bool = Field(
        ..., description="Whether RLS is enabled at all on this table"
    )
    source: str = Field(
        ...,
        description="Short pointer to the policy this was read from, e.g. 'policy \"allow all reads\" on notes'",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Agent's confidence in this reading of the policy file",
    )
 
 
class MismatchStatus(str, Enum):
    MATCH = "MATCH"
    MISMATCH = "MISMATCH"
    UNKNOWN = "UNKNOWN"  # e.g. table appears in one file but not the other
 
 
class Severity(str, Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
 
 
class ReconcileResult(BaseModel):
    """
    The output of comparing one AccessClaim against its matching
    EnforcementClaim for the same (table, operation) pair.
 
    This is the pipeline's final answer for that pair.
    """
    table: str
    operation: Operation
    status: MismatchStatus
    severity: Severity = Severity.NONE
    explanation: str = Field(
        ...,
        description="Human-readable explanation of the match/mismatch and why the severity was assigned",
    )
    access_claim: Optional[AccessClaim] = None
    enforcement_claim: Optional[EnforcementClaim] = None
 
