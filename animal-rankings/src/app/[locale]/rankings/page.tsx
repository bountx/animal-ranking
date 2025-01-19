// src/app/[locale]/rankings/page.tsx
import { Rankings } from '@/components/Rankings';
import { Header } from '@/components/Header';

interface RankingsPageProps {
    params: {
        locale: string;
    };
}

export default async function RankingsPage({ params }: RankingsPageProps) {
    const { locale } = await Promise.resolve(params);

    return (
        <div className="min-h-screen bg-gray-100">
            <Header locale={locale} />
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