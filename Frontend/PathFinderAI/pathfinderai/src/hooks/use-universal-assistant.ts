// src/hooks/use-universal-assistant.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { apiFetch, apiUrl } from "@/lib/http.js";
import { readApiErrorMessage } from "@/lib/auth.js";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface UseUniversalAssistantReturn {
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (question: string, language?: "en" | "ar") => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  setMessages: (messages: ConversationMessage[]) => void;
}

/**
 * Auto-detect language from text input
 * More robust detection: Arabic characters, common Arabic words, script detection
 */
function detectLanguage(text: string): "en" | "ar" {
  // Arabic Unicode range check (includes all Arabic scripts)
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text) ? "ar" : "en";
}

/**
 * Format error message for user display
 */
function formatErrorMessage(error: string, language: "en" | "ar"): string {
  if (language === "ar") {
    if (error.includes("temporarily")) return "الخدمة مشغولة حالياً. يرجى المحاولة مرة أخرى.";
    if (error.includes("unavailable")) return "جميع خدمات الذكاء الاصطناعي غير متاحة حالياً.";
    if (error.includes("timeout")) return "الطلب استغرق وقتاً طويلاً. يرجى المحاولة مرة أخرى.";
    if (error.includes("network")) return "خطأ في الاتصال. تحقق من الإنترنت وحاول مرة أخرى.";
    return "عذراً، حدث خطأ ما. يرجى المحاولة لاحقاً.";
  }

  if (error.includes("temporarily")) return "Service is busy. Please try again.";
  if (error.includes("unavailable")) return "All AI services are currently unavailable.";
  if (error.includes("timeout")) return "Request took too long. Please try again.";
  if (error.includes("network")) return "Network error. Check your connection and try again.";
  return "Something went wrong. Please try again later.";
}

export function useUniversalAssistant(): UseUniversalAssistantReturn {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ConversationMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = useCallback(
    async (question: string, language?: "en" | "ar") => {
      if (!question.trim()) return;

      setError(null);
      setIsLoading(true);

      try {
        // Auto-detect language if not provided
        const detectedLanguage = language || detectLanguage(question);

        // Add user message to history immediately
        const userMessage: ConversationMessage = {
          role: "user",
          content: question,
        };
        setMessages((prev) => [...prev, userMessage]);

        // Prepare conversation history (limit to last 8 messages for context and performance)
        const conversationHistory = [...messagesRef.current, userMessage].slice(-8);
        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        // Call the universal assistant API with proper error handling
        const response = await Promise.race([
          apiFetch(
            apiUrl("/api/home-assistant/chat"),
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                question,
                language: detectedLanguage,
                conversationHistory,
              }),
              signal: abortControllerRef.current.signal,
            }
          ),
          new Promise<Response>((_, reject) => 
            setTimeout(() => reject(new Error("Request timeout")), 40000)
          ),
        ]) as Response;

        if (!response.ok) {
          const errorMsg = await readApiErrorMessage(response);
          throw new Error(errorMsg || "Failed to get response from AI");
        }

        const data = (await response.json()) as {
          answer: string;
        };

        // Validate response shape strictly
        if (!data || typeof data !== "object" || !("answer" in data) || typeof (data as any).answer !== "string") {
          throw new Error("Invalid response format from server");
        }

        // Add assistant message to history
        const assistantMessage: ConversationMessage = {
          role: "assistant",
          content: data.answer,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        let errorMessage = "Failed to get response. Please try again.";

        if (err instanceof Error) {
          if (err.name === "AbortError") {
            errorMessage = "Request was cancelled";
          } else {
            errorMessage = err.message;
          }
        }

        // Format error message for user
        const displayError = formatErrorMessage(errorMessage, language || "en");
        setError(displayError);

        // Remove the user message on error
        setMessages((prev) => prev.slice(0, -1));

        console.error("[Assistant Error]", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    abortControllerRef.current?.abort();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    clearError,
    setMessages,
  };
}
