"use client";

interface LanguageSelectorProps {
    currentLocale: string;
}

export function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'pl', name: 'Polski' }
    ];

    return (
        <select
            value={currentLocale}
            onChange={(e) => {
                window.location.pathname = window.location.pathname.replace(
                    `/${currentLocale}`,
                    `/${e.target.value}`
                );
            }}
            className="px-4 py-2 border rounded-md bg-primary text-white"
        >
            {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                    {lang.name}
                </option>
            ))}
        </select>
    );
}
