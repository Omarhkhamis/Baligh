import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { getLegalInfo } from '@/lib/report-generator';

const genAI = getGeminiClient();

export async function POST(req: Request) {
    try {
        const { jurisdiction, text, reasoning_ar, severity_score } = await req.json();

        // Get detailed legal information for the jurisdiction
        const legalInfo = getLegalInfo(jurisdiction);

        // For Syrian reports - use simplified template
        if (jurisdiction === 'Syria') {
            // Use Arabic Hijri calendar for date
            const currentDate = new Date().toLocaleDateString('ar-SA-u-ca-islamic', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const syrianPrompt = `أنت مساعد قانوني ذكي. مهمتك هي صياغة "مسودة إخبار قانوني" باستخدام **القالب المحدد أدناه بدقة متناهية**.

**المعطيات:**
- التاريخ: ${currentDate}
- النص المرصود: ${text ? `"${text}"` : 'غير متوفر (صورة/فيديو)'}
- نوع المحتوى: ${text ? 'محتوى مكتوب (نص)' : 'محتوى مرئي (صورة)'}

** التعليمات:**
1. انسخ القالب أدناه حرفياً.
2. استبدل ما بين القوسين **[ ]** بالمعلومات المناسبة من المعطيات.
3. في فقرة "يتعلق هذا الإخبار بـ..."، حدد نوع المحتوى بدقة (محتوى مكتوب، محتوى مرئي/صورة، فيديو). إذا كان هناك نص مرصود، قم بإدراجه بعد تحديد النوع.
4. حافظ على التنسيق والمسافات والرموز التعبيرية (Emojis) كما هي في القالب.

**القالب المطلوب (انسخه كما هو):**

مسودة إخبار قانوني (صيغة إرشادية)

التاريخ:
${currentDate}

إلى:
حضرة السيد النائب العام الموقر

الموضوع:
إخبار بخصوص محتوى إلكتروني

تحية طيبة وبعد،

استنادًا إلى أحكام المادة (٢٥) من قانون أصول المحاكمات الجزائية، أتقدم إليكم بهذا الإخبار بخصوص محتوى إلكتروني منشور على إحدى المنصات الرقمية.

يتعلّق هذا الإخبار بـ [حدد النوع هنا: محتوى مكتوب / محتوى مرئي (صورة)] ${text ? `نصه: "${text}"` : ''} يتضمن عبارات أو دلالات يُحتمل أن تُفهم على أنها مسيئة أو محرضة بصورة عامة، الأمر الذي يترك لعدالتكم تقدير ما إذا كان مضمون هذا المحتوى قد يندرج، بحسب طبيعته وسياقه، ضمن الأفعال التي تتناولها أحكام قانون العقوبات السوري، ولا سيما المادة (٢٨٧)، أو القانون رقم (٢٠) لعام ٢٠٢٣ المتعلق بمكافحة الجرائم الإلكترونية، ولا سيما المادة (٣١)، وذلك دون إجراء أي توصيف أو تكييف قانوني نهائي.

معلومات المحتوى:

اسم الحساب: [يُدرج من قبل المبلّغ]

رابط المحتوى: [يُدرج من قبل المبلّغ]

وعليه، أرجو التفضل بالاطلاع على هذا الإخبار، واتخاذ ما ترونه مناسبًا وفقًا للأصول القانونية.

وتفضلوا بقبول فائق الاحترام والتقدير.

[الاسم]

____________________


لا يشكّل هذا النص رأيًا قانونيًا، ولا يتحمّل مُعدّه أو الجهة التي وفّرته أي مسؤولية قانونية عن استخدامه. يبقى التحقق من الوقائع وتقدير الوصف الجرمي من اختصاص السلطات القضائية المختصة حصريًا.`;

            const result = await genAI.generateContent('gemini-2.0-flash', [syrianPrompt], {
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 2000,
                }
            });
            const report = result.response.text();

            return NextResponse.json({
                report,
                legalInfo: {
                    citation: 'المادة 287 من قانون العقوبات السوري',
                    authority: legalInfo.authority,
                    report_link: legalInfo.report_link
                }
            });
        }

        // For other countries - use the previous comprehensive approach
        const langMap: { [key: string]: string } = {
            'ar': 'Arabic',
            'de': 'German',
            'tr': 'Turkish',
            'fr': 'French',
            'en': 'English',
            'nl': 'Dutch',
            'sv': 'Swedish',
            'es': 'Spanish'
        };

        const targetLanguage = langMap[legalInfo.lang] || 'English';
        const currentDate = new Date().toLocaleDateString(legalInfo.lang === 'ar' ? 'ar-EG' : 'en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const internationalPrompt = `🎯 PROMPT – European Hate Speech Notice (Safe & Non-Analytical)

You are generating a guidance-only legal notice for ${jurisdiction} in ${targetLanguage}.

**STRICT INPUT DATA:**
- **Date:** ${currentDate}
- **Authority:** ${legalInfo.authority}
- **Content:** ${text ? `"${text}"` : 'Visual content (Image/Video)'}
- **Law:** ${legalInfo.citation}

**CRITICAL INSTRUCTIONS:**
1. **Output ONLY the document text.**
2. **Translate** the template into **${targetLanguage}**.
3. **Replace placeholders:**
   - Replace "[Formal Salutation]" with a culturally appropriate formal greeting (e.g., "Monsieur le Procureur,").
   - Replace "[Formal Closing]" with a culturally appropriate formal closing (e.g., "Veuillez agréer, Monsieur le Procureur, l'expression de mes salutations distinguées.").
4. **Fill in the content description:**
   - If 'Content' is text, quote it directly.
   - If 'Content' is visual, use this **EXACT** phrase translated into ${targetLanguage}:
     "It is a publicly accessible video or image content in which negative characteristics are sweptingly attributed to a specific group."

**TEMPLATE TO TRANSLATE (KEEP STRUCTURE):**

[Date]
To: [Authority]

Subject: Notice of potentially punishable online content

[Formal Salutation]

I hereby submit a notice regarding content published online which, by its wording and context, could be suitable to be understood as inciting or degrading towards a specific group of persons.

Description of the reported content:
[INSERT CONTENT DESCRIPTION HERE AS PER INSTRUCTION #3]

Note on legal framework:
Without making a legal assessment, I point out that the described content, by its character, could possibly fall under the relevant provisions of criminal law, specifically [Law], subject to examination and evaluation by the competent law enforcement authorities.

Details of content:

Account / Username: [to be filled by notifier]

Platform: [to be filled by notifier]

Publication Date: [Date]

Link to content: [to be filled by notifier]

Evidence: Screenshot attached

I ask for acknowledgment and examination of the facts within your jurisdiction.

[Formal Closing]
[Name / Organization]

⚠️ Note

This document serves exclusively for the structured transmission of a notice and contains no legal assessment or final qualification of the facts.

**DISCLAIMER:**
This document does not constitute a legal opinion.
`;

        const result = await genAI.generateContent('gemini-2.0-flash', [internationalPrompt], {
            generationConfig: {
                temperature: 0.3, // Lower temperature for more consistent, formal output
                maxOutputTokens: 2048,
            }
        });
        const report = result.response.text();

        return NextResponse.json({
            report,
            legalInfo: {
                citation: legalInfo.citation,
                authority: legalInfo.authority,
                report_link: legalInfo.report_link
            }
        });
    } catch (error: unknown) {
        console.error('Report generation error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({
            error: 'Failed to generate report',
            details: message
        }, { status: 500 });
    }
}
