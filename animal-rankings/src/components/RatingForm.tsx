//components/RatingForm.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Rating } from '@/types';
import { RATING_CATEGORIES } from '@/constants/ratings';

type RatingValues = Omit<Rating, 'id' | 'created_at' | 'user_id' | 'animal_id'>;
type RatingCategory = keyof typeof RATING_CATEGORIES.en;

interface RatingFormProps {
    animalId: string;
    language: keyof typeof RATING_CATEGORIES;
}

export function RatingForm({ animalId, language }: RatingFormProps) {
    const [ratings, setRatings] = useState<RatingValues>({
        color: 50,
        relative_strength: 50,
        curiosity: 50,
        history: 50,
        survival_mechanism: 50,
        shape: 50,
        intelligence: 50,
        relative_speed: 50,
        world_attitude: 50,
        overall_coolness: 50
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [existingRating, setExistingRating] = useState<Rating | null>(null);

    // Load existing rating on mount
    useEffect(() => {
        const loadExistingRating = async () => {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                const { data: rating, error } = await supabase
                    .from('ratings')
                    .select('*')
                    .eq('animal_id', animalId)
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    if (error.code !== 'PGRST116') { // Not found error code
                        console.error('Error checking existing rating:', error);
                    }
                    setIsLoading(false);
                    return;
                }

                if (rating) {
                    console.log('Found existing rating:', rating);
                    setExistingRating(rating as Rating);
                    const { ...ratingValues } = rating;
                    setRatings(ratingValues as RatingValues);
                }
            } catch (err) {
                console.error('Error loading existing rating:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadExistingRating();
    }, [animalId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('You must be logged in to submit ratings');
                return;
            }

            // First check if rating exists
            const { data: existingRating, error: checkError } = await supabase
                .from('ratings')
                .select('*')
                .eq('user_id', user.id)
                .eq('animal_id', animalId)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // Not found error code
                console.error('Error checking existing rating:', checkError);
                setError('Error checking existing rating. Please try again.');
                return;
            }

            if (existingRating) {
                // Update existing rating
                const { error: updateError } = await supabase
                    .from('ratings')
                    .update(ratings)
                    .eq('user_id', user.id)
                    .eq('animal_id', animalId);

                if (updateError) {
                    console.error('Error updating rating:', updateError);
                    setError('Error updating ratings. Please try again.');
                    return;
                }
            } else {
                // Insert new rating
                const { error: insertError } = await supabase
                    .from('ratings')
                    .insert({
                        user_id: user.id,
                        animal_id: animalId,
                        ...ratings
                    });

                if (insertError) {
                    console.error('Error inserting rating:', insertError);
                    setError('Error submitting ratings. Please try again.');
                    return;
                }
            }

            setSuccess(true);
            setExistingRating({ ...ratings, user_id: user.id, animal_id: animalId } as unknown as Rating);
            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {language === 'en' ? 'Ratings saved successfully!' : 'Oceny zostały pomyślnie zapisane!'}
                </div>
            )}

            {existingRating && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                    {language === 'en'
                        ? 'Updating your existing rating'
                        : 'Aktualizacja twojej istniejącej oceny'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(Object.keys(RATING_CATEGORIES[language]) as RatingCategory[]).map((key) => {
                        const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                        return (
                            <div key={key} className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {RATING_CATEGORIES[language][key]}
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={ratings[snakeCaseKey as keyof RatingValues]}
                                        onChange={(e) => setRatings(prev => ({
                                            ...prev,
                                            [snakeCaseKey]: parseInt(e.target.value)
                                        }))}
                                        className="flex-grow"
                                        disabled={isSubmitting}
                                    />
                                    <span className="w-12 text-sm text-gray-500">
                                        {ratings[snakeCaseKey as keyof RatingValues]}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full ${isSubmitting
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                        } text-white py-2 px-4 rounded-md transition-colors`}
                >
                    {isSubmitting
                        ? (language === 'en' ? 'Saving...' : 'Zapisywanie...')
                        : (language === 'en' ? 'Save Ratings' : 'Zapisz oceny')}
                </button>
            </form>
        </div>
    );
}