'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function AppHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const locale = useLocale();
    const pathname = usePathname();
        const t = useTranslations('header');
    const langMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll);

        // Close language menu when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setIsLangMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Full nav links for mobile menu (includes all pages)
    const mobileNavLinks = [
        { href: `/${locale}`, label: t('nav.home'), icon: '🏠', description: locale === 'ar' ? 'الصفحة الرئيسية' : 'Home Page' },
        { href: `/${locale}/about`, label: t('topBar.about'), icon: '👤', description: locale === 'ar' ? 'من نحن' : 'About Us' },
        { href: `/${locale}/methodology`, label: t('topBar.methodology'), icon: '🧭', description: locale === 'ar' ? 'المنهجية' : 'Methodology' },
        { href: `/${locale}/legal`, label: t('nav.legal'), icon: '⚖️', description: locale === 'ar' ? 'الإطار القانوني' : 'Legal Framework' },
        { href: `/${locale}/protection`, label: t('nav.protection'), icon: '🛡️', description: locale === 'ar' ? 'الحماية الرقمية' : 'Digital Protection' },
        { href: `/${locale}/training`, label: t('nav.training'), icon: '🎓', description: locale === 'ar' ? 'التدريب' : 'Training' },
        { href: `/${locale}/reports`, label: t('nav.reports'), icon: '📊', description: locale === 'ar' ? 'التقارير' : 'Reports' },
        { href: `/${locale}/news`, label: t('nav.news'), icon: '📰', description: locale === 'ar' ? 'الأخبار' : 'News' },
        { href: `/${locale}/faq`, label: t('nav.faq'), icon: '❓', description: locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ' },
    ];

    const isActive = (href: string) => {
        if (href === `/${locale}`) {
            return pathname === href || pathname === `/${locale}/`;
        }
        return pathname === href;
    };

    return (
        <header className={`sticky top-0 z-50 bg-white transition-shadow border-b border-gray-100 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between" style={{ height: '72px' }}>
                    {/* Brand Text Only - Enhanced */}
                    <Link href={`/${locale}/`} className="flex items-center gap-5 hover:opacity-80 transition-all px-2 group">
                        <span className="text-3xl md:text-5xl font-bold pt-1 text-[#1E8C4E] group-hover:text-[#166639] transition-colors">
                            بَلِّغ
                        </span>
                        <span className="hidden md:block h-10 w-px bg-gray-200 mx-1"></span>
                        <span className="hidden md:block text-lg text-gray-700 font-medium font-tajawal pt-1">
                            {t('brand.subtitle')}
                        </span>
                    </Link>

                    {/* Desktop: Language Switcher + CTA */}
                    <div className="hidden lg:flex items-center gap-4">
                        {/* CTA Button */}
                        <Link
                            href={`/${locale}/analyze`}
                            className="px-6 py-2.5 rounded-full font-bold text-white text-sm transition-all hover:shadow-lg shadow-md hover:-translate-y-0.5 flex items-center gap-2"
                            style={{ backgroundColor: '#1E8C4E' }}
                        >
                            <span>🚀</span>
                            <span>{t('cta')}</span>
                        </Link>

                        {/* Language Switcher */}
                        <div className="relative" ref={langMenuRef}>
                            <button
                                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
                                aria-label="Select Language"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium uppercase">{locale}</span>
                                <svg className={`w-4 h-4 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown */}
                            {isLangMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in z-50">
                                    <Link
                                        href={`/ar${pathname.replace(/^\/(ar|en|ku)/, '') || '/'}`}
                                        onClick={() => setIsLangMenuOpen(false)}
                                        className={`block px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${locale === 'ar' ? 'text-green-600 font-bold bg-green-50' : 'text-gray-700'}`}
                                    >
                                        العربية
                                    </Link>
                                    <Link
                                        href={`/en${pathname.replace(/^\/(ar|en|ku)/, '') || '/'}`}
                                        onClick={() => setIsLangMenuOpen(false)}
                                        className={`block px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${locale === 'en' ? 'text-green-600 font-bold bg-green-50' : 'text-gray-700'}`}
                                    >
                                        English
                                    </Link>
                                    <Link
                                        href={`/ku${pathname.replace(/^\/(ar|en|ku)/, '') || '/'}`}
                                        onClick={() => setIsLangMenuOpen(false)}
                                        className={`block px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${locale === 'ku' ? 'text-green-600 font-bold bg-green-50' : 'text-gray-700'}`}
                                    >
                                        Kurdî
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile/Tablet: Language Switcher + CTA + Menu Button */}
                    <div className="flex lg:hidden items-center gap-3">
                        {/* Language Switcher - Mobile/Tablet - Cycle AR->EN->KU */}
                        <Link
                            href={`/${locale === 'ar' ? 'en' : locale === 'en' ? 'ku' : 'ar'}${pathname.replace(/^\/(ar|en|ku)/, '') || '/'}`}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-[#1E8C4E] transition-all"
                        >
                            <span className="text-xs font-bold">{locale === 'ar' ? 'EN' : locale === 'en' ? 'KU' : 'ع'}</span>
                        </Link>

                        {/* CTA Button - Tablet+ */}
                        <Link
                            href={`/${locale}/analyze`}
                            className="hidden md:block px-6 py-2.5 rounded-full font-bold text-white text-sm transition-all hover:shadow-lg shadow-md hover:-translate-y-0.5"
                            style={{ backgroundColor: '#1E8C4E' }}
                        >
                            {t('cta')}
                        </Link>

                        {/* Menu Button - Modernized */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2.5 rounded-full transition-all duration-300 ${isMenuOpen ? 'bg-red-50 text-red-600 rotate-90' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                            aria-label={t('menuLabel')}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Secondary Navigation Bar - Hidden on mobile */}
            <div className="hidden md:block border-t border-gray-100 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-center gap-2 py-4 flex-wrap">
                        {[
                            { href: `/${locale}/about`, label: t('topBar.about') },
                            { href: `/${locale}/methodology`, label: t('topBar.methodology') },
                            { href: `/${locale}/legal`, label: t('nav.legal'), icon: '⚖️' },
                            { href: `/${locale}/protection`, label: t('nav.protection'), icon: '🛡️' },
                            { href: `/${locale}/training`, label: t('nav.training'), icon: '🎓' },
                            { href: `/${locale}/reports`, label: t('nav.reports'), icon: '📊' },
                            { href: `/${locale}/news`, label: t('nav.news'), icon: '📰' },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${isActive(link.href)
                                    ? 'text-green-700 bg-green-50 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-lg">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer - Enhanced */}
            {isMenuOpen && (
                <nav
                    className="lg:hidden fixed inset-0 bg-white z-40 overflow-y-auto animate-fade-in"
                    style={{ top: '153px', paddingTop: '24px', paddingBottom: '24px' }}
                >
                    <div className="flex flex-col">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-6 left-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Mobile Menu CTA */}
                        <div className="px-6 mt-8 mb-6">
                            <Link
                                href={`/${locale}/analyze`}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                                style={{ backgroundColor: '#1E8C4E' }}
                            >
                                <span>🚀</span>
                                <span>{t('cta')}</span>
                            </Link>
                        </div>

                        {/* Menu Heading */}
                        <div className="px-6 mb-4">
                            <h3 className="text-lg font-bold text-gray-900">{locale === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</h3>
                        </div>

                        {/* Main Services */}
                        <div className="mb-4">
                            {mobileNavLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-start gap-4 px-6 py-4 transition-all ${isActive(link.href)
                                        ? 'bg-green-50 border-r-4 border-green-600'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-2xl flex-shrink-0">{link.icon}</span>
                                    <div className="flex-1">
                                        <div className={`text-base font-semibold ${isActive(link.href) ? 'text-green-700' : 'text-gray-900'}`}>
                                            {link.label}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-0.5">
                                            {link.description}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="mx-6 my-4 border-t border-gray-200"></div>

                        {/* Language Switcher for Mobile */}
                        <div className="px-6 mb-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                {locale === 'ar' ? 'اللغة' : 'Language'}
                            </p>
                            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                <Link
                                    href={`/ar${pathname.replace(/^\/(ar|en|ku)/, '') || '/'}`}
                                    className={`flex-1 text-center py-2 rounded-lg text-sm font-bold transition-all ${locale === 'ar' ? 'bg-[#1E8C4E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200/50'}`}
                                >
                                    العربية
                                </Link>
                                <Link
                                    href={`/en${pathname.replace(/^\/(ar|en|ku)/, '') || '/'}`}
                                    className={`flex-1 text-center py-2 rounded-lg text-sm font-bold transition-all ${locale === 'en' ? 'bg-[#1E8C4E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200/50'}`}
                                >
                                    English
                                </Link>
                                <Link
                                    href={`/ku${pathname.replace(/^\/(ar|en|ku)/, '') || '/'}`}
                                    className={`flex-1 text-center py-2 rounded-lg text-sm font-bold transition-all ${locale === 'ku' ? 'bg-[#1E8C4E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200/50'}`}
                                >
                                    Kurdî
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>
            )}
        </header>
    );
}
