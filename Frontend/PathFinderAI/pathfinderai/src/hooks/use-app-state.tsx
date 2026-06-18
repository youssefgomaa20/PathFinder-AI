import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light";

export interface RoadmapData {
  careerOverview?: string;
  skillsToLearn?: string[];
  recommendedMajors?: string[];
  alternativePaths?: { career: string; reason: string }[];
  learningPlan?: { step: number; title: string; description: string; duration: string }[];
  salaryExpectations?: { junior: string; mid: string; senior: string; freelance?: string };
  jobOpportunities?: { title: string; remote: string }[];
  prosAndCons?: { pros: string[]; cons: string[] };
  freeResources?: { name: string; url: string; type: string }[];
  finalRecommendation?: string;
  motivationalAdvice?: string;
}


interface AppState {
  theme: Theme;
  currentRoadmap: RoadmapData | null;
  currentCompare: any | null;
  currentResume: any | null;
  currentChat: any | null;
  triggerAssistantOpen: boolean;
  setTheme: (theme: Theme) => void;
  setCurrentRoadmap: (data: RoadmapData | null) => void;
  updateCurrentRoadmap: (data: Partial<RoadmapData>) => void;
  setCurrentCompare: (data: any | null) => void;
  setCurrentResume: (data: any | null) => void;
  setCurrentChat: (data: any | null) => void;
  setTriggerAssistantOpen: (open: boolean) => void;
}

export const useAppState = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      currentRoadmap: null,
      currentCompare: null,
      currentResume: null,
      currentChat: null,
      triggerAssistantOpen: false,
      setTheme: (theme) => {
        set({ theme });
        if (theme === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      },
      setCurrentRoadmap: (data) => set({ currentRoadmap: data }),
      updateCurrentRoadmap: (data) =>
        set((state) => ({
          currentRoadmap: state.currentRoadmap
            ? { ...state.currentRoadmap, ...data }
            : (data as RoadmapData)
        })),
      setCurrentCompare: (data) => set({ currentCompare: data }),
      setCurrentResume: (data) => set({ currentResume: data }),
      setCurrentChat: (data) => set({ currentChat: data }),
      setTriggerAssistantOpen: (triggerAssistantOpen) => set({ triggerAssistantOpen })
    }),
    {
      name: "pathfinder-storage",
      partialize: (state) => ({
        theme: state.theme
      }),
      merge: (persistedState, currentState) => {
        const p = (persistedState ?? {}) as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { language: _removed, ...rest } = p as { language?: unknown };
        return { ...currentState, ...rest } as AppState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.theme === "dark") document.documentElement.classList.add("dark");
          else document.documentElement.classList.remove("dark");
        }
      }
    }
  )
);
