import { NextResponse } from 'next/server';
import { authenticateAdmin, setSessionCookie } from '@/lib/auth';
import { createSessionToken } from '@/lib/session';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة السر مفقودة' }, { status: 400 });
        }

        const admin = await authenticateAdmin(email, password);
        if (!admin) {
            return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
        }

        const token = createSessionToken({ sub: admin.id, email: admin.email });
        await setSessionCookie(token);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'خطأ داخلي' }, { status: 500 });
    }
}
