import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Pagine pubbliche che non richiedono autenticazione
const PUBLIC_PAGES = ['/auth/login', '/auth/register'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ottieni il token dai cookie
  const token = request.cookies.get('auth-token')?.value;

  // Se la pagina è pubblica, consenti l'accesso
  if (PUBLIC_PAGES.some(page => pathname.startsWith(page))) {
    // Se l'utente è già autenticato e cerca di accedere al login, reindirizza alla home
    if (token && verifyToken(token)) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next();
  }

  // Per tutte le altre pagine, verifica il token
  if (!token) {
    // Nessun token, reindirizza al login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Verifica la validità del token
  const payload = verifyToken(token);
  if (!payload) {
    // Token non valido, reindirizza al login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  // Token valido, consenti l'accesso
  return NextResponse.next();
}

// Configura il matcher per applicare il middleware solo a specifiche route
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)',
  ],
};