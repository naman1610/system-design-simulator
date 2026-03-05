import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

/**
 * Model priority for fallback when rate limits are hit.
 * Order: Gemini 3 Flash -> Gemini 2.5 Flash
 * 
 * Based on Google AI documentation (March 2026):
 * - Gemini 3 Flash: "gemini-3-flash-preview" (frontier-class performance, preview)
 * - Gemini 2.5 Flash: "gemini-2.5-flash" (best price-performance, stable)
 */
const MODEL_PRIORITY = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
] as const;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      throw new Error(
        "GEMINI_API_KEY is not configured. Please set it in .env.local"
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Checks if an error should trigger fallback to the next model.
 * This includes rate limits, quota issues, and model configuration errors.
 */
function shouldTryNextModel(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const errorStr = error.message.toLowerCase();
  const errorJson = JSON.stringify(error).toLowerCase();
  
  // Rate limit indicators
  const isRateLimit = 
    errorStr.includes("429") ||
    errorStr.includes("rate limit") ||
    errorStr.includes("rate_limit") ||
    errorStr.includes("resource_exhausted") ||
    errorStr.includes("quota exceeded") ||
    errorStr.includes("quota") ||
    errorStr.includes("too many requests") ||
    errorJson.includes("429") ||
    errorJson.includes("resource_exhausted");
  
  // Model configuration/availability errors that suggest we should try another model
  const isConfigError =
    errorStr.includes("not enabled") ||
    errorStr.includes("not found") ||
    errorStr.includes("not available") ||
    errorStr.includes("model not supported") ||
    errorStr.includes("invalid model") ||
    errorStr.includes("developer instruction is not enabled");
  
  return isRateLimit || isConfigError;
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const client = getClient();
  let lastError: Error | null = null;

  // Try each model in priority order
  for (const modelName of MODEL_PRIORITY) {
    try {
      console.log(`[AI] Attempting to use model: ${modelName}`);
      
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userPrompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Empty response from API");
      }

      console.log(`[AI] ✓ Successfully used model: ${modelName}`);
      return text;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[AI] Model ${modelName} failed:`, lastError.message);
      
      if (shouldTryNextModel(lastError)) {
        console.log(
          `[AI] Error detected for ${modelName}, trying next model...`
        );
        // Continue to try the next model in the priority list
        continue;
      } else {
        // For critical errors (auth issues, etc.), throw immediately
        throw lastError;
      }
    }
  }

  // If we get here, all models failed
  throw new Error(
    `All models exhausted. Last error: ${lastError?.message}. ` +
    `Tried models: ${MODEL_PRIORITY.join(", ")}`
  );
}
