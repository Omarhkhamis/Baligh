import { NextRequest, NextResponse } from "next/server";
import { SchemaType } from "@google/generative-ai";
import { HSIE_SYRIA_SYSTEM_PROMPT } from "@/lib/prompts";
import { getGeminiClient } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

type RiskLevelType = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const mapRiskLevel = (violationType?: string | null): RiskLevelType => {
    const value = (violationType || "").toUpperCase();
    if (value === "A") return "CRITICAL";
    if (value === "B") return "HIGH";
    if (value === "C") return "MEDIUM";
    if (value === "D" || value === "NONE" || value === "SAFE") return "LOW";
    return "LOW";
};

export async function POST(req: NextRequest) {
  try {
    const { text, image, locale = "ar" } = await req.json();

    // Map locale to language name for the prompt
    const languageMap: { [key: string]: string } = {
      ar: "Arabic",
      en: "English",
      ku: "Kurdish (Kurmanji)",
    };
    const targetLanguage = languageMap[locale] || "Arabic";

    // Allow text OR image, or both
    if (!text && !image) {
      return NextResponse.json(
        { error: "Text or Image is required" },
        { status: 400 }
      );
    }

    const client = getGeminiClient();

    const options = {
      systemInstruction: HSIE_SYRIA_SYSTEM_PROMPT(targetLanguage),
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            classification: {
              type: SchemaType.STRING,
              enum: [
                "Safe",
                "Category A",
                "Category B",
                "Category C",
                "Category D",
              ],
            },
            violation_type: {
              type: SchemaType.STRING,
              enum: ["None", "A", "B", "C", "D"],
            },
            is_identity_based: {
              type: SchemaType.STRING,
              enum: ["Yes", "No"],
            },
            severity_score: { type: SchemaType.NUMBER },
            target_group_arabic: { type: SchemaType.STRING },
            rationale_arabic: { type: SchemaType.STRING },
            awareness_note_arabic: { type: SchemaType.STRING },
            image_description: { type: SchemaType.STRING },
          },
          required: [
            "classification",
            "violation_type",
            "is_identity_based",
            "severity_score",
            "rationale_arabic",
            "target_group_arabic",
            "awareness_note_arabic",
          ],
        },
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    };

    const promptParts: any[] = [];
    if (text) promptParts.push(text);
    if (image) {
      // image is expected to be base64 string without data prefix, or we strip it
      const base64Data = image.split(",")[1] || image;
      promptParts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg", // Assuming jpeg or png, Gemini handles standard formats
        },
      });
      promptParts.push(
        "Describe the visual content of the image in the 'image_description' field. Focus on elements relevant to hate speech or violence if present."
      );
    }

    const result = await client.generateContent(
        "gemini-3-flash-preview",
        promptParts,
        options
    );

    const responseText = result.response.text();
    const analysis = JSON.parse(responseText);

    // Persist the analysis so it shows in the dashboard
    try {
        const rawSeverity =
            typeof analysis.severity_score === "number"
                ? analysis.severity_score
                : (() => {
                    const raw = analysis?.scores?.intensity;
                    if (typeof raw === "string") {
                        const parsed = parseInt(raw.split("/")[0] || "0", 10);
                        return Number.isNaN(parsed) ? 0 : parsed;
                    }
                    return Number(raw ?? 0);
                })();

        // confidenceScore is DECIMAL(5,4) => clamp to max 9.9999 to avoid overflow
        const severity = Math.max(0, Math.min(rawSeverity, 9.9999));

        const riskLevel = mapRiskLevel(
            analysis.violation_type ??
            analysis.risk_level ??
            analysis.classification
        );

        const detectedMarkers = analysis.detected_markers || [];
        if (detectedMarkers.length === 0 && analysis.target_group_arabic) {
            detectedMarkers.push(analysis.target_group_arabic);
        }

        await prisma.analysisLog.create({
            data: {
                inputText: text || "",
                classification: analysis.classification || "Unknown",
                riskLevel,
                confidenceScore: severity,
                detectedKeywords: detectedMarkers,
                aiScores: {
                    ...analysis,
                    // Normalize fields for admin UI
                    speech_type: analysis.speech_type || analysis.classification,
                    rationale: analysis.rationale_arabic || analysis.rationale || analysis.awareness_note_arabic || "",
                    target_group: analysis.target_group_arabic || analysis.target_group || "",
                    target_group_label: analysis.target_group_arabic || analysis.target_group || "",
                    risk_label: riskLevel,
                    locale,
                    has_image: Boolean(image),
                },
            },
        });
    } catch (dbError) {
        console.error("Error saving analysis log:", dbError);
    }

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("Error in /api/classify:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: errorMessage || "Internal Server Error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
