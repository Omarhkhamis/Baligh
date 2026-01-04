import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from './src/lib/session';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const hasSession = Boolean(token);

    const isAdminApi = pathname.startsWith('/api/admin');
    const isAdminPage = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/login';

    if (isLoginPage && hasSession) {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    if ((isAdminApi || isAdminPage) && !hasSession) {
        if (isAdminApi) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/login'],
};
