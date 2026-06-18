def handle_fallback(task_name, raw_result):
    # Instead of generating fake/hallucinated data, we return a structural placeholder
    # that clearly informs the frontend that the AI service is temporarily down,
    # ensuring the UI still renders correctly without breaking JSON parsing.
    
    error_msg = "Our AI services are currently experiencing high traffic and are temporarily unavailable. Please try again in a moment."
    
    if task_name == "compare":
        return {
            "overview": { "career1": error_msg, "career2": error_msg },
            "difficulty": { "career1": "N/A", "career2": "N/A" },
            "requiredLanguages": { "career1": ["Service Unavailable"], "career2": ["Service Unavailable"] },
            "frameworks": { "career1": ["Service Unavailable"], "career2": ["Service Unavailable"] },
            "salaryRange": { "career1": "N/A", "career2": "N/A" },
            "demand": { "career1": "N/A", "career2": "N/A" },
            "remoteOpportunities": { "career1": "N/A", "career2": "N/A" },
            "timeToLearn": { "career1": "N/A", "career2": "N/A" },
            "personalityType": { "career1": "N/A", "career2": "N/A" },
            "futureGrowth": { "career1": "N/A", "career2": "N/A" },
            "aiRisk": { "career1": "N/A", "career2": "N/A" },
            "freelancePotential": { "career1": "N/A", "career2": "N/A" },
            "recommendedForBeginners": { "career1": "N/A", "career2": "N/A" },
            "prosCons": {
                "career1": { "pros": ["N/A"], "cons": ["N/A"] },
                "career2": { "pros": ["N/A"], "cons": ["N/A"] }
            },
            "finalRecommendation": error_msg
        }
        
    elif task_name == "chatbot":
        return {
            "careerOverview": error_msg,
            "skillsToLearn": ["Service Unavailable"],
            "recommendedMajors": ["Service Unavailable"],
            "learningPlan": [
                {
                    "step": 1,
                    "title": "Service Temporarily Unavailable",
                    "description": "What to learn: N/A\nHow to learn: N/A\nTools: N/A\nProject: N/A",
                    "duration": "N/A"
                }
            ],
            "alternativePaths": [
                { "career": "Service Unavailable", "reason": "N/A" }
            ],
            "salaryExpectations": {
                "junior": "N/A",
                "mid": "N/A",
                "senior": "N/A",
                "freelance": "N/A"
            },
            "jobOpportunities": [
                { "title": "Service Unavailable", "remote": "N/A" }
            ],
            "prosAndCons": {
                "pros": ["N/A"],
                "cons": ["N/A"]
            },
            "freeResources": [
                { "name": "Service Unavailable", "url": "#", "type": "N/A" }
            ],
            "motivationalAdvice": error_msg,
            "finalRecommendation": error_msg
        }
        
    elif task_name == "cv":
        return {
            "personalInfo": {
                "fullName": "Service Unavailable", "professionalTitle": "Service Unavailable", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": ""
            },
            "summary": error_msg,
            "technicalSkills": ["Service Unavailable"],
            "softSkills": ["Service Unavailable"],
            "languages": ["Service Unavailable"],
            "experience": [],
            "internships": [],
            "projects": [],
            "education": [],
            "certifications": [],
            "training": [],
            "achievements": [],
            "volunteerWork": []
        }
        
    return {"verdict": error_msg}
