"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { AnalysisResult } from "@/lib/report-generator";
import { getSeverityScoreOutOfFive } from "@/lib/analysis-utils";
import FeedbackModal from "@/components/FeedbackModal";

type ResultsDisplayProps = {
  result: AnalysisResult;
  mode?: "analysis" | "report";
  reportNumber?: string | null;
  embedded?: boolean;
  compact?: boolean;
};

type ClassificationKind = "explicit" | "implicit" | "incitement" | "none" | "failed";
type ReportPathKind = "legal_action" | "documentation" | "monitoring" | "no_action";

type ClassificationMeta = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  labelKey: string;
};

const classificationStyles: Record<ClassificationKind, ClassificationMeta> = {
  explicit: {
    backgroundColor: "#FCEBEB",
    borderColor: "#F09595",
    textColor: "#A32D2D",
    labelKey: "explicit",
  },
  implicit: {
    backgroundColor: "#FAEEDA",
    borderColor: "#FAC775",
    textColor: "#633806",
    labelKey: "implicit",
  },
  incitement: {
    backgroundColor: "#FEF0E7",
    borderColor: "#EFBF72",
    textColor: "#D35400",
    labelKey: "incitement",
  },
  none: {
    backgroundColor: "#F5F5F5",
    borderColor: "#CCCCCC",
    textColor: "#555555",
    labelKey: "none",
  },
  failed: {
    backgroundColor: "#F5F5F5",
    borderColor: "#CCCCCC",
    textColor: "#555555",
    labelKey: "failed",
  },
};

export default function ResultsDisplay({
  result,
  mode = "analysis",
  reportNumber,
  embedded = false,
  compact = false,
}: ResultsDisplayProps) {
  const tResults = useTranslations("results");
  const tReport = useTranslations("reportFlow.results");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const getClassificationKind = (): ClassificationKind => {
    const directClassification =
      (
        result as AnalysisResult & {
          aiClassification?: string;
        }
      ).aiClassification || result.ai_classification;
    const normalizedAiClassification = String(directClassification || "")
      .trim()
      .toLowerCase();

    if (normalizedAiClassification === "explicit") return "explicit";
    if (normalizedAiClassification === "implicit") return "implicit";
    if (normalizedAiClassification === "incitement") return "incitement";
    if (normalizedAiClassification === "none") return "none";

    const violationType = String(result.violation_type || "").trim().toUpperCase();
    if (violationType === "A" || violationType === "T") return "incitement";
    if (violationType === "B") return "explicit";
    if (violationType === "C" || violationType === "D") return "implicit";

    const normalizedClassification = String(result.classification || "")
      .trim()
      .toLowerCase();
    if (normalizedClassification.includes("incit")) return "incitement";
    if (normalizedClassification.includes("explicit")) return "explicit";
    if (normalizedClassification.includes("implicit")) return "implicit";
    return "none";
  };

  const rawSeverity =
    (
      result as AnalysisResult & {
        aiSeverity?: number;
      }
    ).aiSeverity ?? result.ai_severity;
  const severityOutOfFive = Math.max(
    0,
    Math.min(
      5,
      Number.isFinite(Number(rawSeverity))
        ? Number(rawSeverity)
        : getSeverityScoreOutOfFive(result.severity_score)
    )
  );
  const progressWidth = `${(severityOutOfFive / 5) * 100}%`;
  const reasoning =
    (
      result as AnalysisResult & {
        aiSeverityExplanation?: string;
      }
    ).aiSeverityExplanation ||
    result.ai_severity_explanation ||
    result.rationale_arabic ||
    result.rationale ||
    result.reasoning_ar ||
    tReport("noReasoning");
  const aiProcessingStatus =
    (
      result as AnalysisResult & {
        ai_processing_status?: string;
        aiProcessingStatus?: string;
      }
    ).aiProcessingStatus ||
    (
      result as AnalysisResult & {
        ai_processing_status?: string;
      }
    ).ai_processing_status;
  const hasAnalysisFailed =
    aiProcessingStatus === "failed" ||
    !Number.isFinite(Number(severityOutOfFive)) ||
    severityOutOfFive === 0;
  const classificationKind = hasAnalysisFailed ? "failed" : getClassificationKind();
  const classificationMeta = classificationStyles[classificationKind];

  const getSeverityFillColor = () => {
    if (severityOutOfFive >= 4) return "#E24B4A";
    if (severityOutOfFive === 3) return "#EF9F27";
    return "#639922";
  };

  const getReportPathKind = (): ReportPathKind => {
    const directPath =
      (
        result as AnalysisResult & {
          aiRecommendedPath?: string;
        }
      ).aiRecommendedPath || result.ai_recommended_path;
    const normalizedPath = String(directPath || "").trim().toLowerCase();

    if (
      normalizedPath === "legal_action" ||
      normalizedPath === "documentation" ||
      normalizedPath === "monitoring" ||
      normalizedPath === "no_action"
    ) {
      return normalizedPath;
    }

    if (hasAnalysisFailed) return "documentation";
    if (classificationKind === "none") return "no_action";
    if (severityOutOfFive >= 4) return "legal_action";
    if (severityOutOfFive === 3) return "monitoring";
    return "documentation";
  };

  const reportPathSentence =
    (
      result as AnalysisResult & {
        aiPathSentence?: string;
      }
    ).aiPathSentence ||
    result.ai_path_sentence ||
    (hasAnalysisFailed ? tReport("statusMessages.analysisFailed") : reasoning);

  const reportPathKind = getReportPathKind();
  const reportPathLabel = tReport(`paths.${reportPathKind}`);
  const severityFillColor = getSeverityFillColor();

  const title = mode === "report" ? tReport("successTitle") : tReport("analysisTitle");
  const subtitle =
    mode === "report" ? tReport("successSubtitle") : tReport("analysisSubtitle");

  return (
    <div className="w-full">
      <div
        className={
          embedded
            ? "overflow-hidden"
            : "overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.28)]"
        }
      >
        <div className={compact ? "p-3 md:p-3.5" : "p-6 md:p-8"}>
          <div
            className={`flex items-start gap-3 border-b border-stone-200 ${
              compact ? "pb-2.5" : "pb-6"
            }`}
          >
            <div
              className={`flex shrink-0 items-center justify-center rounded-full bg-[#1A6B3A] text-white ${
                compact ? "h-9 w-9" : "h-16 w-16"
              }`}
            >
              <svg
                className={compact ? "h-4.5 w-4.5" : "h-8 w-8"}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="m5 13 4 4L19 7"
                />
              </svg>
            </div>

            <div className="flex-1">
              <h2
                className={`font-black tracking-tight text-stone-900 ${
                  compact ? "text-base md:text-lg" : "text-2xl md:text-3xl"
                }`}
              >
                {title}
              </h2>
              <p
                className={`mt-1 text-stone-500 ${
                  compact ? "text-[11px] md:text-xs leading-5" : "text-lg leading-8"
                }`}
              >
                {subtitle}
              </p>
            </div>
          </div>

          <div className={compact ? "mt-3.5 space-y-2.5" : "mt-8 space-y-6"}>
            <section
              className={`rounded-[24px] border border-stone-200 bg-white ${
                compact ? "p-3 md:p-3.5" : "p-6 md:p-8"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`${compact ? "text-[11px]" : "text-sm"} font-bold text-stone-500`}>
                    {tReport("classificationTitle")}
                  </p>
                  <div
                    className={`inline-flex items-center rounded-full border font-black ${
                      compact ? "mt-1.5 px-2.5 py-1 text-[11px]" : "mt-4 px-5 py-3 text-lg"
                    }`}
                    style={{
                      backgroundColor: classificationMeta.backgroundColor,
                      borderColor: classificationMeta.borderColor,
                      color: classificationMeta.textColor,
                    }}
                  >
                    {tReport(`classifications.${classificationMeta.labelKey}`)}
                  </div>
                </div>

                {result.target_group_arabic && (
                  <div className={`rounded-2xl bg-stone-50 text-right ${compact ? "px-2 py-1.5" : "px-4 py-3"}`}>
                    <p className={`${compact ? "text-[10px]" : "text-xs"} font-bold text-stone-400`}>
                      {tResults("targetGroupLabel")}
                    </p>
                    <p className={`mt-0.5 font-bold text-stone-700 ${compact ? "text-[10px]" : "text-sm"}`}>
                      {result.target_group_arabic}
                    </p>
                  </div>
                )}
              </div>

              <div className={`border-t border-stone-200 ${compact ? "mt-3 pt-2.5" : "mt-8 pt-6"}`}>
                <div className="flex items-end justify-between gap-4">
                  <div className={`${compact ? "text-xl" : "text-4xl"} font-black text-stone-900`} dir="ltr">
                    {severityOutOfFive}
                    <span
                      className={`ms-1.5 font-bold text-stone-400 ${
                        compact ? "text-xs" : "text-xl"
                      }`}
                    >
                      /5
                    </span>
                  </div>
                  <p className={`${compact ? "text-xs" : "text-lg"} font-bold text-stone-600`}>
                    {tReport("severityTitle")}
                  </p>
                </div>

                <div
                  className={`rounded-full ${compact ? "mt-2.5 h-1.5" : "mt-5 h-3"}`}
                  style={{ backgroundColor: "#F5F5F5" }}
                >
                  <div
                    className={`h-full rounded-full`}
                    style={{
                      width: progressWidth,
                      backgroundColor: severityFillColor,
                    }}
                  />
                </div>

                <p className={`text-stone-700 ${compact ? "mt-2.5 text-[11px] leading-5" : "mt-5 text-lg leading-8"}`}>
                  {reasoning}
                </p>
              </div>
            </section>

            <section
              className={`rounded-[24px] border ${
                compact ? "p-3 md:p-3.5" : "p-6 md:p-8"
              }`}
              style={{
                backgroundColor: "#E8F5EE",
                borderColor: "#97C459",
              }}
            >
              <p className={`${compact ? "text-[11px]" : "text-sm"} font-bold text-[#27500A]`}>
                {tReport("reportPathTitle")}
              </p>

              <p className={`font-black text-[#27500A] ${compact ? "mt-1.5 text-sm" : "mt-3 text-xl"}`}>
                {reportPathLabel}
              </p>

              <p className={`text-[#27500A] ${compact ? "mt-2 text-[11px] leading-5" : "mt-4 text-lg leading-8"}`}>
                {reportPathSentence}
              </p>

              <div className={`border-t border-[#97C459] ${compact ? "mt-3 pt-2.5" : "mt-5 pt-4"}`}>
                <p className={`${compact ? "text-[10px] leading-4" : "text-sm leading-7"} font-semibold text-[#27500A]`}>
                  {tReport("reportPathFooter")}
                </p>
              </div>

              <p className={`${compact ? "mt-2.5 text-[10px] leading-5" : "mt-4 text-sm leading-7"} text-[#27500A]`}>
                {tReport("aiDisclosure")}
              </p>
            </section>

            {reportNumber && (
              <section className={`rounded-[24px] border border-stone-200 bg-white ${compact ? "p-3 md:p-3.5" : "p-6 md:p-8"}`}>
                <p
                  className="text-center text-[18px] font-bold tracking-tight text-stone-900"
                  dir="ltr"
                >
                  {reportNumber}
                </p>
              </section>
            )}

            <div className="flex flex-col gap-3 pt-2 md:flex-row">
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(true)}
                className={`inline-flex flex-1 items-center justify-center rounded-2xl border border-stone-200 px-3.5 font-bold text-stone-700 transition hover:bg-stone-50 ${
                  compact ? "py-2 text-[11px]" : "py-4 text-base"
                }`}
              >
                {tResults("feedbackButton")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        originalText={result.text || ""}
        aiClassification={result.classification}
        aiRiskLevel={result.violation_type || result.risk_level || "Unknown"}
        severityScore={result.severity_score || 0}
      />
    </div>
  );
}
