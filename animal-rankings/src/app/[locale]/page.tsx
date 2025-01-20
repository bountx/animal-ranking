import { AnimalList } from '@/components/AnimalList';
import { Header } from '@/components/Header';

export default async function Home(
    props: {
        params: Promise<{ locale: string }>;
    }
) {
    const params = await props.params;
    // Wrap params in Promise.resolve() to await them even though they're synchronous
    const { locale } = await Promise.resolve(params);

    return (
        <div className="min-h-screen bg-gray-100">
            <Header locale={locale} />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">
                    {locale === 'en' ? 'Explore Animals' : 'Odkryj Zwierzęta'}
                </h1>
                <AnimalList locale={locale} />
            </main>
        </div>
    );
}

export function generateStaticParams() {
    return [
        { locale: 'en' },
        { locale: 'pl' }
    ];
}
