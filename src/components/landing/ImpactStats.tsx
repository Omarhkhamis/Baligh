'use client';

import { useTranslations } from 'next-intl';

const stats = [
    { id: 'texts', value: '5,000+', key: 'texts' },
    { id: 'workshops', value: '20+', key: 'workshops' },
    { id: 'countries', value: '9', key: 'countries' },
    { id: 'accuracy', value: '95%', key: 'accuracy' }
];

export default function ImpactStats() {
    const t = useTranslations('landing.stats');

    return (
        <section className="py-20 bg-gradient-to-br from-green-700 to-green-900 text-white">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        تأثيرنا بالأرقام
                    </h2>
                    <p className="text-lg text-green-100 max-w-2xl mx-auto">
                        نعمل معاً لبناء فضاء رقمي أكثر أماناً
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                    {stats.map((stat) => (
                        <div key={stat.id} className="text-center">
                            {/* Value */}
                            <div className="text-4xl md:text-5xl font-extrabold mb-2">
                                {stat.value}
                            </div>

                            {/* Label */}
                            <div className="text-sm md:text-base text-green-100 font-medium">
                                {t(stat.key)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="mt-16 text-center">
                    <p className="text-green-100 text-sm md:text-base">
                        انضم إلى آلاف المستخدمين الذين يثقون في منصة بَلِّغ
                    </p>
                </div>
            </div>
        </section>
    );
}
