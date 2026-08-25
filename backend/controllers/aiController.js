import { generateDSAHelp } from "../services/geminiServices.js";

export const analyzeProblem = async (req, res) => {
  try {
    const { title, description, platform, url, difficulty } = req.body || {};

    if (!title && !description) {
      return res.status(400).json({ error: "A problem title or description is required." });
    }

    const result = await generateDSAHelp({
      title: title || "Untitled problem",
      description: description || "",
      platform: platform || "Unknown",
      url: url || "",
      difficulty: difficulty || "",
    });

    return res.json(result);
  } catch (error) {
    console.error("analyzeProblem failed:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate hints from Gemini.",
    });
  }
};