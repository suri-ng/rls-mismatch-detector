"""
Central LLM configuration.
 
All agent files import from here instead of reading os.environ or
constructing an OpenAI() client themselves. If you ever need to change
providers, swap models, or adjust call defaults, this is the one file
that changes -- agent code never touches config directly.
"""
 
from dataclasses import dataclass
from dotenv import load_dotenv
import os
 
from openai import OpenAI
 
# Loads variables from a .env file in the project root into os.environ.
# Safe to call even if .env doesn't exist -- it just does nothing.
load_dotenv()
 
 
@dataclass(frozen=True)
class LLMConfig:
    api_key: str
    enforcement_model: str
    access_model_model: str
    reconciler_model: str
    max_completion_tokens: int
    temperature: float
    reasoning_effort: str
 
 
def load_config() -> LLMConfig:
    """
    Reads all LLM-related settings from environment variables (which may
    have come from a real shell env var, or from .env via load_dotenv above).
 
    Raises a clear error immediately if the API key is missing, instead of
    letting every agent fail separately later with a confusing SDK error.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is not set. Add it to a .env file in the "
            "project root, or export it in your shell before running."
        )
 
    return LLMConfig(
        api_key=api_key,
        enforcement_model=os.environ.get("ENFORCEMENT_AGENT_MODEL", "gpt-5.6-luna"),
        access_model_model=os.environ.get("ACCESS_MODEL_AGENT_MODEL", "gpt-5.6-luna"),
        reconciler_model=os.environ.get("RECONCILER_AGENT_MODEL", "gpt-5.6-luna"),
        max_completion_tokens=int(os.environ.get("LLM_MAX_TOKENS", "2000")),
        temperature=float(os.environ.get("LLM_TEMPERATURE", "0")),
        reasoning_effort="none",
    )
 
 
# Loaded once, at import time, and reused everywhere -- agents don't each
# call load_config() themselves.
CONFIG = load_config()
 
def get_client() -> OpenAI:
    """The one place an OpenAI client is constructed."""
    return OpenAI(api_key=CONFIG.api_key)