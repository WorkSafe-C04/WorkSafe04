import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<Response> {
    try {
        const response = NextResponse.json({
            message: "Logout riuscito"
        });
        
        // Rimuovi il token dai cookie
        response.cookies.delete('auth-token');
        
        return response;
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}