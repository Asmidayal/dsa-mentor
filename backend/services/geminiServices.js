import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are DSA Mentor, a strict interview coach.
Return ONLY valid JSON with this shape:
{
  "hints": [
    { "title": "Pattern", "body": "high-level pattern or observation, no code" },
    { "title": "Approach", "body": "algorithm outline and data structures, still no full code" },
    { "title": "Key insight", "body": "the trick that unlocks the solution, almost spoils it, still no complete code" }
  ],
  "solution": {
    "explanation": "clear walkthrough of the final approach",
    "language": "C++",
    "code": "complete, runnable C++ solution"
  },
  "complexity": {
    "time": "O(...)",
    "space": "O(...)",
    "explanation": "why those bounds are correct"
  }
}

Rules:
- Exactly 3 hints, progressive from gentle to specific.
- Do not put full source code in hints.
- Prefer C++  for solution.code.
- Keep bodies concise (2-3 sentences).
- If the statement is incomplete, still give the most likely standard solution and say the assumption in explanation.`;

function extractJson(text) {
  const trimmed = (text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Gemini did not return JSON.");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function normalize(payload) {
  const hints = Array.isArray(payload.hints) ? payload.hints.slice(0, 3) : [];
  while (hints.length < 3) {
    hints.push({
      title: `Hint ${hints.length + 1}`,
      body: "Think about the constraints and which pattern fits.",
    });
  }

  return {
    hints: hints.map((hint, index) => ({
      title: hint.title || `Hint ${index + 1}`,
      body: hint.body || hint.text || String(hint),
    })),
    solution: {
      explanation: payload.solution?.explanation || "",
      language: payload.solution?.language || "python",
      code: payload.solution?.code || "",
    },
    complexity: {
      time: payload.complexity?.time || "O(n)",
      space: payload.complexity?.space || "O(1)",
      explanation: payload.complexity?.explanation || "",
    },
  };
}

export async function generateDSAHelp(problem) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("Missing GEMINI_API_KEY in backend/.env");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const userPrompt = `Platform: ${problem.platform}
Difficulty: ${problem.difficulty || "unspecified"}
URL: ${problem.url}

Title: ${problem.title}

Problem statement:
${problem.description}`;

  const response = await ai.models.generateContent({
    model,
    contents: `${SYSTEM_PROMPT}\n\n${userPrompt}`,
    config: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  const text = response.text || "";
  return normalize(extractJson(text));
}