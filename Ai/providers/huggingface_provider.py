import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
HUGGINGFACE_API_KEY = os.environ.get("HUGGINGFACE_API_KEY")

def call_huggingface(prompt):
    if not HUGGINGFACE_API_KEY:
        raise ValueError("HuggingFace not configured")
    API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    
    full_prompt = "You are a professional JSON generator. Return ONLY valid JSON format. Do not include markdown or explanations. \n\n" + prompt
    
    payload = {
        "inputs": f"[INST] {full_prompt} [/INST]",
        "parameters": {"max_new_tokens": 1500, "return_full_text": False}
    }
    response = requests.post(API_URL, headers=headers, json=payload, timeout=45)
    response.raise_for_status()
    result = response.json()
    if isinstance(result, list) and len(result) > 0 and 'generated_text' in result[0]:
        return result[0]['generated_text']
    raise ValueError("Invalid HF response")
