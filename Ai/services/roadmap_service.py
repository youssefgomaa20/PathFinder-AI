from orchestrator.ai_router import execute_ai_pipeline
from prompts.roadmap_prompts import get_roadmap_prompt

def generate_roadmap_service(user_input, language="en"):
    prompt = get_roadmap_prompt(user_input, language)
    return execute_ai_pipeline(prompt, "chatbot")
