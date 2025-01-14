"use client";

import { useState, useEffect } from 'react';
import { Animal, Rating } from '@/types';
import { supabase } from '@/lib/supabase';
import { RATING_CATEGORIES } from '@/constants/ratings';

interface RankingsProps {
    language: 'en' | 'pl';
}

// Extended Animal type to include ratings and average
interface AnimalWithRatings extends Animal {
    ratings: Rating[];
    averageRating: number;
}

export function Rankings({ language }: RankingsProps) {
    const [rankings, setRankings] = useState<AnimalWithRatings[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                // First get all animals with their translations
                const { data: animalsData, error: animalsError } = await supabase
                    .from('animals')
                    .select('*');

                if (animalsError) {
                    console.error('Error fetching animals:', animalsError);
                    setError(animalsError.message);
                    return;
                }

                // Get translations if needed
                let translations: { [key: string]: { original_name: string; translated_name: string } } = {};
                if (language !== 'en') {
                    const { data: translationsData, error: translationsError } = await supabase
                        .from('animal_translations')
                        .select('*')
                        .eq('language', language);

                    if (translationsError) {
                        console.error('Error fetching translations:', translationsError);
                        setError(translationsError.message);
                        return;
                    }

                    translations = translationsData?.reduce((acc, translation) => {
                        acc[translation.original_name] = translation;
                        return acc;
                    }, {});
                }

                // Get ratings for all animals
                const { data: ratingsData, error: ratingsError } = await supabase
                    .from('ratings')
                    .select('*');

                if (ratingsError) {
                    console.error('Error fetching ratings:', ratingsError);
                    setError(ratingsError.message);
                    return;
                }

                // Group ratings by animal
                const ratingsByAnimal = ratingsData?.reduce((acc, rating) => {
                    if (!acc[rating.animal_id]) {
                        acc[rating.animal_id] = [];
                    }
                    acc[rating.animal_id].push(rating);
                    return acc;
                }, {});

                // Calculate rankings
                const rankedAnimals = animalsData.map(animal => {
                    const animalRatings = ratingsByAnimal[animal.id] || [];
                    interface RatingsByAnimal {
                        [key: string]: Rating[];
                    }

                    interface Translations {
                        [key: string]: {
                            original_name: string;
                            translated_name: string;
                        };
                    }

                    const averageRating: number = animalRatings.length > 0
                        ? animalRatings.reduce((acc: number, rating: Rating) => {
                            const sum: number = Object.keys(RATING_CATEGORIES[language]).reduce((sum: number, key: string) => {
                                return sum + (Number(rating[key.toLowerCase() as keyof Rating]) || 0);
                            }, 0);
                            return acc + (sum / Object.keys(RATING_CATEGORIES[language]).length);
                        }, 0) / animalRatings.length
                        : 0;

                    return {
                        ...animal,
                        translation: translations[animal.name] || null,
                        ratings: animalRatings,
                        averageRating
                    };
                }).sort((a, b) => b.averageRating - a.averageRating);

                setRankings(rankedAnimals);
            } catch (err) {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred');
            }
        };

        fetchRankings();
    }, [language]);

    if (error) {
        return (
            <div className="text-red-500 p-4">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Overall Rankings</h2>
            {rankings.map((animal, index) => (
                <div
                    key={animal.id}
                    className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center"
                >
                    <div>
                        <span className="text-2xl font-bold mr-4">#{index + 1}</span>
                        <span className="text-xl">
                            {language === 'en'
                                ? animal.name
                                : animal.translation?.translated_name ?? animal.name}
                        </span>
                    </div>
                    <div className="text-xl font-bold">
                        {animal.averageRating.toFixed(1)}
                    </div>
                </div>
            ))}
        </div>
    );
}