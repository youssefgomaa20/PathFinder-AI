import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

openai_client = None
if OPENAI_API_KEY:
    try:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"Failed to initialize OpenAI: {e}")

def call_openai(prompt):
    if not openai_client:
        raise ValueError("OpenAI not configured")
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a senior professional tech AI. Always return precise, highly structured JSON matching the requested schema exactly. Never include conversational text outside the JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content
