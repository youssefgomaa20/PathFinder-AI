from orchestrator.ai_router import execute_ai_pipeline
from prompts.compare_prompts import get_compare_prompt

def compare_service(track1, track2, language="en"):
    prompt = get_compare_prompt(track1, track2, language)
    return execute_ai_pipeline(prompt, "compare")
