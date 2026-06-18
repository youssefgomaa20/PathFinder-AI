import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"Failed to initialize Groq: {e}")

def call_groq(prompt):
    if not groq_client:
        raise ValueError("Groq not configured")
    response = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an elite career and technical mentor. Output MUST be strictly valid JSON according to the schema requested. No conversational text."},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content
