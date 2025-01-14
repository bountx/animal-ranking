"use client";

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';


interface AnimalArticleProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

export default function AnimalArticle({ params }: AnimalArticleProps) {
    const [animal, setAnimal] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [locale, setLocale] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);

    useEffect(() => {
        params.then((resolvedParams) => {
            setLocale(resolvedParams.locale);
            setId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (!locale || !id) return;

        const fetchAnimal = async () => {
            try {
                const { data: animalData, error: animalError } = await supabase
                    .from('animals')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (animalError) {
                    console.error('Error fetching animal:', animalError);
                    setError(animalError.message);
                    return;
                }

                if (locale !== 'en' && animalData) {
                    const { data: translationData, error: translationError } = await supabase
                        .from('animal_translations')
                        .select('*')
                        .eq('original_name', animalData.name)
                        .eq('language', locale)
                        .single();

                    if (translationError) {
                        console.error('Error fetching translation:', translationError);
                        setError(translationError.message);
                        return;
                    }

                    animalData.translation = translationData;
                }

                setAnimal(animalData);
            } catch (err) {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred');
            }
        };

        fetchAnimal();
    }, [locale, id]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!animal) {
        return <div>Loading...</div>;
    }

    const name = locale === 'en' ? animal.name : animal.translation?.translated_name ?? animal.name;
    const article = locale === 'en' ? animal.article : animal.translation?.translated_article ?? animal.article;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-4">{name}</h1>
            <ReactMarkdown rehypePlugins={[rehypeRaw]} className="prose prose-lg text-black">
                {article}
            </ReactMarkdown>
        </div>
    );
}
