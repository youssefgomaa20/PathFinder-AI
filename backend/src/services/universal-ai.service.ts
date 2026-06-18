import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { HfInference } from "@huggingface/inference";
import { OpenAI } from "openai";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

// Initialize AI providers
let groq: Groq | null = null;
try {
  if (env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: env.GROQ_API_KEY });
  }
} catch (e) {
  console.warn("[Groq Init] Failed to initialize Groq:", e instanceof Error ? e.message : String(e));
}

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
const hf = env.HUGGINGFACE_API_KEY ? new HfInference(env.HUGGINGFACE_API_KEY) : null;

interface ProviderResult {
  success: boolean;
  answer?: string;
  error?: string;
  provider?: string;
}

/**
 * Build system prompt for universal assistant
 */
function buildSystemPrompt(language: "en" | "ar"): string {
  const basePrompt = `You are PathFinder AI, an elite, professional career advisor and technical mentor. 

YOUR CORE MISSION:
Provide high-quality, actionable, and specific advice related to careers, software engineering, technical skills, interviews, and professional development.

STRICT BOUNDARIES & HALLUCINATION PREVENTION:
1. IF the user asks a completely unrelated, random, or nonsensical question (e.g., recipes, fictional stories, unrelated trivia), you MUST politely decline to answer and guide them back to career, education, or technical topics. Do NOT attempt to answer unrelated queries.
2. DO NOT hallucinate facts, job market data, or technical details. If you don't know something, state it clearly.
3. DO NOT provide shallow, generic textbook definitions. Always provide deep, realistic, industry-relevant insights.
4. Base your advice on modern, real-world industry standards, not outdated concepts.

EXPERTISE AREAS:
• Career & Professional Guidance: Job search, resumes, ATS optimization, career roadmaps, interviews.
• Programming & Technology: Code debugging, system design, modern frameworks, best practices.
• AI, Tech & Engineering: Deep technical explanations and realistic roadmaps.

QUALITY & FORMATTING REQUIREMENTS:
✓ CLARITY: Explain complex topics simply but maintain technical accuracy.
✓ CONCISENESS & DEPTH: Be direct but thorough. Avoid fluff.
✓ ACTIONABILITY: Provide realistic next steps.
✓ STRUCTURE: Use clear markdown, bullet points, and paragraphs.
✓ TONE: Professional, encouraging, and authoritative.`;

  if (language === "ar") {
    return `${basePrompt}

⚠️ CRITICAL FOR ARABIC RESPONSES:
• RESPOND ENTIRELY IN ARABIC - do not mix English words
• Use proper Arabic grammar and structure (فصحى or modern Arabic)
• Format clearly with appropriate Arabic punctuation
• Maintain professional tone while being culturally appropriate
• If code or technical terms must be included, use transliteration or explanation`;
  }

  return `${basePrompt}

⚠️ CRITICAL FOR ENGLISH RESPONSES:
• Respond in clear, professional English
• Use proper grammar, spelling, and professional terminology
• Maintain a professional yet approachable tone`;
}

/**
 * Try to get answer from Groq (fastest, best for homepage)
 */
async function tryGroq(
  question: string,
  systemPrompt: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<ProviderResult> {
  if (!groq) return { success: false, error: "Groq not configured" };

  try {
    const messages = conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
    messages.push({ role: "user" as const, content: question });

    const response = await Promise.race([
      groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Groq timeout")), 12000)),
    ]);

    const answer = (response as any).choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("Empty response from Groq");

    return { success: true, answer, provider: "Groq" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`[Groq Error] ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Try to get answer from OpenAI (reliable, good quality)
 */
async function tryOpenAI(
  question: string,
  systemPrompt: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<ProviderResult> {
  if (!openai) return { success: false, error: "OpenAI not configured" };

  try {
    const messages = conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
    messages.push({ role: "user" as const, content: question });

    const response = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ] as any,
        temperature: 0.7,
        max_tokens: 1024,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("OpenAI timeout")), 15000)),
    ]);

    const answer = (response as any).choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("Empty response from OpenAI");

    return { success: true, answer, provider: "OpenAI" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`[OpenAI Error] ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Try to get answer from Gemini (backup, diverse knowledge)
 */
async function tryGemini(
  question: string,
  systemPrompt: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<ProviderResult> {
  if (!gemini) return { success: false, error: "Gemini not configured" };

  try {
    const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });

    const messages = conversationHistory.map((msg) => ({
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

    return { success: true, answer, provider: "Gemini" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`[Gemini Error] ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Try to get answer from HuggingFace (fallback for when others fail)
 */
async function tryHuggingFace(
  question: string,
  systemPrompt: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<ProviderResult> {
  if (!hf) return { success: false, error: "HuggingFace not configured" };

  try {
    const messages = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const conversationText = [
      systemPrompt,
      ...conversationHistory.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`),
      `User: ${question}`,
      "Assistant:",
    ].join("\n");

    const response = await Promise.race([
      hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        inputs: conversationText,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          top_p: 0.95,
        },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("HuggingFace timeout")), 15000)),
    ]);

    const answer = (response as any).generated_text?.split("Assistant:")?.pop()?.trim();
    if (!answer) throw new Error("Empty response from HuggingFace");

    return { success: true, answer, provider: "HuggingFace" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`[HuggingFace Error] ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Universal AI Assistant with multi-provider fallback
 * Priority: Groq → OpenAI → Gemini → HuggingFace
 */
export const universalAssistant = async (input: {
  question: string;
  language?: "en" | "ar";
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<{ answer: string }> => {
  try {
    const { question, language = "en", conversationHistory = [] } = input;

    if (!question.trim()) {
      throw new HttpError(400, "Question cannot be empty");
    }

    const systemPrompt = buildSystemPrompt(language);

    // Try providers in priority order (Advanced models first)
    const providers = [
      () => tryOpenAI(question, systemPrompt, conversationHistory),
      () => tryGemini(question, systemPrompt, conversationHistory),
      () => tryGroq(question, systemPrompt, conversationHistory),
      () => tryHuggingFace(question, systemPrompt, conversationHistory),
    ];

    const providerNames = ["OpenAI", "Gemini", "Groq", "HuggingFace"];
    for (let i = 0; i < providers.length; i++) {
      const providerName = providerNames[i];
      const provider = providers[i];
      console.log(`[Universal AI] Trying ${providerName}...`);
      const result = await provider();
      console.log(`[Universal AI] ${providerName} result:`, { success: result.success, error: result.error });
      if (result.success && result.answer) {
        console.log(`[Universal AI] ✓ Responded via ${result.provider || "unknown"}`);
        return { answer: result.answer };
      }
    }

    // All providers failed
    console.error("[Universal AI] ✗ All providers failed");
    throw new HttpError(
      503,
      "All AI services are temporarily unavailable. Please try again in a moment."
    );
  } catch (error) {
    if (error instanceof HttpError) throw error;

    console.error("[Universal AI Service Error]:", error);
    throw new HttpError(503, "The AI assistant is temporarily busy. Please try again.");
  }
};

