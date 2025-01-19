import { Animal } from '../types';

interface AnimalCardProps {
    animal: Animal;
    locale: string;
}

export function AnimalCard({ animal, locale }: AnimalCardProps) {
    const translation = animal.translations?.find(t => t.language === locale);
    const displayName = translation?.translated_name || animal.name;
    const thumbnailUrl = animal.animal_images?.[0]?.image_url;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {thumbnailUrl && (
                <div className="aspect-w-16 aspect-h-9">
                    <img
                        src={thumbnailUrl}
                        alt={displayName}
                        className="w-full h-48 object-cover"
                    />
                </div>
            )}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-black text-center">{displayName}</h3>
            </div>
        </div>
    );
}