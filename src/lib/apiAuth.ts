import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './auth';

export interface AuthenticatedRequest {
  user: TokenPayload;
}

/**
 * Verifica il token JWT dalla richiesta e restituisce i dati dell'utente
 * @param request - La richiesta Next.js
 * @returns I dati dell'utente o null se non autenticato
 */
export function authenticateRequest(request: NextRequest | Request): TokenPayload | null {
  try {
    // Prova a ottenere il token dai cookie
    let token: string | undefined;
    
    if ('cookies' in request) {
      // NextRequest
      token = request.cookies.get('auth-token')?.value;
    } else {
      // Standard Request
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split('; ').map(c => {
            const [key, ...v] = c.split('=');
            return [key, v.join('=')];
          })
        );
        token = cookies['auth-token'];
      }
    }

    // Se non c'è token nei cookie, prova nell'header Authorization
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    // Verifica il token
    const payload = verifyToken(token);
    return payload;
  } catch (error) {
    console.error('Errore nell\'autenticazione:', error);
    return null;
  }
}

/**
 * Verifica che l'utente sia autenticato e abbia uno dei ruoli specificati
 * @param request - La richiesta Next.js
 * @param allowedRoles - Array di ruoli permessi (opzionale)
 * @returns I dati dell'utente o null
 */
export function authorizeRequest(
  request: NextRequest | Request,
  allowedRoles?: string[]
): TokenPayload | null {
  const user = authenticateRequest(request);
  
  if (!user) {
    return null;
  }

  // Se sono specificati ruoli permessi, verifica che l'utente abbia uno di quelli
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.ruolo)) {
      return null;
    }
  }

  return user;
}

/**
 * Middleware helper per proteggere le route API
 * Uso:
 * const user = requireAuth(request);
 * if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
 */
export function requireAuth(request: NextRequest | Request): TokenPayload | null {
  return authenticateRequest(request);
}

/**
 * Middleware helper per proteggere le route API con controllo ruolo
 * Uso:
 * const user = requireRole(request, ['Admin', 'RSPP']);
 * if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
 */
export function requireRole(
  request: NextRequest | Request,
  allowedRoles: string[]
): TokenPayload | null {
  return authorizeRequest(request, allowedRoles);
}
