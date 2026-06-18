import os

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

api_key = os.getenv("HUGGINGFACE_API_KEY")
if not api_key:
    raise RuntimeError("HUGGINGFACE_API_KEY is not set. Copy .env.example to .env and add your key.")

client = InferenceClient(
    model="meta-llama/Meta-Llama-3-8B-Instruct",
    api_key=api_key,
)

prompt = """
You are an AI career advisor.

Create a programming learning roadmap.

Return ONLY JSON in this format:
{
  "goal": "Programming",
  "stages": [
    {
      "title": "",
      "duration": "",
      "skills": [],
      "courses": [
        {
          "name": "",
          "url": ""
        }
      ]
    }
  ]
}
"""

response = client.chat_completion(
    messages=[
        {"role": "user", "content": prompt}
    ],
    max_tokens=1200
)

print(response.choices[0].message["content"])