import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Initialize the Supabase client
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    // Get pathname (e.g. /, /animal/123)
    const pathname = request.nextUrl.pathname

    // Get language from pathname (/en/... or /pl/...)
    const pathnameIsMissingLocale = pathname === '/' ||
        (!pathname.startsWith('/en') && !pathname.startsWith('/pl'))

    if (pathnameIsMissingLocale) {
        // Redirect to default locale
        return NextResponse.redirect(
            new URL(`/en${pathname}`, request.url)
        )
    }

    return res
}

export const config = {
    matcher: [
        // Match all pathnames except for:
        // - /api (API routes)
        // - /_next (Next.js internals)
        // - /_static (static files)
        // - .*\\..*$ (files with extensions)
        '/((?!api|_next|_static|.*\\..*$).*)',
        // Auth paths
        '/auth/callback'
    ]
}