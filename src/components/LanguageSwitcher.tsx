'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

const SUPPORTED_LOCALES = ['ar', 'en', 'ku'] as const;

export default function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    const handleChange = (nextLocale: (typeof SUPPORTED_LOCALES)[number]) => {
        if (nextLocale === locale) return;
        const barePath = pathname.replace(/^\/(ar|en|ku)(?=\/|$)/, '') || '/';
        router.replace(`/${nextLocale}${barePath}`);
        router.refresh();
    };

    return (
        <div className="flex items-center gap-2">
            {SUPPORTED_LOCALES.map((lng) => (
                <button
                    key={lng}
                    onClick={() => handleChange(lng)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        locale === lng
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:text-green-600'
                    }`}
                    aria-pressed={locale === lng}
                    aria-label={`Switch to ${lng}`}
                >
                    {lng.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
