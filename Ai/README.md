# AI Career Assistant 🚀

This project is an AI-powered system that helps users with:

* Generating programming learning roadmaps
* Comparing different career tracks
* Creating professional CVs

## 🧠 Features

### 1. Chatbot (Roadmap Generator)

Generate a structured learning roadmap for any programming field.

### 2. Track Comparison

Compare two programming tracks (e.g., Frontend vs Data Science).

### 3. CV Generator

Create a professional CV based on user input.

## ⚙️ Tech Stack

* Python (Flask)
* Hugging Face (LLM)
* React (Frontend)

## 🔌 API Endpoint

POST http://127.0.0.1:5000/ai

### Request Format

```json
{
  "task": "chatbot | compare | cv",
  "input": ...
}
```

### Response Format

```json
{
  "result": { ... }
}
```

## 🚀 How to Run

1. Install dependencies:

```
pip install flask flask-cors huggingface_hub
```

2. Run the server:

```
python main.py
```

3. Test using Postman or frontend.

## 📌 Notes

* Set `HUGGINGFACE_API_KEY` (and other provider keys) in the root `.env` file
* The server runs locally on port 5000
* See `.env.example` for all required environment variables

## 👨‍💻 Author

Youssef Gomaa
