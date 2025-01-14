"use client";

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

// Define the rating categories and their display names
const RATING_CATEGORIES = {
    en: {
        color: "Color",
        relative_strength: "Relative Strength",
        curiosity: "Curiosity",
        history: "History",
        survival_mechanism: "Survival Mechanism",
        shape: "Shape",
        intelligence: "Intelligence",
        relative_speed: "Relative Speed",
        world_attitude: "World Attitude",
        overall_coolness: "Overall Coolness"
    },
    pl: {
        color: "Kolor",
        relative_strength: "Siła relatywnie do wielkości",
        curiosity: "Ciekawość",
        history: "Historia",
        survival_mechanism: "Mechanizm przetrwania",
        shape: "Kształt",
        intelligence: "Inteligencja",
        relative_speed: "Prędkość relatywna",
        world_attitude: "Nastawienie do świata",
        overall_coolness: "Ogólna fajność"
    }
} as const;

// Define types for the rating values
type RatingValues = {
    color: number;
    relative_strength: number;
    curiosity: number;
    history: number;
    survival_mechanism: number;
    shape: number;
    intelligence: number;
    relative_speed: number;
    world_attitude: number;
    overall_coolness: number;
};

// Get the rating category keys
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const { error } = await supabase
            .from('ratings')
            .insert([{
                animal_id: animalId,
                color: ratings.color,
                relative_strength: ratings.relative_strength,
                curiosity: ratings.curiosity,
                history: ratings.history,
                survival_mechanism: ratings.survival_mechanism,
                shape: ratings.shape,
                intelligence: ratings.intelligence,
                relative_speed: ratings.relative_speed,
                world_attitude: ratings.world_attitude,
                overall_coolness: ratings.overall_coolness
            }]);

        if (error) {
            console.error('Error submitting ratings:', error);
            return;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {(Object.keys(RATING_CATEGORIES[language]) as RatingCategory[]).map((key) => (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {RATING_CATEGORIES[language][key]}
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value={ratings[key]}
                        onChange={(e) => setRatings(prev => ({
                            ...prev,
                            [key]: parseInt(e.target.value)
                        }))}
                        className="w-full"
                    />
                    <span className="text-sm text-gray-500">
                        {ratings[key]}
                    </span>
                </div>
            ))}
            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
                Submit Ratings
            </button>
        </form>
    );
}