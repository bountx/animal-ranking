'use client';

import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function NavAuth() {
    const router = useRouter();
    const { user } = useContext(AuthContext);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/en');
        router.refresh();
    };

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Link
                href="/en/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
                Login
            </Link>
            <Link
                href="/en/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
                Sign Up
            </Link>
        </div>
    );
}