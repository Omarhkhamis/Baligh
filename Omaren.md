# Official Technical and Security Report for Balagh Platform

**Prepared by:** Omar  
**Date:** March 21, 2026  
**Document Type:** Executive, Technical, and Security Report  
**Purpose:** To document the implemented changes across the Balagh platform, explain the current security and privacy protocol, describe the reporting and analysis workflow, summarize the rebuilt radar, and record the present operational requirements.

---

## 1. Executive Summary

This document records the implementation work completed during the restructuring of the Balagh reporting workflow, the analysis results interface, and the public radar. The work was centered around three main tracks:

1. **Rebuilding the reporting flow inside the modal form**, including fields, validation, file attachments, and multilingual UX.
2. **Reworking the backend submission and analysis pipeline**, including reference numbering, Gemini integration, OCR/Vision support, structured persistence, and safe-failure behavior.
3. **Rebuilding the Balagh radar from scratch**, replacing the former snapshot-based system with a live-data model and removing obsolete code paths.

In parallel, a practical application-level security layer was implemented. This includes column-level encryption for sensitive data, strict data minimization, EXIF stripping from uploaded images, role-based access control, internal escalation alerts, per-IP submission limits, and enforced HTTPS for API traffic outside development.

---

## 2. Scope

This report covers the following areas:

- The reporting experience from the homepage entry point to the Step 2 results screen.
- The backend flow behind `/api/reports/submit` and its execution path.
- Gemini integration, Vision/OCR handling, retries, and manual-review fallback.
- Database schema changes for reports, analysis output, and human review governance.
- Security, privacy, internal escalation, and RBAC.
- The new live Balagh radar.
- Localization changes in Arabic, English, and Kurdish.
- Dependency updates and stability improvements related to the reporting system.

This document does not claim to replace infrastructure-level controls such as storage-volume encryption or proxy-level TLS policy enforcement. Those are referenced where relevant, but remain operational responsibilities outside application code.

---

## 3. Implementation Principles

The work was carried out according to the following principles:

- **Minimum necessary data collection**
- **Anonymous-by-default reporting**
- **Clear separation between public and internal data**
- **Least-privilege access control**
- **Safe failure handling for AI-dependent flows**
- **A single live source of truth for the radar**

---

## 4. Security and Privacy Protocol

### 4.1 Application-Level Encryption

Column-level encryption was implemented in `src/lib/data-security.ts` using `AES-256-GCM`. It currently protects the following sensitive values:

- The original submitted content, currently stored in `AnalysisLog.inputText`
- Detected hate-related keywords, currently stored in `AnalysisLog.detectedKeywords`

For compatibility with the intended logical schema, these values are also surfaced through `aiScores` as:

- `content_text`
- `ai_hate_keywords`

This is important from a data-governance perspective: the application does **not** store two separate sensitive copies. Instead, it stores one encrypted representation and re-maps it logically on read.

### 4.2 Encryption Key Handling

- In production, `COLUMN_ENCRYPTION_KEY` is **mandatory**
- In development only, a fixed local fallback key is used with an explicit console warning

This means the system remains usable during development, but the fallback must never be treated as a production-grade secret.

### 4.3 Encryption at Rest

At the application layer, column-level encryption is implemented for sensitive fields. However, **full database or disk encryption at rest** still depends on infrastructure-level controls such as:

- PostgreSQL storage policy
- encrypted disks or volumes
- hosting or cloud-provider encryption features

Accordingly, the application covers the sensitive-field portion of the requirement, while full storage-at-rest encryption remains an infrastructure responsibility.

### 4.4 Encryption in Transit

HTTPS is enforced for `/api/*` requests outside development through `middleware.ts`, and `HSTS` is set to encourage secure follow-up requests from the client.

The exact enforcement of **TLS 1.3** depends on:

- the reverse proxy
- the CDN
- or the hosting layer

In other words, the application enforces HTTPS usage, while the precise TLS version policy must be completed at the infrastructure boundary.

### 4.5 Anonymization and Data Minimization

The reporting system now follows a strict data-minimization model:

- **IP addresses are not stored** with the report record
- a hashed/HMAC-derived IP fingerprint is used only for rate limiting
- **User-Agent is not persisted**
- **EXIF metadata is stripped** from uploaded images before storage
- report timestamps are normalized to a **date-only operational pattern** within the reporting flow, reducing precision beyond the day level

### 4.6 Rate Limiting

Mandatory rate limiting was added to:

`POST /api/reports/submit`

The current policy is:

- maximum `10` requests per IP per hour
- maximum `50` requests per IP per day
- on violation, the API returns `HTTP 429` with:
  `You have reached the daily report limit. Try again tomorrow.`

The present implementation uses an **in-memory store**, which is acceptable for a single-instance deployment. For horizontal scaling, Redis or another distributed store should replace it.

### 4.7 Sessions and Authentication

The administrative session model uses JWT with:

- cookie name: `balgh_session`
- session lifetime: `7` days
- `HttpOnly` cookie behavior
- `secure` enabled in production
- signing secret from `AUTH_SECRET`

### 4.8 Internal Escalation and Notifications

When a report reaches a critical escalation condition, the system now:

- sets `human_review_status = escalated`
- creates an in-app dashboard alert for:
  - `SUPER_ADMIN`
  - `ANALYST`
- attempts to send an internal email to `contact@baligh.org`
- does **not** notify the external reporter

The internal notification message is:

`High-priority report received: [ref_number] - severity 5 - requires immediate review`

If SMTP is not configured, dashboard alerts still work, while email delivery is skipped with a warning.

### 4.9 Role-Based Access Control (RBAC)

The current administrative roles are:

- `SUPER_ADMIN`: full access, with enforcement that only one Super Admin account may exist
- `ANALYST`: read reports, comment, and update review status, but no deletion rights
- `EDITOR`: manage editorial content such as news and studies, with no access to raw report content
- `VIEWER`: limited access to dashboard statistics and overview-level signals, without raw individual content access

This role design also reinforces the separation between:

- the public radar
- the internal review environment

---

## 5. User Interface and Reporting Experience

### 5.1 Modal Structure

The report experience is now centered around a modal-based workflow with:

- background page scroll lock
- close behavior via button and `Esc`
- a two-step process:
  1. Submit Report
  2. Analysis Results
- a visual progress indicator where Step 1 turns into `✓` after successful submission

### 5.2 Privacy Notice Strip

A fixed privacy strip was added above the form fields, using a light green background and a lock icon. It explains that the report is anonymous, that name/email/IP are not stored, and that content is used only for documentation and analysis within Balagh's mission.

### 5.3 Step 1 Fields

The current form uses the following fields:

- `platform`
- `post_url`
- `content_text`
- `images`
- `target_groups`
- `is_direct_risk`

### 5.4 Validation Behavior

Frontend validation now explicitly blocks submission when:

- the platform is not selected
- the post URL is missing
- the text field is empty
- the direct-risk question is unanswered

An important implementation note should be recorded here:

The **current web UI still requires text before submission**. The backend keeps OCR/Vision support available as a fallback and expansion path, but the primary frontend submission path presently expects text as a minimum.

### 5.5 File Uploads and Evidence Handling

The evidence section was rebuilt with the following rules:

- the attach button sits directly below the text field
- input type is `file` with `accept="image/*,.pdf"` and `multiple`
- maximum `3` files per report
- maximum `5MB` per file
- invalid type or size is rejected in the frontend before submission
- images show instant `60x60` previews
- PDFs show a file card
- each item includes a remove button
- EXIF is stripped before persistence
- uploads are stored under:
  `/uploads/report-evidence/`

### 5.6 Target Group Multi-Select

The target-group field was changed from a single-choice control to a real multi-select, with the following final behavior:

- `Unspecified` is not preselected
- `Unspecified` remains available as an explicit fallback choice
- once a real target group is selected, `Unspecified` disappears from the visible options
- the dropdown closes after each selection, and the user reopens it to choose another item
- a vertical scroll area is available so all options remain reachable
- selected items are rendered as removable chips beneath the field

The final Arabic list used in the UI is:

- دروز
- مسلمون سنة
- علويون
- كرد
- عرب
- مسيحيين
- نساء/أطفال
- أقليات أخرى
- غير محدد

Equivalent translations were implemented in English and Kurdish as well.

### 5.7 Step 2 Results Interface

The Step 2 results screen was redesigned to include:

- a fixed confirmation message with a green circle and `✓`
- a classification card with different visual states for:
  - explicit hate speech
  - implicit hate speech
  - incitement
  - no hate speech
  - analysis failure
- a dynamic severity bar from 1 to 5
- status messages that change by severity and classification
- a report-path card using `ai_path_sentence`
- a fixed footer explaining that human review is required before action
- a fixed AI-disclosure paragraph referring to international standards and Syrian context
- a reference-number card displaying `BLG-YYYY-NNNN`
- a `Submit new report` button that resets the flow without a page reload

### 5.8 Localization and Content Updates

The report flow and key homepage calls to action were standardized across:

- Arabic
- English
- Kurdish

This included:

- revised homepage CTA wording
- updated helper and validation text
- new Step 2 status messages
- aligned target-group labels across all three languages

---

## 6. Backend Processing Workflow

### 6.1 Endpoint

The formal submission endpoint is:

`POST /api/reports/submit`

This route acts as the stable public alias to the main report-analysis execution path. The current web form submits `FormData`, which is appropriate because file uploads are part of the request.

### 6.2 Processing Sequence

The implemented backend flow is:

1. Receive and validate submission data
2. Apply rate limiting before expensive processing
3. Generate the reference number in `BLG-YYYY-NNNN` format
4. sanitize and store uploaded files after EXIF removal
5. when analyzable images exist without sufficient text, run OCR/Vision extraction
6. build a dynamic prompt from report data
7. submit the request to Gemini using the default or configured model
8. parse the structured JSON response inside `try/catch`
9. retry once if the AI response is invalid JSON
10. on repeated failure or timeout, save the report as `failed` and route it to manual review
11. enforce the severity floor rule so that any non-`none` classification cannot be below `2`
12. persist the report and structured AI output
13. return a success response and transition the UI to Step 2

### 6.3 Gemini and Custom Model Support

The current analysis path is based on Gemini with:

- default model: `gemini-3-flash-preview`
- support for a custom or tuned model via:
  `GEMINI_MODEL_NAME`
- primary and backup API keys:
  `GEMINI_API_KEY`, `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`
- retry behavior for quota, permission, and recoverable API failures

The output-token ceiling was also increased to prevent truncated AI responses. This previously caused incomplete JSON and pushed valid hate-speech cases into the manual-review fallback path.

### 6.4 Safe Failure Handling

The system now explicitly handles:

- Gemini failure
- timeout
- invalid JSON responses
- OCR/Vision failure

In all such cases:

- the report is still saved
- `ai_processing_status = failed` is recorded
- the user receives a message confirming receipt and manual review

### 6.5 Response Structure

The current success contract includes at least:

```json
{
  "success": true,
  "ref_number": "BLG-2026-0123",
  "analysis": {
    "classification": "explicit hate speech",
    "severity": 4,
    "severity_explanation": "...",
    "recommended_path": "legal_action",
    "path_sentence": "..."
  }
}
```

The route also preserves compatibility keys for the existing frontend, including `result` and `reportNumber`.

---

## 7. Database Schema and Field Mapping

### 7.1 Structural Note

The logical report schema is not stored in a single physical table. Instead, it is intentionally distributed across two main models:

- `LegalReport`
- `AnalysisLog`

This allows the platform to separate:

- reception and review data
- AI-generated analytical output

### 7.2 Group A: Reception Data (System)

- `id`
- `ref_number`
  - currently represented by `reportNumber`
- `created_at`
  - currently represented by `createdAt`, with date-only normalization in the report flow
- `ai_processing_status`
- `human_review_status`
- `reviewed_by`
  - currently represented by `reviewedById`
- `reviewed_at`
  - currently represented by `reviewedAt`

### 7.3 Group B: Reporter Inputs (Input)

- `platform`
- `post_url`
- `content_text`
  - currently represented by encrypted `AnalysisLog.inputText`
- `image_urls`
- `target_groups_user`
- `is_direct_risk`

### 7.4 Group C: Classification Analysis (AI)

- `ai_classification`
- `ai_severity`
- `ai_severity_explanation`
- `ai_speech_type`
- `ai_confidence`
- `ai_context_sensitivity`

### 7.5 Group D: Target Groups and Keywords (AI)

- `ai_target_groups`
- `ai_hate_keywords`
  - currently represented by encrypted `AnalysisLog.detectedKeywords`
- `ai_symbolic_references`
- `ai_emotions_detected`
- `ai_dehumanization_level`
- `ai_generalization_type`

The fixed enum currently used for `ai_emotions_detected` is:

- `hatred`
- `anger`
- `contempt`
- `gloating`
- `fear`
- `generalization`
- `revenge_desire`
- `other`

### 7.6 Group E: Context and Reach (AI)

- `ai_account_type`
- `ai_reach_level`
- `ai_content_type`
- `ai_language_register`
- `ai_conflict_context`
- `ai_publisher_location`

`ai_publisher_location` should be treated strictly as an **estimated inferred location**, not as precise legal or geographic evidence.

### 7.7 Group F: Path and Action (AI)

- `ai_recommended_path`
- `ai_path_sentence`
- `ai_legal_basis`
- `ai_escalation_flag`
- `ai_incitement_to_action`
- `ai_glorification_of_violence`
- `ai_notes`
- `final_path`

### 7.8 Benefits of the Current Schema

This structure provides:

- separation between raw submitted data and AI-generated output
- a manageable place for encrypted sensitive fields
- direct support for the public radar
- a clear distinction between AI recommendation and final human decision

---

## 8. Administrative Governance and Human Review

The administrative layer was updated to support a cleaner review workflow, including:

- dedicated management for legal reports
- human review statuses:
  - `pending`
  - `reviewed`
  - `escalated`
  - `closed`
- internal `reviewComment`
- reviewer tracking through `reviewedById` and `reviewedAt`
- in-app escalation alerts visible in the dashboard

This establishes a much clearer boundary between public-facing reporting outputs and internal review operations.

---

## 9. Rebuilding the Balagh Radar

### 9.1 Architectural Decision

The former **Monitoring Snapshots** system was removed from:

- the admin UI
- the data layer
- the rendering layer
- the Prisma schema

It was replaced by a live-data radar built directly on top of `LegalReport` and `AnalysisLog`.

### 9.2 Radar Outputs

The new radar now maps the following analytical fields into visualization units:

- `ai_classification`: donut chart and classification breakdown
- `ai_severity`: timeline and peak detection
- `created_at`: time axis
- `ai_target_groups`: most targeted groups
- `platform`: platform distribution
- `ai_hate_keywords`: internal-only keyword cloud and frequency table
- `ai_emotions_detected`: emotional radar chart
- `ai_dehumanization_level`: stacked trend indicator
- `ai_reach_level`: impact-weighting factor
- `ai_conflict_context`: contextual annotations for peaks
- `ai_account_type`: publisher-type breakdown
- `ai_publisher_location`: estimated geographic spread
- `ai_escalation_flag`: top-level emergency indicator
- `ai_incitement_to_action`: dedicated indicator
- `ai_glorification_of_violence`: dedicated trend line

### 9.3 Visualization Layer

The rebuilt radar uses a modern React charting stack capable of rendering:

- donut charts
- pie charts
- line charts
- bar charts
- radar charts
- summary indicators and metric cards

### 9.4 Demo Data

A local demo seed script was added:

`scripts/seed-radar-demo.mjs`

This script inserts realistic development data into the database so the radar can be reviewed visually during implementation and QA.

---

## 10. Additional UI and UX Adjustments

Beyond the main workflow rebuild, several supporting frontend corrections were also completed:

- homepage CTA text updates
- Step 2 messaging aligned with the new severity logic
- `z-index` fixes inside the report form
- migration of local image previews to `next/image` where appropriate
- replacement of non-canonical Tailwind classes with stable equivalents
- correction of target-group dropdown behavior and scroll handling

These changes were carried out after the radar rebuild and code cleanup, with obsolete code paths removed rather than preserved.

---

## 11. Dependency, Stability, and Maintenance Improvements

The project dependencies were reviewed and updated to address warnings and security issues, including:

- aligning Prisma-related packages to a consistent newer version
- removing `jimp` and replacing it with `sharp` for image processing
- eliminating vulnerable transitive chains related to `file-type`
- keeping the codebase buildable and TypeScript-safe after the upgrade

An additional stability issue was also resolved in the Gemini pipeline, where truncated model output had previously caused incomplete JSON and misleading manual-review fallbacks even for clearly severe hate-speech inputs.

---

## 12. Operational Environment Requirements

The main environment variables required by the implemented system are:

| Variable | Purpose | Status |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `AUTH_SECRET` | admin session signing | Required |
| `COLUMN_ENCRYPTION_KEY` | column-level encryption key | Required in production |
| `RATE_LIMIT_HASH_KEY` | IP hashing key for rate limiting | Recommended |
| `GEMINI_API_KEY` | primary Gemini key | Required for AI analysis |
| `GEMINI_API_KEY_1..3` | backup Gemini keys | Optional |
| `GEMINI_MODEL_NAME` | custom or tuned Gemini model selector | Optional |
| `SMTP_HOST` | internal email server host | Optional |
| `SMTP_PORT` | internal email server port | Optional |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials | Optional |
| `SMTP_FROM` | sender address | Optional |
| `SMTP_SECURE` | secure SMTP transport flag | Optional |

### Operational Notes

- Missing `COLUMN_ENCRYPTION_KEY` in development does not stop the app, but it produces a warning and uses a fixed local fallback key.
- Missing SMTP does not break dashboard alerts, but email notifications are skipped.
- In multi-instance deployments, the current in-memory rate limiter should be replaced with a distributed store.

---

## 13. Verification and Testing

The work was verified through recurring technical checks, depending on the change set:

- `eslint`
- `npx tsc --noEmit`
- `npm run build`
- `npx prisma generate`
- local migration execution where required
- manual end-to-end submission and review testing

Verification covered:

- successful submission through `/api/reports/submit`
- correct reference-number generation
- transition to Step 2
- attachment handling and size enforcement
- internal alert creation for escalated cases
- correct public radar behavior after removing the legacy snapshot system

---

## 14. Current Limitations and Recommendations

Although the application-level implementation is now materially stronger, several items still require operational completion or hardening:

- infrastructure-level **database/disk encryption at rest**
- explicit **TLS 1.3** enforcement at the proxy/CDN layer
- replacement of the current **in-memory limiter** with Redis under horizontal scaling
- operational monitoring for Gemini failure, timeout behavior, and internal email delivery
- production-grade backup and restore governance

---

## 15. Primary Reference Files

The main files associated with this implementation are:

- `src/components/reporting/ReportFlowPanel.tsx`
- `src/components/ResultsDisplay.tsx`
- `src/components/reporting/ReportModalProvider.tsx`
- `src/app/api/reports/submit/route.ts`
- `src/app/api/report-analysis/route.ts`
- `src/lib/analysis-service.ts`
- `src/lib/gemini.ts`
- `src/lib/data-security.ts`
- `src/lib/report-submission-rate-limit.ts`
- `src/lib/report-number.ts`
- `src/lib/admin-notifications.ts`
- `src/lib/internal-email.ts`
- `src/lib/permissions.ts`
- `src/lib/auth.ts`
- `src/lib/session.ts`
- `prisma/schema.prisma`
- `src/lib/radar-dashboard.ts`
- `src/components/monitoring/BalaghRadarDashboard.tsx`
- `src/app/[locale]/monitoring/page.tsx`
- `scripts/seed-radar-demo.mjs`
- `messages/ar.json`
- `messages/en.json`
- `messages/ku.json`

---

## 16. Conclusion

The current state of the platform reflects more than a UI refresh. It represents a substantive re-foundation of the reporting lifecycle, from intake to persistence, AI analysis, internal review, and public radar visibility. The resulting system now provides:

- a clearer and more disciplined report form
- a safer and more resilient AI processing flow
- better-structured storage for sensitive and public data
- clearer governance for internal team permissions
- a live-data radar instead of the former legacy snapshot model

This document may therefore serve as an official implementation reference for the Balagh platform as of the preparation date, while clearly distinguishing between what has already been delivered in application code and what must still be finalized at the infrastructure and operations level.
