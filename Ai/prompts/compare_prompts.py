def get_compare_prompt(track1, track2, language="en"):
    lang_prompt = "\nCRITICAL: You MUST write the ENTIRE response in Arabic." if language == "ar" else "\nCRITICAL: You MUST write the ENTIRE response in English."
    return f"""
You are an expert AI career advisor. Compare the career path of {track1} versus {track2}. Provide a FULL, extremely detailed comparison.
{lang_prompt}

You MUST return ONLY strict JSON format. DO NOT include any conversational text or explanations outside the JSON.
You MUST fill ALL fields completely. NEVER use "-", "N/A", or empty strings. Provide FULL DATA for both careers.

Data requirements:
- overview: Detailed overview of each path.
- difficulty: Difficulty level and reasoning.
- requiredLanguages: Programming languages needed.
- frameworks: Frameworks and tools needed.
- salaryRange: Salary comparison (actual numbers).
- demand: Demand in market.
- remoteOpportunities: Remote work potential.
- timeToLearn: Estimated time to learn.
- personalityType: Best for which personality type.
- futureGrowth: Future growth and potential.
- aiRisk: AI automation risk.
- freelancePotential: Freelance potential.
- recommendedForBeginners: Is it recommended for beginners? (Yes/No with short reason).
- prosCons: Side-by-side pros and cons.
- finalRecommendation: Final recommendation string.

Return exactly this JSON structure and absolutely nothing else:
{{
"overview": {{ "career1": "...", "career2": "..." }},
"difficulty": {{ "career1": "...", "career2": "..." }},
"requiredLanguages": {{ "career1": ["..."], "career2": ["..."] }},
"frameworks": {{ "career1": ["..."], "career2": ["..."] }},
"salaryRange": {{ "career1": "...", "career2": "..." }},
"demand": {{ "career1": "...", "career2": "..." }},
"remoteOpportunities": {{ "career1": "...", "career2": "..." }},
"timeToLearn": {{ "career1": "...", "career2": "..." }},
"personalityType": {{ "career1": "...", "career2": "..." }},
"futureGrowth": {{ "career1": "...", "career2": "..." }},
"aiRisk": {{ "career1": "...", "career2": "..." }},
"freelancePotential": {{ "career1": "...", "career2": "..." }},
"recommendedForBeginners": {{ "career1": "...", "career2": "..." }},
"prosCons": {{
    "career1": {{ "pros": ["..."], "cons": ["..."] }},
    "career2": {{ "pros": ["..."], "cons": ["..."] }}
}},
"finalRecommendation": "..."
}}
"""
