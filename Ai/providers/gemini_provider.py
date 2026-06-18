import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

gemini_model = None
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel("gemini-2.5-flash")
    except Exception as e:
        print(f"Failed to initialize Gemini: {e}")

def call_gemini(prompt):
    if not gemini_model:
        raise ValueError("Gemini not configured")
    full_prompt = "You are a senior professional tech AI. Always return precise, highly structured JSON matching the requested schema exactly. Never include conversational text.\n\n" + prompt
    response = gemini_model.generate_content(
        full_prompt,
        generation_config=genai.GenerationConfig(response_mime_type="application/json")
    )
    return response.text
