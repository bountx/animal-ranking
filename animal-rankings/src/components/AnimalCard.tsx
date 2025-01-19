import Image from 'next/image';
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
            <div className="relative w-full h-48">
                <Image
                    src={thumbnailUrl ? thumbnailUrl : '/placeholder.jpg'}
                    alt={displayName}
                    fill
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    className="object-cover"
                />
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-black text-center">{displayName}</h3>
            </div>
        </div>
    );
}
