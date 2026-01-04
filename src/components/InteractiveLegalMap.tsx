'use client';

import React, { useState } from 'react';
import { COUNTRY_LEGAL_DATA } from '../lib/countryReportingData';
import CountryLegalModal from './CountryLegalModal';
import { useTranslations } from 'next-intl';

interface InteractiveLegalMapProps {
    selectedCountry: string | null;
    onSelectCountry: (country: string | null) => void;
}

type CountryBadgeProps = {
    country: string;
    top: string;
    left: string;
    size?: 'sm' | 'md' | 'lg';
    hoveredCountry: string | null;
    onClick: (country: string) => void;
    onHoverChange: (country: string | null) => void;
};

const CountryBadge = ({
    country,
    top,
    left,
    size = 'md',
    hoveredCountry,
    onClick,
    onHoverChange
}: CountryBadgeProps) => {
    const sizeClasses = {
        sm: 'w-10 h-10 text-xl',
        md: 'w-12 h-12 text-2xl',
        lg: 'w-14 h-14 text-3xl'
    };

    const positionStyle = { top, left, transform: 'translate(-50%, -50%)' as const };
    const isHovered = hoveredCountry === country;

    return (
        <button
            onClick={() => onClick(country)}
            onMouseEnter={() => onHoverChange(country)}
            onMouseLeave={() => onHoverChange(null)}
            className={`absolute transition-all duration-300 ${isHovered ? 'scale-125 z-50' : 'hover:scale-110 z-10'
                }`}
            style={positionStyle}
            aria-label={COUNTRY_LEGAL_DATA[country]?.countryName || country}
        >
            <div className={`${sizeClasses[size]} rounded-full bg-white border-3 ${isHovered
                ? 'border-green-500 shadow-2xl ring-4 ring-green-200'
                : 'border-gray-300 shadow-lg'
                } flex items-center justify-center transition-all duration-300 relative`}>
                {isHovered && (
                    <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
                )}
                <span className="relative z-10">{COUNTRY_LEGAL_DATA[country]?.flag}</span>
            </div>
        </button>
    );
};

export default function InteractiveLegalMap({ selectedCountry, onSelectCountry }: InteractiveLegalMapProps) {
    const t = useTranslations('legal.map');
    const tCountries = useTranslations('legal.countries');
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    const handleCountryClick = (countryName: string) => {
        onSelectCountry(countryName);
    };

    const countries = Object.keys(COUNTRY_LEGAL_DATA);

    return (
        <div className="space-y-6">
            {/* Header with View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-900 border-r-4 border-green-600 pr-4">
                    🗺️ {t('title')}
                </h2>

                {/* View Mode Toggle */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'map'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-transparent text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        🗺️ {t('mapView')}
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'list'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-transparent text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        📋 {t('listView')}
                    </button>
                </div>
            </div>

            {viewMode === 'map' ? (
                /* Map View */
                <div
                    className="relative bg-gradient-to-br from-blue-50 via-blue-25 to-green-50 rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-200 overflow-hidden"
                    style={{
                        backgroundImage: 'url(/realistic-world-map.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '500px'
                    }}
                >
                    {/* Lighter Overlay */}
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px] rounded-3xl"></div>

                    {/* Map Content */}
                    <div className="relative z-10 h-full">
                        <div className="relative w-full h-full min-h-[450px]">

                            {/* Europe - Optimized Spacing */}
                            <CountryBadge country="Sweden" top="12%" left="54%" size="md" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                            <CountryBadge country="UK" top="24%" left="42%" size="md" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                            <CountryBadge country="Netherlands" top="22%" left="50%" size="sm" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                            <CountryBadge country="Belgium" top="28%" left="48%" size="sm" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                            <CountryBadge country="Germany" top="27%" left="53%" size="md" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                            <CountryBadge country="France" top="36%" left="46%" size="md" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                            <CountryBadge country="Switzerland" top="39%" left="51%" size="sm" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                            <CountryBadge country="Austria" top="37%" left="56%" size="sm" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                            <CountryBadge country="Spain" top="48%" left="42%" size="md" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />

                            {/* Middle East */}
                            <CountryBadge country="Turkey" top="42%" left="65%" size="md" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                            <CountryBadge country="Syria" top="52%" left="68%" size="md" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />

                            {/* North America */}
                            <CountryBadge country="Canada" top="20%" left="18%" size="md" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                            <CountryBadge country="USA" top="40%" left="20%" size="md" hoveredCountry={hoveredCountry} onClick={handleCountryClick} onHoverChange={setHoveredCountry} />
                        </div>

                        {/* Elegant Hover Tooltip */}
                        {hoveredCountry && (
                            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{COUNTRY_LEGAL_DATA[hoveredCountry]?.flag}</span>
                                        <div>
                                            <div className="text-xl font-bold">
                                                {tCountries(hoveredCountry)}
                                            </div>
                                            <div className="text-xs opacity-90">{t('clickMore')} ←</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hint */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:hidden">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-700 shadow-md">
                            💡 {t('mobileHint')} ↑
                        </div>
                    </div>
                </div>
            ) : (
                /* List View - Mobile Friendly */
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {countries.map((country) => (
                        <button
                            key={country}
                            onClick={() => handleCountryClick(country)}
                            className="bg-white p-6 rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all text-right group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-5xl group-hover:scale-110 transition-transform">
                                    {COUNTRY_LEGAL_DATA[country]?.flag}
                                </span>
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {tCountries(country)}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {COUNTRY_LEGAL_DATA[country]?.countryName}
                                    </p>
                                </div>
                                <span className="text-green-600 text-2xl group-hover:translate-x-1 transition-transform">
                                    ←
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Country Modal */}
            {selectedCountry && COUNTRY_LEGAL_DATA[selectedCountry] && (
                <CountryLegalModal
                    country={COUNTRY_LEGAL_DATA[selectedCountry]}
                    onClose={() => onSelectCountry(null)}
                />
            )}
        </div>
    );
}
