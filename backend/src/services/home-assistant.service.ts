import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { HfInference } from "@huggingface/inference";
import { OpenAI } from "openai";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

// Initialize AI providers securely
let groq: Groq | null = null;
try {
  if (env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: env.GROQ_API_KEY });
    console.log("[AI-INIT] Groq initialized successfully");
  } else {
    console.log("[AI-INIT] Groq API key not found");
  }
} catch (e) {
  console.warn("[AI-INIT] Failed to initialize Groq:", e);
}

let openai: OpenAI | null = null;
try {
  if (env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    console.log("[AI-INIT] OpenAI initialized successfully");
  } else {
    console.log("[AI-INIT] OpenAI API key not found");
  }
} catch (e) {
  console.warn("[AI-INIT] Failed to initialize OpenAI:", e);
}

let gemini: GoogleGenerativeAI | null = null;
try {
  if (env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    console.log("[AI-INIT] Gemini initialized successfully");
  } else {
    console.log("[AI-INIT] Gemini API key not found");
  }
} catch (e) {
  console.warn("[AI-INIT] Failed to initialize Gemini:", e);
}

let hf: HfInference | null = null;
try {
  if (env.HUGGINGFACE_API_KEY) {
    hf = new HfInference(env.HUGGINGFACE_API_KEY);
    console.log("[AI-INIT] HuggingFace initialized successfully");
  } else {
    console.log("[AI-INIT] HuggingFace API key not found");
  }
} catch (e) {
  console.warn("[AI-INIT] Failed to initialize HuggingFace:", e);
}

interface ProviderResult {
  success: boolean;
  answer?: string;
  error?: string;
  provider?: string;
}

function detectLanguage(text: string): "en" | "ar" {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const isArabic = arabicRegex.test(text);
  console.log(`[AI-DEBUG] Language detection for "${text}": ${isArabic ? "Arabic" : "English"}`);
  return isArabic ? "ar" : "en";
}

function buildSystemPrompt(language: "en" | "ar"): string {
  const basePrompt = `You are PathFinder AI, a helpful and intelligent AI assistant. You help users with programming, career advice, and general questions.

ABSOLUTE LANGUAGE REQUIREMENT:
- User message language: ${language === "ar" ? "ARABIC" : "ENGLISH"}
- You MUST respond in: ${language === "ar" ? "ARABIC ONLY - لا ترد بالإنجليزية أبدًا" : "ENGLISH ONLY - never respond in Arabic"}
- NO EXCEPTIONS: If input is Arabic, output must be 100% Arabic
- NO EXCEPTIONS: If input is English, output must be 100% English
- Do not translate, do not mix languages, do not provide bilingual responses

Be helpful, accurate, and provide detailed responses when appropriate.`;

  return basePrompt;
}

// 1. OpenAI (Primary)
async function tryOpenAI(
  question: string,
  systemPrompt: string,
  history: Array<{ role: string; content: string }>
): Promise<ProviderResult> {
  if (!openai) return { success: false, error: "OpenAI not configured" };

  try {
    console.log(`[AI-DEBUG] Trying OpenAI for question: "${question.substring(0, 50)}..."`);

    const messages = history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
    messages.push({ role: "user", content: question });

    const response = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages] as any,
        temperature: 0.7,
        max_tokens: 2048,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("OpenAI timeout")), 15000)),
    ]);

    const answer = (response as any).choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("Empty response from OpenAI");

    console.log(`[AI-DEBUG] OpenAI SUCCESS - Response length: ${answer.length}`);
    console.log(`[AI-DEBUG] OpenAI Response preview: "${answer.substring(0, 100)}..."`);

    return { success: true, answer, provider: "OpenAI" };
  } catch (e) {
    console.log(`[AI-DEBUG] OpenAI FAILED: ${String(e)}`);
    return { success: false, error: String(e) };
  }
}

// 2. Groq (Fast)
async function tryGroq(
  question: string,
  systemPrompt: string,
  history: Array<{ role: string; content: string }>
): Promise<ProviderResult> {
  if (!groq) return { success: false, error: "Groq not configured" };

  try {
    console.log(`[AI-DEBUG] Trying Groq for question: "${question.substring(0, 50)}..."`);

    const messages = history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
    messages.push({ role: "user", content: question });

    const response = await Promise.race([
      groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 2048,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Groq timeout")), 12000)),
    ]);

    const answer = (response as any).choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("Empty response from Groq");

    console.log(`[AI-DEBUG] Groq SUCCESS - Response length: ${answer.length}`);
    console.log(`[AI-DEBUG] Groq Response preview: "${answer.substring(0, 100)}..."`);

    return { success: true, answer, provider: "Groq" };
  } catch (e) {
    console.log(`[AI-DEBUG] Groq FAILED: ${String(e)}`);
    return { success: false, error: String(e) };
  }
}

// 3. Gemini (Backup)
async function tryGemini(
  question: string,
  systemPrompt: string,
  history: Array<{ role: string; content: string }>
): Promise<ProviderResult> {
  if (!gemini) return { success: false, error: "Gemini not configured" };

  try {
    console.log(`[AI-DEBUG] Trying Gemini for question: "${question.substring(0, 50)}..."`);

    const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
    const messages = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: messages as any,
      systemInstruction: systemPrompt,
    });

    const response = await Promise.race([
      chat.sendMessage(question),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini timeout")), 15000)),
    ]);

    const answer = (response as any).response?.text?.()?.trim();
    if (!answer) throw new Error("Empty response from Gemini");

    console.log(`[AI-DEBUG] Gemini SUCCESS - Response length: ${answer.length}`);
    console.log(`[AI-DEBUG] Gemini Response preview: "${answer.substring(0, 100)}..."`);

    return { success: true, answer, provider: "Gemini" };
  } catch (e) {
    console.log(`[AI-DEBUG] Gemini FAILED: ${String(e)}`);
    return { success: false, error: String(e) };
  }
}

// 4. HuggingFace (Last resort)
async function tryHuggingFace(
  question: string,
  systemPrompt: string,
  history: Array<{ role: string; content: string }>
): Promise<ProviderResult> {
  if (!hf) return { success: false, error: "HuggingFace not configured" };

  try {
    console.log(`[AI-DEBUG] Trying HuggingFace for question: "${question.substring(0, 50)}..."`);

    const conversationText = [
      systemPrompt,
      ...history.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`),
      `User: ${question}`,
      "Assistant:",
    ].join("\n");

    const response = await Promise.race([
      hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        inputs: conversationText,
        parameters: { max_new_tokens: 1024, temperature: 0.7 },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("HuggingFace timeout")), 15000)),
    ]);

    const answer = (response as any).generated_text?.split("Assistant:")?.pop()?.trim();
    if (!answer) throw new Error("Empty response from HuggingFace");

    console.log(`[AI-DEBUG] HuggingFace SUCCESS - Response length: ${answer.length}`);
    console.log(`[AI-DEBUG] HuggingFace Response preview: "${answer.substring(0, 100)}..."`);

    return { success: true, answer, provider: "HuggingFace" };
  } catch (e) {
    console.log(`[AI-DEBUG] HuggingFace FAILED: ${String(e)}`);
    return { success: false, error: String(e) };
  }
}

export const homeAssistantService = async (input: {
  question: string;
  language?: "en" | "ar";
  conversationHistory?: Array<{ role: string; content: string }>;
}): Promise<{ answer: string }> => {
  try {
    const detectedLanguage = input.language ?? detectLanguage(input.question);
    const { question, conversationHistory = [] } = input;
    const language = detectedLanguage;

    if (!question.trim()) throw new HttpError(400, "Empty question");

    console.log(`\n======================================`);
    console.log(`[AI-DEBUG] INCOMING QUESTION: "${question}"`);
    console.log(`[AI-DEBUG] DETECTED LANGUAGE: ${language}`);
    console.log(`[AI-DEBUG] CONVERSATION HISTORY LENGTH: ${conversationHistory.length}`);
    console.log(`======================================`);

    // Simple system prompt - no intent classification
    const systemPrompt = buildSystemPrompt(language);

    // Provider priority: For Arabic, prefer providers that handle Arabic better
    const providers = detectedLanguage === "ar" 
      ? [
          () => tryGemini(question, systemPrompt, conversationHistory), // Gemini often handles Arabic well
          () => tryOpenAI(question, systemPrompt, conversationHistory),
          () => tryGroq(question, systemPrompt, conversationHistory),
          () => tryHuggingFace(question, systemPrompt, conversationHistory),
        ]
      : [
          () => tryOpenAI(question, systemPrompt, conversationHistory),
          () => tryGroq(question, systemPrompt, conversationHistory),
          () => tryGemini(question, systemPrompt, conversationHistory),
          () => tryHuggingFace(question, systemPrompt, conversationHistory),
        ];

    for (const provider of providers) {
      const result = await provider();
      if (result.success && result.answer) {
        console.log(`[AI-DEBUG] SUCCESS with ${result.provider}`);
        return { answer: result.answer };
      }
    }

    // All providers failed
    console.error("[AI-DEBUG] ALL PROVIDERS FAILED");
    const errorMsg = language === "ar"
      ? "عذراً، جميع خدمات الذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة مرة أخرى."
      : "Sorry, all AI services are currently unavailable. Please try again later.";

    return { answer: errorMsg };

  } catch (error) {
    console.error("[AI-DEBUG] SERVICE ERROR:", error);
    if (error instanceof HttpError) throw error;

    const lang = input.language ?? detectLanguage(input.question);
    const errorMsg = lang === "ar"
      ? "حدث خطأ في خدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى."
      : "AI service error occurred. Please try again.";

    return { answer: errorMsg };
  }
};