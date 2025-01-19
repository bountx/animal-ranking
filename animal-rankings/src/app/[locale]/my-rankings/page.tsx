"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Animal, Rating, AnimalTranslation } from '@/types';
import { RATING_CATEGORIES } from '@/constants/ratings';

type RatingCategory = keyof Rating;
type SortCategory = RatingCategory | 'average';

interface AnimalWithScores extends Animal {
    scores: Record<RatingCategory, number>;
    averageScore: number;
}

interface MyRankingsProps {
    params: Promise<{
        locale: string;
    }>;
}

export default function MyRankings({ params }: MyRankingsProps) {
    const { locale } = use(params);
    const [animals, setAnimals] = useState<AnimalWithScores[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortCategory>('average');
    const router = useRouter();

    const getSortedAnimals = (animals: AnimalWithScores[], category: SortCategory) => {
        return [...animals].sort((a, b) => {
            if (category === 'average') {
                return b.averageScore - a.averageScore;
            }
            return b.scores[category] - a.scores[category];
        });
    };

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push(`/${locale}`);
                return;
            }
        };

        checkAuth();
    }, [locale, router]);

    useEffect(() => {
        setAnimals(getSortedAnimals(animals, sortBy));
    }, [sortBy]);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user?.id) return;

                const { data: animalsData, error: animalsError } = await supabase
                    .from('animals')
                    .select(`
                        *,
                        animal_images (
                            image_url
                        ),
                        ratings!inner (
                            color,
                            relative_strength,
                            curiosity,
                            history,
                            survival_mechanism,
                            shape,
                            intelligence,
                            relative_speed,
                            world_attitude,
                            overall_coolness
                        )
                    `)
                    .eq('ratings.user_id', session.user.id);

                if (animalsError) throw animalsError;

                let translations: { [key: string]: AnimalTranslation } = {};
                if (locale !== 'en') {
                    const { data: translationsData, error: translationsError } = await supabase
                        .from('animal_translations')
                        .select('*')
                        .eq('language', locale);

                    if (translationsError) throw translationsError;

                    translations = translationsData?.reduce((acc: { [key: string]: AnimalTranslation }, translation: AnimalTranslation) => {
                        acc[translation.original_name] = translation;
                        return acc;
                    }, {});
                }

                const processedAnimals = animalsData.map(animal => {
                    const scores = animal.ratings[0];
                    const scoreValues = Object.values(scores).filter(val => typeof val === 'number') as number[];
                    const averageScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;

                    return {
                        ...animal,
                        translations: translations[animal.name] ? [translations[animal.name]] : [],
                        scores,
                        averageScore
                    };
                });

                setAnimals(getSortedAnimals(processedAnimals, sortBy));
            } catch (err) {
                console.error('Error fetching rankings:', err);
                setError(locale === 'en' ?
                    'Error loading your rankings' :
                    'Błąd podczas ładowania rankingów');
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, [locale]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-green-300';
        if (score >= 40) return 'bg-yellow-300';
        if (score >= 20) return 'bg-red-300';
        return 'bg-red-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Header locale={locale} />
                <main className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                </main>
            </div>
        );
    }

    if (error) return <div className="text-red-600">{error}</div>;

    const categories = RATING_CATEGORIES[locale as 'en' | 'pl'];

    return (
        <div className="min-h-screen bg-gray-100">
            <Header locale={locale} />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col space-y-4 mb-8">
                    <h1 className="text-3xl font-bold">
                        {locale === 'en' ? 'My Animal Rankings' : 'Moje Rankingi Zwierząt'}
                    </h1>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSortBy('average')}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
                                ${sortBy === 'average'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {locale === 'en' ? 'Average Score' : 'Średnia Ocen'}
                        </button>
                        {Object.entries(categories).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key.toLowerCase() as RatingCategory)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
                                    ${sortBy === key.toLowerCase()
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {animals.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">
                            {locale === 'en'
                                ? "You haven't rated any animals yet"
                                : "Nie oceniłeś jeszcze żadnych zwierząt"}
                        </p>
                        <Link
                            href={`/${locale}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            {locale === 'en' ? 'Explore Animals' : 'Odkryj Zwierzęta'}
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {animals.map((animal, index) => {
                                const translation = animal.translations?.find(t => t.language === locale);
                                const displayName = locale === 'en' ? animal.name : (translation?.translated_name || animal.name);

                                return (
                                    <div
                                        key={animal.id}
                                        className="p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4 mb-2">
                                            <Link href={`/${locale}/animal/${animal.id}`} className="flex items-center gap-4 flex-grow">
                                                <div className="flex-shrink-0 w-12 h-12">
                                                    {animal.animal_images?.[0]?.image_url ? (
                                                        <img
                                                            src={animal.animal_images[0].image_url}
                                                            alt={displayName}
                                                            className="w-full h-full object-cover rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 rounded-full" />
                                                    )}
                                                </div>
                                                <div className="flex-grow">
                                                    <h2 className="text-lg font-medium text-gray-900">
                                                        {displayName}
                                                    </h2>
                                                    <p className="text-sm text-gray-500">
                                                        {locale === 'en' ? 'Rank' : 'Pozycja'}: #{index + 1}
                                                    </p>
                                                </div>
                                            </Link>
                                            <div className="flex items-center gap-1 text-lg font-semibold">
                                                {sortBy === 'average'
                                                    ? animal.averageScore.toFixed(1)
                                                    : animal.scores[sortBy].toFixed(1)
                                                }
                                            </div>
                                            <button
                                                onClick={() => setSelectedAnimalId(selectedAnimalId === animal.id ? null : animal.id)}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <Info className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>

                                        {selectedAnimalId === animal.id && (
                                            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                                                {Object.entries(categories).map(([key, label]) => {
                                                    const score = animal.scores[key.toLowerCase() as keyof typeof animal.scores];
                                                    return (
                                                        <div key={key} className="flex flex-col items-center bg-gray-50 rounded p-2">
                                                            <div className={`text-sm font-medium ${getScoreColor(score)} px-2 py-1 rounded text-white`}>
                                                                {score}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1 text-center">
                                                                {label}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}