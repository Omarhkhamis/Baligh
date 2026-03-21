import { redirect } from 'next/navigation';

type PageProps = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function MonitoringReportPrintPage({ params }: PageProps) {
    const { locale } = await params;
    redirect(`/${locale}/monitoring`);
}
