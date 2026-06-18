import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

from services.roadmap_service import generate_roadmap_service
from services.compare_service import compare_service
from services.resume_service import generate_resume_service
from orchestrator.fallback_manager import handle_fallback

app = Flask(__name__)
CORS(app)

def format_roadmap_input(data):
    if not isinstance(data, dict):
        return str(data)
    goal = data.get("careerGoal") or data.get("goal") or data.get("field") or "Technology"
    parts = [f"Career goal: {goal}"]
    if data.get("field") and data.get("field") != goal:
        parts.append(f"Field of interest: {data['field']}")
    skills = data.get("skills")
    if skills:
        if isinstance(skills, list):
            parts.append(f"Skills: {', '.join(str(s) for s in skills)}")
        else:
            parts.append(f"Skills: {skills}")
    if data.get("profileSkills"):
        parts.append(f"Profile skills: {data['profileSkills']}")
    if data.get("experience"):
        parts.append(f"Experience level: {data['experience']}")
    if data.get("level"):
        parts.append(f"Expertise level: {data['level']}")
    if data.get("education"):
        parts.append(f"Education: {data['education']}")
    if data.get("university"):
        parts.append(f"University: {data['university']}")
    if data.get("specialization"):
        parts.append(f"Specialization: {data['specialization']}")
    if data.get("challenges"):
        parts.append(f"Background and challenges: {data['challenges']}")
    return "\n".join(parts)

def ai_router(task, data):
    language = data.get("language", "en") if isinstance(data, dict) else "en"
    if task == "chatbot":
        user_input = format_roadmap_input(data) if isinstance(data, dict) else str(data)
        return generate_roadmap_service(user_input, language)
    elif task == "compare":
        return compare_service(data.get("track1", "Path 1"), data.get("track2", "Path 2"), language)
    elif task == "cv":
        return generate_resume_service(data, language)
    else:
        raise ValueError("Unknown task")

@app.route("/ai", methods=["POST"])
def ai():
    try:
        data = request.json
        task_name = data.get("task", "")
        res_str = ai_router(task_name, data.get("input", {}))
        
        try:
            parsed = json.loads(res_str, strict=False)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', res_str, re.DOTALL)
            if match:
                parsed = json.loads(match.group(0), strict=False)
            else:
                raise ValueError("Failed to parse JSON completely")
        
        return jsonify({"result": parsed})
        
    except Exception as e:
        traceback.print_exc()
        # Ensure task_name is captured from request or defaults to empty
        req_data = request.json if request.is_json else {}
        task_name = req_data.get("task", "")
        
        # We invoke the fallback manager instead of crashing or serving fake dictionary intelligence
        fallback_res = handle_fallback(task_name, str(e))
        return jsonify({"result": fallback_res})

if __name__ == "__main__":
    app.run(port=5000)