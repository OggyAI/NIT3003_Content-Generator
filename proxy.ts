// Owner: Nicolas (route protection). Next.js 16 renamed middleware.ts to
// proxy.ts — this is the same thing. It runs before every page request.
//
// Starter version from Oggy: refreshes the session and sends logged-out
// users to /login for protected pages. Nicolas: extend as needed
// (e.g. send logged-in users away from /login and /register).
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/session';

const PROTECTED = ['/dashboard', '/profile', '/generate', '/editor', '/history'];

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const path = request.nextUrl.pathname;

  if (!userId && PROTECTED.some((p) => path === p || path.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Skip static files and images.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
