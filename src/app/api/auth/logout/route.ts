import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<Response> {
    try {
        return NextResponse.json({
            message: "Logout riuscito"
        });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}