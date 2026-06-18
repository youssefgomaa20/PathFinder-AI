from orchestrator.ai_router import execute_ai_pipeline
from prompts.resume_prompts import get_resume_prompt

def generate_resume_service(data, language="en"):
    prompt = get_resume_prompt(data, language)
    return execute_ai_pipeline(prompt, "cv")
