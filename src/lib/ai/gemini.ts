import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

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

export async function callGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
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
    throw new Error("Empty response from Gemini API");
  }

  return text;
}
