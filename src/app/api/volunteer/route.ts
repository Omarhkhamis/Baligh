import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type VolunteerRequestBody = {
    locale?: string;
    name?: string;
    email?: string;
    phone?: string;
    volunteerArea?: string;
    background?: string;
    weeklyHours?: string;
    motivation?: string;
};

const RESPONSE_MESSAGES = {
    ar: {
        invalid: 'الرجاء تعبئة الحقول الإلزامية بشكل صحيح.',
        failed: 'تعذر إرسال طلب التطوع حالياً.',
    },
    en: {
        invalid: 'Please complete the required fields correctly.',
        failed: 'Unable to send the volunteer application right now.',
    },
    ku: {
        invalid: 'Ji kerema xwe qadên pêwîst bi awayekî rast tije bike.',
        failed: 'Di vê gavê de şandina daxwaza xebatkariyê ne gengaz e.',
    },
} as const;

function getMessages(locale?: string) {
    return RESPONSE_MESSAGES[locale as keyof typeof RESPONSE_MESSAGES] || RESPONSE_MESSAGES.ar;
}

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as VolunteerRequestBody;
        const locale = body.locale || 'ar';
        const messages = getMessages(locale);

        const normalized = {
            locale,
            name: body.name?.trim() || '',
            email: body.email?.trim() || '',
            phone: body.phone?.trim() || '',
            volunteerArea: body.volunteerArea?.trim() || '',
            background: body.background?.trim() || '',
            weeklyHours: body.weeklyHours?.trim() || '',
            motivation: body.motivation?.trim() || '',
        };

        if (
            !normalized.name ||
            !isValidEmail(normalized.email) ||
            !normalized.volunteerArea ||
            !normalized.background ||
            !normalized.weeklyHours ||
            !normalized.motivation
        ) {
            return NextResponse.json({ error: messages.invalid }, { status: 400 });
        }

        const created = await prisma.volunteerApplication.create({
            data: {
                locale: normalized.locale,
                name: normalized.name,
                email: normalized.email,
                phone: normalized.phone || null,
                volunteerArea: normalized.volunteerArea,
                background: normalized.background,
                weeklyHours: normalized.weeklyHours,
                motivation: normalized.motivation,
            },
        });

        return NextResponse.json({ success: true, id: created.id }, { status: 201 });
    } catch (error) {
        console.error('Volunteer application route failed', error);
        return NextResponse.json({ error: RESPONSE_MESSAGES.ar.failed }, { status: 500 });
    }
}
