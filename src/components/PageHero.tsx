'use client';


interface PageHeroProps {
    title: string;
    subtitle?: string;
    icon?: string;
}

export default function PageHero({ title, subtitle, icon }: PageHeroProps) {
    return (
        <div className="bg-gradient-to-br from-green-50/80 to-white border-b border-gray-100">
            <div className="container mx-auto px-6 py-4"> {/* Reduced padding from py-5 to py-4 */}
                <div className="max-w-3xl mx-auto text-center">
                    {icon && (
                        <div className="text-2xl mb-1"> {/* Reduced size from 3xl to 2xl, margin mb-2 to mb-1 */}
                            {icon}
                        </div>
                    )}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 leading-tight"> {/* Reduced margin mb-2 to mb-1 */}
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto"> {/* Removed md:text-lg to keep it lighter */}
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
