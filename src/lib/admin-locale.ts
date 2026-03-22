import type { cookies as CookiesFn } from 'next/headers';

export const ADMIN_LOCALE_COOKIE = 'balgh_admin_locale';
export const ADMIN_LOCALES = ['ar', 'en'] as const;

export type AdminLocale = (typeof ADMIN_LOCALES)[number];

type CookieStoreLike = Awaited<ReturnType<typeof CookiesFn>>;

export function isAdminLocale(value: unknown): value is AdminLocale {
    return typeof value === 'string' && ADMIN_LOCALES.includes(value as AdminLocale);
}

export function normalizeAdminLocale(value: unknown): AdminLocale {
    if (isAdminLocale(value)) {
        return value;
    }
    return 'ar';
}

export function getAdminLocaleFromCookieStore(store: Pick<CookieStoreLike, 'get'>): AdminLocale {
    const adminCookie = store.get(ADMIN_LOCALE_COOKIE)?.value;
    if (isAdminLocale(adminCookie)) {
        return adminCookie;
    }

    const nextLocaleCookie = store.get('NEXT_LOCALE')?.value;
    if (isAdminLocale(nextLocaleCookie)) {
        return nextLocaleCookie;
    }

    return 'ar';
}
