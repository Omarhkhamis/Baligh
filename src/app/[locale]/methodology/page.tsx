'use client';

import { useLocale } from 'next-intl';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import PageHero from '../../../components/PageHero';
import MethodologySections from '../../../components/about/MethodologySections';

export default function MethodologyPage() {
    const locale = useLocale();

    const content = {
        ar: {
            title: "منهجيتنا في مواجهة خطاب الكراهية",
            subtitle: ""
        },
        en: {
            title: "Our Methodology",
            subtitle: ""
        },
        ku: {
            title: "Metodolojiya Me",
            subtitle: ""
        }
    };

    const t = content[locale as keyof typeof content] || content.ar;
    const isRtl = locale === 'ar';

    return (
        <div className="min-h-screen bg-[#F9FAFB]" dir={isRtl ? 'rtl' : 'ltr'}>
            <AppHeader />
            <PageHero
                icon="🧭"
                title={t.title}
                subtitle={t.subtitle}
            />
            <main className="container mx-auto px-4 py-8 md:py-12">
                <MethodologySections />
            </main>
            <AppFooter />
        </div>
    );
}
