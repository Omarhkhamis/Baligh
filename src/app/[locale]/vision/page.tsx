'use client';

import { useLocale } from 'next-intl';
import AppHeader from '../../../components/AppHeader';
import AppFooter from '../../../components/AppFooter';
import PageHero from '../../../components/PageHero';
import VisionSection from '../../../components/VisionSection';

export default function VisionPage() {
    const locale = useLocale();

    // English content
    if (locale === 'en') {
        return (
            <div className="min-h-screen bg-gray-50">
                <AppHeader />

                <PageHero
                    icon="🎯"
                    title="Our Vision & Strategic Goals"
                    subtitle="Building a digital space free from hate speech—rooted in respect, inclusivity, and accountability"
                />

                <main className="container mx-auto px-4 py-16">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* Vision */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border-l-4 border-blue-500 shadow-lg">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="text-4xl">🌟</span>
                                Our Vision
                            </h2>
                            <p className="text-lg text-gray-800 leading-relaxed">
                                A digital space free from hate speech and violence—rooted in respect, inclusivity, and peaceful coexistence—where those who incite harm are held legally accountable.
                            </p>
                        </div>

                        {/* Mission */}
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl border-l-4 border-green-500 shadow-lg">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="text-4xl">🎯</span>
                                Our Mission
                            </h2>
                            <p className="text-lg text-gray-800 leading-relaxed">
                                To monitor, document, and pursue accountability for hate speech and digital incitement using scientific methods and advanced technologies, in order to protect communities and strengthen social peace.
                            </p>
                        </div>

                        {/* Strategic Goals Header */}
                        <div className="text-center pt-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Strategic Goals</h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
                        </div>

                        {/* Goal 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="text-3xl">📊</span>
                                Comprehensive Monitoring
                            </h3>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Developing a robust and continuously updated database that captures the full spectrum of hate speech and violent content circulating in digital spaces.
                            </p>
                        </div>

                        {/* Goal 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="text-3xl">⚖️</span>
                                Legal Accountability
                            </h3>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Providing verified evidence and analytical reports to judicial and relevant authorities to support the prosecution of individuals or entities engaging in incitement.
                            </p>
                        </div>

                        {/* Goal 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <span className="text-3xl">🛡️</span>
                                Protection & Awareness
                            </h3>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Empowering individuals and communities with the knowledge and tools needed to identify, resist, and report harmful speech, while promoting a safer and more informed digital culture.
                            </p>
                        </div>

                        {/* Contact CTA */}
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-10 rounded-2xl border-2 border-green-200 text-center mt-16">
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h3>
                            <p className="text-lg text-gray-700 mb-6">For inquiries, partnerships, or reporting harmful content:</p>
                            <a href="mailto:contact@baligh.org" className="inline-block bg-gradient-to-r from-green-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105">
                                📧 contact@baligh.org
                            </a>
                        </div>
                    </div>
                </main>

                <AppFooter />
            </div>
        );
    }

    // Arabic content (default)
    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader />

            <PageHero
                icon="🎯"
                title="رؤيتنا وأهدافنا الاستراتيجية"
                subtitle="بناء فضاء رقمي خالٍ من خطاب الكراهية—قائم على الاحترام، الشمولية، والمساءلة"
            />

            <VisionSection />

            <AppFooter />
        </div>
    );
}
