"use client";

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { RatingForm } from '@/components/RatingForm';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Animal, AnimalTranslation } from '@/types';
import { User } from '@supabase/supabase-js';
import { Header } from '@/components/Header';
import Image from 'next/image';

interface AnimalArticleProps {
    params: Promise<{
        locale: string;
        id: string;
    }>;
}

interface ImageWithLoadingStatus {
    image_url: string;
    isLoaded: boolean;
}

export default function AnimalArticle({ params }: AnimalArticleProps) {
    const [animal, setAnimal] = useState<Animal | null>(null);
    const [translation, setTranslation] = useState<AnimalTranslation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [locale, setLocale] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [user, setUser] = useState<User | null>(null);
    const [images, setImages] = useState<ImageWithLoadingStatus[]>([]);
    const router = useRouter();

    // Image preloading function
    const preloadImages = (imageUrls: string[]) => {
        const imageObjects = imageUrls.map(url => ({
            image_url: url,
            isLoaded: false
        }));
        setImages(imageObjects);

        imageUrls.forEach((url, index) => {
            const img = new window.Image() as HTMLImageElement;
            img.onload = () => {
                setImages(prev => prev.map((image, i) =>
                    i === index ? { ...image, isLoaded: true } : image
                ));
            };
            img.src = url;
        });
    };

    useEffect(() => {
        // Auth state check remains the same
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

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
                    .select(`
                        *,
                        animal_images (
                            image_url
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (animalError) {
                    console.error('Error fetching animal:', animalError);
                    setError(animalError.message);
                    return;
                }

                setAnimal(animalData as Animal);

                // Preload images when animal data is received
                if (animalData.animal_images) {
                    preloadImages(animalData.animal_images.map((img: { image_url: string }) => img.image_url));
                }

                // Translation fetch remains the same
                if (locale !== 'en') {
                    const { data: translationData, error: translationError } = await supabase
                        .from('animal_translations')
                        .select('*')
                        .eq('original_name', animalData.name)
                        .eq('language', locale)
                        .single();

                    if (translationError && translationError.code !== 'PGRST116') {
                        console.error('Error fetching translation:', translationError);
                        setError(translationError.message);
                        return;
                    }

                    setTranslation(translationData as AnimalTranslation);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred');
            }
        };

        fetchAnimal();
    }, [locale, id]);

    const handleNext = () => {
        if (images.length) {
            setCurrentImageIndex((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const handlePrevious = () => {
        if (images.length) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? images.length - 1 : prev - 1
            );
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!animal) {
        return <div>Loading...</div>;
    }

    const name = translation?.translated_name || animal.name;
    const article = translation?.translated_article || animal.article;

    return (
        <div className="min-h-screen bg-gray-100">
            {locale && <Header locale={locale} />}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Image Carousel */}
                {images.length > 0 && (
                    <div className="relative w-full h-96 mb-8 bg-black rounded-lg overflow-hidden">
                        {/* Loading state */}
                        {!images[currentImageIndex]?.isLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}

                        {/* Image */}
                        <Image
                            src={images[currentImageIndex]?.image_url}
                            alt={`${name} - image ${currentImageIndex + 1}`}
                            width={500} // Replace with the actual width of your image
                            height={500} // Replace with the actual height of your image
                            className={`w-full h-full object-contain transition-opacity duration-300 ${images[currentImageIndex]?.isLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                            loading="lazy" // Optional: Defer loading of offscreen images
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevious}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Rest of the component remains the same */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-4xl font-bold mb-6">{name}</h1>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} className="markdown">
                        {article}
                    </ReactMarkdown>
                </div>

                <div className="mt-8 bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-6">
                        {locale === 'en' ? 'Rate this Animal' : 'Oceń to zwierzę'}
                    </h2>
                    {user ? (
                        <RatingForm animalId={animal.id} language={locale as 'en' | 'pl'} />
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-600 mb-4">
                                {locale === 'en'
                                    ? 'Please sign up to rate this animal'
                                    : 'Zarejestruj się, aby ocenić to zwierzę'}
                            </p>
                            <button
                                onClick={() => router.push(`/${locale}/signup`)}
                                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                            >
                                {locale === 'en' ? 'Sign Up' : 'Zarejestruj się'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}