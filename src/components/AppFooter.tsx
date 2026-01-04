'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function AppFooter() {
    const locale = useLocale();
    const t = useTranslations('footer');
    const tNav = useTranslations('header.nav');

    const quickLinks = [
        { href: `/${locale}`, label: tNav('home') },
        { href: `/${locale}/about`, label: tNav('about') },
        { href: `/${locale}/news`, label: tNav('news') },
        { href: `/${locale}/faq`, label: tNav('faq') },
    ];

    const servicesLinks = [
        { href: `/${locale}/legal`, label: tNav('legal') },
        { href: `/${locale}/protection`, label: tNav('protection') },
        { href: `/${locale}/monitoring`, label: tNav('monitoring') },
        { href: `/${locale}/training`, label: tNav('training') },
    ];

    return (
        <footer className="bg-[#243447] text-white mt-12 border-t border-gray-800">
            {/* Main Footer Content */}
            <div className="container mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <h3 className="text-4xl font-bold" style={{ color: '#1E8C4E' }}>
                            بَلِّغ
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            {t('brand.description')}
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://www.facebook.com/reportHS"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-600 transition-colors flex items-center justify-center"
                                aria-label="Facebook"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com/report.hs/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-pink-600 transition-colors flex items-center justify-center"
                                aria-label="Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.linkedin.com/company/baligh-initiative/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-[#0077b5] transition-colors flex items-center justify-center"
                                aria-label="LinkedIn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2 inline-block">{t('quickLinks.title')}</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2"
                                    >
                                        <span className="text-green-500 text-xs">›</span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2 inline-block">{t('services.title')}</h4>
                        <ul className="space-y-3">
                            {servicesLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2"
                                    >
                                        <span className="text-green-500 text-xs">›</span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2 inline-block">{t('contact.title')}</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="text-xl">📧</span>
                                <a href="mailto:contact@baligh.org" className="hover:text-green-400 transition-colors">
                                    contact@baligh.org
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-xl">📱</span>
                                <span>{t('contact.socialMedia')}</span>
                            </li>
                        </ul>
                        <Link
                            href={`/${locale}/#analyze`}
                            className="mt-6 inline-block px-6 py-3 rounded-lg font-bold text-white transition-all hover:shadow-lg hover:-translate-y-1 text-sm"
                            style={{ backgroundColor: '#1E8C4E' }}
                        >
                            {t('contact.cta')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700/50 bg-[#1f2d3d]">
                <div className="container mx-auto px-6 py-3">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm text-center md:text-left">
                            {t('copyright')}
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link href={`/${locale}/legal`} className="text-gray-500 hover:text-green-400 transition-colors">
                                {t('privacy')}
                            </Link>
                            <Link href={`/${locale}/faq`} className="text-gray-500 hover:text-green-400 transition-colors">
                                {t('terms')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
