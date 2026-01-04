import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '../../i18n.config';
import DirectionUpdater from '@/components/DirectionUpdater';
import type { Metadata } from 'next';

type LayoutProps = {
    children: ReactNode;
    params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
    const { locale } = await params;
    const safeLocale: Locale = locales.includes(locale as Locale) ? locale as Locale : 'ar';
    const messages = await getMessages({ locale: safeLocale }) as Record<string, unknown>;

    return {
        title: (messages.metadata as Record<string, string>)?.title || 'بلّغ - منصة مكافحة خطاب الكراهية',
        description: (messages.metadata as Record<string, string>)?.description || 'منصة ذكية لرصد وتحليل ومكافحة خطاب الكراهية',
        icons: {
            icon: '/icon.jpg',
        }
    };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
    const { locale } = await params;
    const requestedLocale: Locale = locales.includes(locale as Locale) ? locale as Locale : 'ar';

    // Scope SSR to the requested locale before reading messages
    setRequestLocale(requestedLocale);
    const messages = await getMessages();

    return (
        <>
            <div className="bg-noise"></div>
            <NextIntlClientProvider locale={requestedLocale} messages={messages}>
                <DirectionUpdater />
                {children}
            </NextIntlClientProvider>
        </>
    );
}
