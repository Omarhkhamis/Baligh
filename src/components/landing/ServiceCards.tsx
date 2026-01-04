'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const services = [
    {
        id: 'tool', // Prioritize Tool first visually or emphasize it in place
        icon: '⚡',
        color: 'emerald',
        href: '/analyze',
        featured: true
    },
    {
        id: 'legal',
        icon: '⚖️',
        color: 'blue',
        href: '/legal'
    },
    {
        id: 'protection',
        icon: '🛡️',
        color: 'green',
        href: '/protection'
    },
    {
        id: 'training',
        icon: '🎓',
        color: 'orange',
        href: '/training'
    }
];

export default function ServiceCards() {
    const locale = useLocale();
    const t = useTranslations('landing.services');

    return (
        <section id="services" className="py-12 md:py-24 bg-gray-50/50">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 drop-shadow-sm">
                        {t('title')}
                    </h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Service Cards Grid - Flex or Grid for hierarchy */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto align-stretch">
                    {services.map((service) => (
                        <Link
                            key={service.id}
                            href={`/${locale}${service.href}`}
                            className={`group relative flex flex-col p-8 rounded-3xl transition-all duration-300 h-full border hover:border-transparent ${service.featured
                                ? 'bg-white shadow-xl hover:shadow-2xl scale-[1.02] z-10 border-green-100 ring-1 ring-green-50'
                                : 'bg-white shadow-sm hover:shadow-xl border-gray-100'
                                }`}
                        >
                            {/* Featured Badge */}
                            {service.featured && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md tracking-wide uppercase">
                                    {t('tool.cta')} {/* Using existing text as label contextually */}
                                </span>
                            )}

                            {/* Icon */}
                            <div className={`text-5xl mb-8 transform group-hover:scale-110 transition-transform duration-300 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto ${service.featured ? 'bg-green-50' : 'bg-gray-50'
                                }`}>
                                {service.icon}
                            </div>

                            {/* Title */}
                            <h3 className={`text-xl font-bold mb-4 text-center ${service.featured ? 'text-green-800' : 'text-gray-900'}`}>
                                {t(`${service.id}.title`)}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-500 text-base leading-loose text-center mb-8 flex-grow">
                                {t(`${service.id}.description`)}
                            </p>

                            {/* CTA Arrow */}
                            <div className={`flex items-center justify-center gap-2 font-bold text-sm mt-auto transition-colors ${service.featured ? 'text-green-700 group-hover:text-green-800' : 'text-gray-400 group-hover:text-gray-900'
                                }`}>
                                <span>{t(`${service.id}.cta`)}</span>
                                <svg className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="mt-16 text-center">
                    <p className="text-gray-400 text-base font-medium">
                        {t('features')}
                    </p>
                </div>
            </div>
        </section>
    );
}
