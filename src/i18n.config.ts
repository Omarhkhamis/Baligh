export const locales = ['ar', 'en', 'ku'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';
