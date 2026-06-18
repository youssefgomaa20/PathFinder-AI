import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5000/ai';

// Simple in-memory cache
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const normalizeAiInput = (task: string, input: Record<string, unknown>): Record<string, unknown> => {
  if (task !== "chatbot") return input;
  const goal =
    (input.careerGoal as string) ||
    (input.goal as string) ||
    (input.field as string) ||
    "Technology";
  return {
    ...input,
    careerGoal: goal,
    goal,
    field: (input.field as string) || goal
  };
};

export const callAI = async (task: string, input: any): Promise<any> => {
  try {
    const normalized = normalizeAiInput(task, input ?? {});
    const cacheKey = JSON.stringify({ task, input: normalized });
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[AI Cache Hit] Task: ${task}`);
      return cached.data;
    }

    const response = await axios.post(AI_SERVICE_URL, {
      task,
      input: normalized
    }, {
      timeout: 120000 // 120 seconds
    });

    if (response.data && response.data.result) {
      const resData = response.data.result;
      
      if (resData.verdict) {
        throw new Error(String(resData.verdict));
      }
      
      if (task === 'chatbot' && !resData.careerOverview) {
        throw new Error("Missing careerOverview in AI response");
      }
      if (task === 'compare' && !resData.overview) {
        throw new Error("Missing overview in AI response");
      }
      if (task === 'cv' && !resData.summary) {
        throw new Error("Missing summary in AI response");
      }

      cache.set(cacheKey, { data: resData, timestamp: Date.now() });
      return resData;
    }

    throw new Error("Invalid response format from AI Service");
  } catch (error) {
    console.error(`[AI Service Error - Task: ${task}]:`, error instanceof Error ? error.message : error);

    // Return safe fallback responses structured for the frontend
    if (task === 'chatbot') {
      return {
        careerOverview: "AI service is currently unavailable. We could not generate a real roadmap.",
        skillsToLearn: ["N/A"],
        recommendedMajors: ["N/A"],
        learningPlan: [
          { step: 1, title: "Service Unavailable", description: "Please try again later.", duration: "N/A" }
        ],
        freeResources: [
          { name: "N/A", url: "#", type: "N/A" }
        ],
        alternativePaths: [
          { career: "N/A", reason: "AI service error" }
        ],
        salaryExpectations: { junior: "N/A", mid: "N/A", senior: "N/A" },
        motivationalAdvice: "Don't give up! Check back later when our AI is back online."
      };
    }

    if (task === 'compare') {
      const t1 = input?.track1 || "Career 1";
      const t2 = input?.track2 || "Career 2";
      return {
        overview: { career1: "Information temporarily unavailable.", career2: "Information temporarily unavailable." },
        difficulty: { career1: "Varies", career2: "Varies" },
        requiredLanguages: { career1: ["Check back later"], career2: ["Check back later"] },
        frameworks: { career1: ["Pending API"], career2: ["Pending API"] },
        salaryRange: { career1: "Competitive", career2: "Competitive" },
        demand: { career1: "High", career2: "High" },
        remoteOpportunities: { career1: "Varies", career2: "Varies" },
        timeToLearn: { career1: "Varies by background", career2: "Varies by background" },
        personalityType: { career1: "Adaptive", career2: "Adaptive" },
        futureGrowth: { career1: "Strong", career2: "Strong" },
        aiRisk: { career1: "Moderate", career2: "Moderate" },
        freelancePotential: { career1: "Good", career2: "Good" },
        recommendedForBeginners: { career1: "Depends on dedication", career2: "Depends on dedication" },
        prosCons: {
          career1: { pros: ["Opportunities for growth"], cons: ["Continuous learning required"] },
          career2: { pros: ["Opportunities for growth"], cons: ["Continuous learning required"] }
        },
        finalRecommendation: "AI service is temporarily busy. Please wait a moment and try again."
      };
    }

    if (task === 'cv') {
      return {
        personalInfo: { fullName: "Service Unavailable", professionalTitle: "Please try again later.", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
        summary: "AI service is currently down or took too long to respond. We could not generate a real resume.",
        technicalSkills: ["N/A"],
        softSkills: ["N/A"],
        languages: ["N/A"],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
        training: []
      };
    }

    // Generic fallback
    return {
      error: true,
      message: "AI service is currently unavailable. Please try again later."
    };
  }
};
