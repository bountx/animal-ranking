"use client";

import { Animal } from '@/types';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { AnimalCard } from './AnimalCard';

interface AnimalListProps {
    locale: string;
}

export function AnimalList({ locale }: AnimalListProps) {
    const [mounted, setMounted] = useState(false);
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const fetchAnimals = async () => {
            try {
                const { data: animalsData, error: animalsError } = await supabase
                    .from('animals')
                    .select('*');

                if (animalsError) {
                    console.error('Error fetching animals:', animalsError);
                    setError(animalsError.message);
                    return;
                }

                if (locale !== 'en' && animalsData) {
                    const { data: translationsData, error: translationsError } = await supabase
                        .from('animal_translations')
                        .select('*')
                        .eq('language', locale);

                    if (translationsError) {
                        console.error('Error fetching translations:', translationsError);
                        setError(translationsError.message);
                        return;
                    }

                    const translationMap = translationsData?.reduce((acc, translation) => {
                        acc[translation.original_name] = translation;
                        return acc;
                    }, {});

                    const animalsWithTranslations = animalsData.map(animal => ({
                        ...animal,
                        translation: translationMap[animal.name] || null
                    }));

                    setAnimals(animalsWithTranslations);
                } else {
                    setAnimals(animalsData || []);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred');
            }
        };

        fetchAnimals();
    }, [locale, mounted]);

    if (!mounted) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.length === 0 ? (
                <div className="col-span-full text-center py-8 bg-white rounded shadow">
                    <p>No animals found. Please add some data to your database.</p>
                </div>
            ) : (
                animals.map(animal => (
                    <AnimalCard key={animal.id} animal={animal} locale={locale} />
                ))
            )}
        </div>
    );
}