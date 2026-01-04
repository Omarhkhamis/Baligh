import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n.config';
import { NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
});

export function proxy(request: NextRequest) {
    const response = handleI18nRouting(request);
    response.headers.set('x-next-intl-locale', request.nextUrl.pathname.split('/')[1] || defaultLocale);
    return response;
}

export const config = {
    // Match all pathnames except for
    // - ... if they start with `/api`, `/_next` or `/_vercel`
    // - ... the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
