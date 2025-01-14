import { Animal } from '@/types';
import Link from 'next/link';

interface AnimalCardProps {
    animal: Animal;
    locale: string;
}

export function AnimalCard({ animal, locale }: AnimalCardProps) {
    const name = locale === 'en' ? animal.name : animal.translation?.translated_name ?? animal.name;
    const article = locale === 'en' ? animal.article : animal.translation?.translated_article ?? animal.article;

    return (
        <Link
            href={`/${locale}/animal/${animal.id}`}
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
            <h2 className="text-xl font-bold mb-4">{name}</h2>
            <p className="text-gray-600 mb-4">
                {article.substring(0, 150)}...
            </p>
        </Link>
    );
}
