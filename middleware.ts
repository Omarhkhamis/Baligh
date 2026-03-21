import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from './src/lib/session';

function isSecureRequest(req: NextRequest) {
    const forwardedProto = req.headers.get('x-forwarded-proto')?.trim().toLowerCase();
    if (forwardedProto) {
        return forwardedProto === 'https';
    }

    return req.nextUrl.protocol === 'https:';
}

function applySecurityHeaders(res: NextResponse) {
    if (process.env.NODE_ENV !== 'development') {
        res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    return res;
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const hasSession = Boolean(token);

    const isApiRoute = pathname.startsWith('/api/');
    const isAdminApi = pathname.startsWith('/api/admin');
    const isAdminPage = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/login';

    if (isApiRoute && process.env.NODE_ENV !== 'development' && !isSecureRequest(req)) {
        return applySecurityHeaders(
            NextResponse.json({ error: 'HTTPS is required for all API requests.' }, { status: 426 })
        );
    }

    if (isLoginPage && hasSession) {
        return applySecurityHeaders(NextResponse.redirect(new URL('/admin', req.url)));
    }

    if ((isAdminApi || isAdminPage) && !hasSession) {
        if (isAdminApi) {
            return applySecurityHeaders(
                new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                })
            );
        }
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    return applySecurityHeaders(NextResponse.next());
}

export const config = {
    matcher: ['/admin/:path*', '/api/:path*', '/login'],
};
