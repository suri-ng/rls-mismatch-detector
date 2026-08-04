r"""
LangGraph wiring for the pipeline.

    START --> enforcement_node --\
          \                       --> reconcile_node --> END
           --> access_node ------/

Enforcement and Access-Model run independently (neither depends on the
other's output -- that independence is the whole point, see earlier
notes on why the two agents never see each other's input file). Both
feed into reconcile_node, which does the actual pairing/reconciliation
work via pipeline/pairing.py -- this file just wires the nodes together.
"""

from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END

from agents.enforcement_agent import run_enforcement_agent
from agents.access_model_agent import run_access_model_agent
from pipeline.pairing import pair_and_reconcile
from schemas.models import AccessClaim, EnforcementClaim, ReconcileResult


class PipelineState(TypedDict):
    schema_sql: str
    app_code: str
    enforcement_claims: list[EnforcementClaim]
    access_claims: list[AccessClaim]
    results: list[ReconcileResult]


def enforcement_node(state: PipelineState) -> dict:
    return {"enforcement_claims": run_enforcement_agent(state["schema_sql"])}


def access_node(state: PipelineState) -> dict:
    return {"access_claims": run_access_model_agent(state["app_code"])}


def reconcile_node(state: PipelineState) -> dict:
    results = pair_and_reconcile(state["access_claims"], state["enforcement_claims"])
    return {"results": results}


def build_graph():
    graph = StateGraph(PipelineState)

    graph.add_node("enforcement", enforcement_node)
    graph.add_node("access", access_node)
    graph.add_node("reconcile", reconcile_node)

    # Both branches start independently from START ...
    graph.add_edge(START, "enforcement")
    graph.add_edge(START, "access")

    # ... and reconcile_node only runs once BOTH have completed --
    # LangGraph waits for all incoming edges before running a node.
    graph.add_edge("enforcement", "reconcile")
    graph.add_edge("access", "reconcile")

    graph.add_edge("reconcile", END)

    return graph.compile()