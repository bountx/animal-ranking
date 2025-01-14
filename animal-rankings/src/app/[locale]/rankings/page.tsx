// src/app/[locale]/rankings/page.tsx
import { Rankings } from '@/components/Rankings';

interface RankingsPageProps {
    params: {
        locale: string;
    };
}

export default async function RankingsPage({ params }: RankingsPageProps) {
    const locale = await params.locale;

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Rankings language={locale as 'en' | 'pl'} />
            </div>
        </div>
    );
}

// Add generateStaticParams to pre-render pages
export function generateStaticParams() {
    return [
        { locale: 'en' },
        { locale: 'pl' }
    ];
}