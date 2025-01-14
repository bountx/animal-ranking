// src/types/index.ts
export type AnimalTranslation = {
    id: string;
    original_name: string;
    translated_name: string;
    translated_article: string;
    language: string;
};

export type Animal = {
    id: string;
    created_at: string;
    name: string;
    article: string;
    translation: AnimalTranslation;
};

export type Rating = {
    id: string;
    animal_id: string;
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
    created_at: string;
};