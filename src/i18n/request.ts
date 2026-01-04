import { getRequestConfig } from 'next-intl/server';
import { locales } from '../i18n.config';

function deepMerge<T extends Record<string, any>>(base: T, override: T): T {
    const output: Record<string, any> = { ...base };
    for (const [key, value] of Object.entries(override || {})) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            output[key] = deepMerge(base[key] || {}, value);
        } else {
            output[key] = value;
        }
    }
    return output as T;
}

export default getRequestConfig(async ({ requestLocale }) => {
    const resolvedLocale = await requestLocale;
    type Locale = (typeof locales)[number];
    let locale: Locale = locales.includes(resolvedLocale as Locale) ? resolvedLocale as Locale : 'ar';

    if (!locale || !locales.includes(locale)) {
        locale = 'ar';
    }

    // Always load English as the fallback
    const enMessages = (await import(`../../messages/en.json`)).default;
    let messages = enMessages;

    // For other locales, merge over the English fallback so missing keys show English
    if (locale !== 'en') {
        try {
            const localeMessages = (await import(`../../messages/${locale}.json`)).default;
            messages = deepMerge(enMessages, localeMessages);
        } catch (e) {
            // If locale file fails to load, fall back to English entirely
            messages = enMessages;
        }
    }

    return {
        locale,
        messages,
    };
});
