"use client";

import { useState, useEffect } from 'react';
import { Animal, Rating, AnimalTranslation } from '@/types';
import { supabase } from '@/lib/supabase';
import { RATING_CATEGORIES } from '@/constants/ratings';
import { Info, Loader2 } from 'lucide-react';
import Link from 'next/link';

type RatingCategory = keyof Rating;
type SortCategory = RatingCategory | 'average';

interface AverageScores extends Record<RatingCategory, number> { }

interface AnimalWithRatings extends Animal {
    ratings: Rating[];
    averageRating: number;
    averageScores: AverageScores;
}

interface RankingsProps {
    language: 'en' | 'pl';
}

export function Rankings({ language }: RankingsProps) {
    const [rankings, setRankings] = useState<AnimalWithRatings[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortCategory>('average');

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-green-300';
        if (score >= 40) return 'bg-yellow-300';
        if (score >= 20) return 'bg-red-300';
        return 'bg-red-500';
    };

    const getSortedRankings = (animals: AnimalWithRatings[], category: SortCategory) => {
        return [...animals].sort((a, b) => {
            if (category === 'average') {
                return b.averageRating - a.averageRating;
            }
            return b.averageScores[category] - a.averageScores[category];
        });
    };

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const { data: animalsData, error: animalsError } = await supabase
                    .from('animals')
                    .select(`
                        *,
                        animal_images (
                            image_url
                        )
                    `);

                if (animalsError) throw animalsError;

                let translations: { [key: string]: AnimalTranslation } = {};
                if (language !== 'en') {
                    const { data: translationsData, error: translationsError } = await supabase
                        .from('animal_translations')
                        .select('*')
                        .eq('language', language);

                    if (translationsError) throw translationsError;

                    translations = translationsData?.reduce((acc: { [key: string]: AnimalTranslation }, translation: AnimalTranslation) => {
                        acc[translation.original_name] = translation;
                        return acc;
                    }, {});
                }

                const { data: ratingsData, error: ratingsError } = await supabase
                    .from('ratings')
                    .select('*');

                if (ratingsError) throw ratingsError;

                const ratingsByAnimal: { [key: string]: Rating[] } = ratingsData?.reduce((acc: { [key: string]: Rating[] }, rating: Rating) => {
                    if (!acc[rating.animal_id]) {
                        acc[rating.animal_id] = [];
                    }
                    acc[rating.animal_id].push(rating);
                    return acc;
                }, {});

                type ScoreCategories = Record<string, number>;
                const processedAnimals = animalsData.map(animal => {
                    const animalRatings = ratingsByAnimal[animal.id] || [];

                    const categoryScores = Object.keys(RATING_CATEGORIES[language]).reduce((acc: ScoreCategories, category) => {
                        const key = category.toLowerCase();
                        acc[key] = animalRatings.length > 0
                            ? animalRatings.reduce((sum, rating) => sum + (Number(rating[key as keyof Rating]) || 0), 0) / animalRatings.length
                            : 0;
                        return acc;
                    }, {});

                    const totalAverage = animalRatings.length > 0
                        ? (Object.values(categoryScores) as number[]).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length
                        : 0;

                    return {
                        ...animal,
                        translations: translations[animal.name] ? [translations[animal.name]] : [],
                        ratings: animalRatings,
                        averageRating: totalAverage,
                        averageScores: categoryScores as AverageScores
                    };
                });

                setRankings(getSortedRankings(processedAnimals, sortBy));
                setLoading(false);
            } catch (err) {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred');
                setLoading(false);
            }
        };

        fetchRankings();
    }, [language]);

    useEffect(() => {
        setRankings(getSortedRankings(rankings, sortBy));
    }, [sortBy]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    const categories = RATING_CATEGORIES[language];

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-4">
                <h2 className="text-2xl font-bold">
                    {language === 'en' ? 'Overall Rankings' : 'Ranking Ogólny'}
                </h2>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSortBy('average')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
                            ${sortBy === 'average'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {language === 'en' ? 'Average Score' : 'Średnia Ocen'}
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

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {rankings.map((animal, index) => {
                        const translation = animal.translations?.find(t => t.language === language);
                        const displayName = language === 'en' ? animal.name : (translation?.translated_name || animal.name);
                        const ratingCount = animal.ratings.length;

                        return (
                            <div
                                key={animal.id}
                                className="p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-4 mb-2">
                                    <Link href={`/${language}/animal/${animal.id}`} className="flex items-center gap-4 flex-grow">
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
                                                {language === 'en'
                                                    ? `Rank #${index + 1} • ${ratingCount} rating${ratingCount !== 1 ? 's' : ''}`
                                                    : `Pozycja #${index + 1} • ${ratingCount} ocen${ratingCount === 1 ? 'a' : ''}`}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-1 text-lg font-semibold">
                                        {sortBy === 'average'
                                            ? animal.averageRating.toFixed(1)
                                            : animal.averageScores[sortBy].toFixed(1)
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
                                            const score = Math.round(animal.averageScores[key.toLowerCase() as keyof typeof animal.averageScores]);
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
        </div>
    );
}