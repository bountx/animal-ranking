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
                // First fetch animals with their images
                const { data: animalsData, error: animalsError } = await supabase
                    .from('animals')
                    .select(`
                        *,
                        animal_images (
                          image_url
                        )
                    `)
                    .order('id', { ascending: true });

                if (animalsError) {
                    console.error('Error fetching animals:', animalsError);
                    setError(animalsError.message);
                    return;
                }

                // Then fetch translations if needed
                if (locale !== 'en') {
                    const { data: translationsData, error: translationsError } = await supabase
                        .from('animal_translations')
                        .select('*')
                        .eq('language', locale);

                    if (translationsError) {
                        console.error('Error fetching translations:', translationsError);
                        setError(translationsError.message);
                        return;
                    }

                    // Create a map of translations by original name
                    const translationMap = translationsData?.reduce((acc, translation) => {
                        acc[translation.original_name] = translation;
                        return acc;
                    }, {} as Record<string, typeof translationsData[number]>);

                    // Process the data with translations
                    const processedAnimals: Animal[] = animalsData?.map(animal => ({
                        id: animal.id,
                        name: animal.name,
                        article: animal.article,
                        animal_images: animal.animal_images,
                        translations: translationMap[animal.name] ? [translationMap[animal.name]] : []
                    })) || [];

                    setAnimals(processedAnimals);
                } else {
                    // If locale is 'en', just process the animals without translations
                    const processedAnimals: Animal[] = animalsData?.map(animal => ({
                        id: animal.id,
                        name: animal.name,
                        article: animal.article,
                        animal_images: animal.animal_images,
                        translations: []
                    })) || [];

                    setAnimals(processedAnimals);
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
        <>
            {error && (
                <div className="text-red-500 text-center mb-4">
                    {error}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {animals.length === 0 ? (
                    <div className="col-span-full text-center py-8 bg-white rounded shadow">
                        <p>No animals found. Please add some data to your database.</p>
                    </div>
                ) : (
                    animals.map(animal => (
                        <a key={animal.id} href={`/${locale}/animal/${animal.id}`}>
                            <AnimalCard
                                animal={animal}
                                locale={locale}
                            />
                        </a>
                    ))
                )}
            </div>
        </>
    );
}
