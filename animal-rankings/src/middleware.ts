import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Get pathname (e.g. /, /animal/123)
    const pathname = request.nextUrl.pathname

    // Get language from pathname (/en/... or /pl/...)
    const pathnameIsMissingLocale = pathname === '/' ||
        !pathname.startsWith('/en') && !pathname.startsWith('/pl')

    if (pathnameIsMissingLocale) {
        // Redirect to default locale (you could also detect user's locale)
        return NextResponse.redirect(
            new URL(`/en${pathname}`, request.url)
        )
    }
}

export const config = {
    // Match all pathnames except for:
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_static (static files)
    // - .*\\..*\$ (files with extensions)
    matcher: ['/((?!api|_next|_static|.*\\..*$).*)']
}