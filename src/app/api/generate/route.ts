import { NextRequest, NextResponse } from "next/server";
import { generateDesign } from "@/lib/ai/parser";

// Simple in-memory rate limiter for MVP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'prompt' field" },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: "Prompt too long (max 500 characters)" },
        { status: 400 }
      );
    }

    const result = await generateDesign(prompt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generation error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
