// src/hooks/use-roadmap-stream.ts
import { useState } from "react";
import { useAppState } from "./use-app-state.js";
import type { RoadmapData } from "./use-app-state.js";
import { apiFetch, apiUrl } from "@/lib/http.js";
import { readApiErrorMessage } from "@/lib/auth.js";

export interface RoadmapPayload {
  careerGoal: string;
  skills?: string[];
  experience?: string;
  [key: string]: unknown; 
}

export function useRoadmapStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const setCurrentRoadmap = useAppState((s) => s.setCurrentRoadmap);

  const startStream = async (payload: RoadmapPayload) => {
    setIsStreaming(true);
    setIsComplete(false);
    setStreamText("");
    setError(null);
    setCurrentRoadmap(null);

    try {
      const { careerGoal, skills, experience, ...rest } = payload;
      const response = await apiFetch(apiUrl("/api/pathfinder/career-roadmap"), {
        method: "POST",
        body: JSON.stringify({
          careerGoal: careerGoal || "General IT",
          field: careerGoal || "General IT",
          skills: skills || [],
          experience: experience || rest.educationLevel || "",
          challenges: rest.challenges || "",
          language: rest.language || "en"
        })
      });

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response));
      }

      const parsed = (await response.json()) as RoadmapData;
      setCurrentRoadmap(parsed);
      setStreamText("Roadmap generated successfully.");
      setIsComplete(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsStreaming(false);
    }
  };

  return { startStream, isStreaming, isComplete, streamText, error };
}