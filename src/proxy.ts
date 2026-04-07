import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n.config';

const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
});

const LOCALE_SEGMENT_PATTERN = new RegExp(`^/(${locales.join('|')})(?=/|$)`);
const LOCALIZED_ADMIN_PATH_PATTERN = new RegExp(`^/(${locales.join('|')})(?=/(admin|login)(?:/|$))`);

function isUnlocalizedAdminPath(pathname: string) {
    return (
        pathname === '/admin' ||
        pathname.startsWith('/admin/') ||
        pathname === '/login' ||
        pathname.startsWith('/login/')
    );
}

function getLocaleFromPathname(pathname: string) {
    const matchedLocale = pathname.match(LOCALE_SEGMENT_PATTERN)?.[1];
    return locales.includes(matchedLocale as (typeof locales)[number])
        ? (matchedLocale as (typeof locales)[number])
        : defaultLocale;
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (LOCALIZED_ADMIN_PATH_PATTERN.test(pathname)) {
        const normalizedUrl = request.nextUrl.clone();
        normalizedUrl.pathname = pathname.replace(LOCALIZED_ADMIN_PATH_PATTERN, '') || '/';
        return NextResponse.redirect(normalizedUrl);
    }

    if (isUnlocalizedAdminPath(pathname)) {
        return NextResponse.next();
    }

    const response = handleI18nRouting(request);
    response.headers.set('x-next-intl-locale', getLocaleFromPathname(pathname));
    return response;
}

export const config = {
    // Match all pathnames except for
    // - ... if they start with `/api`, `/_next` or `/_vercel`
    // - ... the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
