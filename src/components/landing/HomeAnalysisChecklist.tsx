import AnalysisChecklist from '@/components/protection-tabs/components/AnalysisChecklist';

export default function HomeAnalysisChecklist() {
    return (
        <section className="bg-white px-4 py-10 md:py-14">
            <div className="mx-auto max-w-6xl">
                <div className="rounded-[30px] border border-green-100/80 bg-[linear-gradient(180deg,#fbfefb_0%,#f2fbf5_100%)] p-4 shadow-[0_24px_70px_-48px_rgba(30,140,78,0.24)] md:p-6">
                    <AnalysisChecklist variant="green" />
                </div>
            </div>
        </section>
    );
}
