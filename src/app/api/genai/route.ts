import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-3-flash-preview';
const ALLOWED_CLASSES = [
    'تحريض على العنف',
    'خطاب كراهية',
    'تحرش',
    'ليس خطاب كراهية'
] as const;

const SYSTEM_PROMPT = `
أنت مصنف محتوى عربي يعمل ضمن مبادرة "بلِّغ". صنّف أي نص يُرسل إليك في أحد الخيارات الأربعة فقط:
1) تحريض على العنف
2) خطاب كراهية
3) تحرش
4) ليس خطاب كراهية (محتوى لا يحمل مؤشرات كراهية أو تحريض)

قواعد:
- اعتمد التحليل السياقي قبل اللفظي.
- إذا كان النص نقدًا سياسيًا أو خلافًا شخصيًا بلا استهداف جماعي، اختر "ليس خطاب كراهية".
- لا تبتكر فئات إضافية، ولا تعدد أكثر من خيار.

أعد الرد بصيغة JSON صارمة:
{
  "classification": "<one of the four options بالعربية>",
  "rationale": "شرح مختصر من جملتين يوضح سبب الاختيار"
}
`;

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || typeof text !== 'string' || !text.trim()) {
            return NextResponse.json({ error: 'النص مطلوب للتحليل' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY غير مضبوط في البيئة' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: {
                temperature: 0.3,
                responseMimeType: 'application/json',
            },
        });

        const contents = [
            {
                role: 'user',
                parts: [
                    {
                        text: text.trim(),
                    },
                ],
            },
        ];

        const response = await model.generateContent({ contents });
        const rawText = response?.response?.text() || '';

        let parsed: { classification?: string; rationale?: string } = {};
        try {
            parsed = JSON.parse(rawText);
        } catch {
            parsed = {
                classification: 'ليس خطاب كراهية',
                rationale: rawText || 'لم يتم استلام رد واضح من النموذج.',
            };
        }

        const classification = ALLOWED_CLASSES.includes(parsed.classification as typeof ALLOWED_CLASSES[number])
            ? parsed.classification
            : 'ليس خطاب كراهية';

        return NextResponse.json({
            classification,
            rationale: parsed.rationale || 'لا يوجد تفسير متاح.',
            model: MODEL_NAME,
        });
    } catch (error: unknown) {
        console.error('Error in /api/genai:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
