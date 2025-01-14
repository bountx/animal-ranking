// src/app/[locale]/page.tsx
import { AnimalList } from '@/components/AnimalList';
import { LanguageSelector } from '@/components/LanguageSelector';

interface HomeProps {
    params: {
        locale: string;
    };
}

export default async function Home({ params }: HomeProps) {
    const { locale } = await Promise.resolve(params);

    return (
        <main className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Animal Rankings</h1>
                    <LanguageSelector currentLocale={locale} />
                </div>
                <AnimalList locale={locale} />
            </div>
        </main>
    );
}

// Add generateStaticParams to pre-render pages
export function generateStaticParams() {
    return [
        { locale: 'en' },
        { locale: 'pl' }
    ];
}