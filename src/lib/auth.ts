import jwt from 'jsonwebtoken';

// Chiave segreta per firmare i token (in produzione dovrebbe essere in .env)
const JWT_SECRET = 'worksafe-secret-key-2025';

export interface TokenPayload {
  matricola: string;
  email: string;
  ruolo: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
