'use client';

import { useState, useEffect } from 'react';

interface NavItem {
    id: string;
    label: string;
}

interface AnchorNavProps {
    items: NavItem[];
    locale: string;
}

export default function AnchorNav({ items, locale }: AnchorNavProps) {
    const [activeSection, setActiveSection] = useState(items[0]?.id || '');
    const isRTL = locale === 'ar';

    useEffect(() => {
        const handleScroll = () => {
            const sections = items.map(item => document.getElementById(item.id));
            const scrollPosition = window.scrollY + 150;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(items[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [items]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 120;
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({ top: elementPosition, behavior: 'smooth' });
        }
    };

    return (
        <nav
            className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className="container mx-auto px-4">
                <div className="flex overflow-x-auto hide-scrollbar py-3 gap-1">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeSection === item.id
                                ? 'bg-[#0099CC] text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </nav>
    );
}
