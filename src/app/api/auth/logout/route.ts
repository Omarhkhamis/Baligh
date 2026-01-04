import { NextResponse, type NextRequest } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await clearSessionCookie();

    const wantsHtml = req.headers.get('accept')?.includes('text/html');
    if (wantsHtml) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
    // Allow GET for convenience (browser navigation)
    await clearSessionCookie();
    return NextResponse.redirect(new URL('/login', req.url));
}
