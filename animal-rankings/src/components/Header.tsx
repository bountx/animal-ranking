"use client";

import { NavAuth } from '@/components/NavAuth';
import { LanguageSelector } from '@/components/LanguageSelector';
import Link from 'next/link';
import { Home, Star, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
    locale: string;
}

export function Header({ locale }: HeaderProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between h-16 px-4">
                    {/* Logo and primary navigation */}
                    <div className="flex items-center gap-8">
                        <Link
                            href={`/${locale}`}
                            className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            <span className="font-semibold text-lg">AnimalRank</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link
                                href={`/${locale}/rankings`}
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
                            >
                                <Star className="w-4 h-4" />
                                <span>{locale === 'en' ? 'Rankings' : 'Rankingi'}</span>
                            </Link>
                            {user && (
                                <Link
                                    href={`/${locale}/my-rankings`}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
                                >
                                    <Heart className="w-4 h-4" />
                                    <span>{locale === 'en' ? 'My Rankings' : 'Moje Rankingi'}</span>
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* User controls */}
                    <div className="flex items-center gap-4">
                        <NavAuth />
                        <div className="h-6 w-px bg-gray-200" />
                        <LanguageSelector currentLocale={locale} />
                    </div>
                </div>

                {/* Mobile navigation */}
                <nav className="md:hidden border-t border-gray-200">
                    <Link
                        href={`/${locale}/rankings`}
                        className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
                    >
                        <Star className="w-4 h-4" />
                        <span>{locale === 'en' ? 'Rankings' : 'Rankingi'}</span>
                    </Link>
                    {user && (
                        <Link
                            href={`/${locale}/my-rankings`}
                            className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all border-t border-gray-200"
                        >
                            <Heart className="w-4 h-4" />
                            <span>{locale === 'en' ? 'My Rankings' : 'Moje Rankingi'}</span>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}