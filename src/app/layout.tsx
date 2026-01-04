import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import './globals.css';

type RootLayoutProps = {
    children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
    const hdrs = await headers();
    const headerLocale = hdrs.get('x-next-intl-locale');
    const locale = headerLocale || 'ar';
    // Ensure Arabic is RTL, and other languages (English, Kurdish) are LTR
    // Ensure Arabic is RTL, and other languages (English, Kurdish) are LTR
    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir}>
            <body className="antialiased bg-gray-50 text-gray-900 font-sans">
                {children}
            </body>
        </html>
    );
}

export { generateMetadata, generateStaticParams } from './[locale]/layout';
