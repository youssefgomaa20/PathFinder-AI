import json
import re
from providers.openai_provider import call_openai
from providers.groq_provider import call_groq
from providers.gemini_provider import call_gemini
from providers.huggingface_provider import call_huggingface

def execute_ai_pipeline(prompt, task_name=""):
    # Provider prioritization based on reasoning/task complexity
    # 1. OpenAI (Best for structure/logic)
    # 2. Groq (Fastest, very smart)
    # 3. Gemini (Great context window)
    # 4. HuggingFace (Fallback open source)
    
    if task_name == "compare":
        providers = [
            ("OpenAI", call_openai),
            ("Groq", call_groq),
            ("Gemini", call_gemini),
            ("HuggingFace", call_huggingface)
        ]
    elif task_name == "chatbot":
        providers = [
            ("OpenAI", call_openai),
            ("Groq", call_groq),
            ("Gemini", call_gemini),
            ("HuggingFace", call_huggingface)
        ]
    elif task_name == "cv":
        providers = [
            ("OpenAI", call_openai),
            ("Groq", call_groq),
            ("Gemini", call_gemini),
            ("HuggingFace", call_huggingface)
        ]
    else:
        providers = [
            ("OpenAI", call_openai),
            ("Groq", call_groq),
            ("Gemini", call_gemini),
            ("HuggingFace", call_huggingface)
        ]
        
    last_error = None
    for name, provider_func in providers:
        try:
            print(f"[AI Orchestrator] Trying provider: {name} for task: {task_name}...", flush=True)
            text = provider_func(prompt)
            
            # Extract JSON cleanly to protect against chatty fallback models
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                text = match.group(0)
            else:
                raise ValueError("No JSON object found in response")
            
            # Validate JSON to ensure we don't pass broken text
            json.loads(text, strict=False)
            
            print(f"[AI Orchestrator] Provider {name} succeeded.", flush=True)
            return text.strip()
        except Exception as e:
            print(f"[AI Orchestrator] Provider {name} failed: {e}", flush=True)
            last_error = e
            
    print(f"[AI Orchestrator] All AI providers failed. Last error: {last_error}", flush=True)
    raise Exception("AI_SERVICE_UNAVAILABLE")
