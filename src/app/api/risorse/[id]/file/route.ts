import prisma from '@/core/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Verifica autenticazione
    const user = requireAuth(req);
    if (!user) {
        return NextResponse.json(
            { error: 'Non autorizzato. Effettua il login.' },
            { status: 401 }
        );
    }

    try {
        const { id } = await params;

        const risorsa = await prisma.risorsa.findUnique({
            where: { 
                id: BigInt(id),
                codiceAzienda: user.codiceAzienda 
            },
            select: { schedaAllegata: true }
        });

        if (!risorsa || !risorsa.schedaAllegata) {
            return NextResponse.json({ error: 'File non trovato' }, { status: 404 });
        }

        // Converti bytea in Buffer correttamente
        let buffer: Buffer;

        if (Buffer.isBuffer(risorsa.schedaAllegata)) {
            buffer = risorsa.schedaAllegata;
        } else if (typeof risorsa.schedaAllegata === 'string') {
            // Se è una stringa hex, convertila
            buffer = Buffer.from((risorsa.schedaAllegata as string).replace(/^\\x/, ''), 'hex');
        } else if (risorsa.schedaAllegata instanceof Uint8Array) {
            buffer = Buffer.from(risorsa.schedaAllegata);
        } else {
            console.error('Tipo schedaAllegata non riconosciuto:', typeof risorsa.schedaAllegata);
            return NextResponse.json({ error: 'Formato file non valido' }, { status: 500 });
        }

        // Determina il MIME type dai magic bytes
        const firstBytes = buffer.slice(0, 4).toString('hex');
        let mimeType = 'application/octet-stream';
        let extension = 'bin';

        if (firstBytes.startsWith('25504446')) {
            mimeType = 'application/pdf';
            extension = 'pdf';
        } else if (firstBytes.startsWith('89504e47')) {
            mimeType = 'image/png';
            extension = 'png';
        } else if (firstBytes.startsWith('ffd8ff')) {
            mimeType = 'image/jpeg';
            extension = 'jpg';
        }

        // Restituisce il file con gli header corretti per visualizzazione inline
        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `inline; filename="documento.${extension}"`,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('Errore durante il recupero del file:', error);
        return NextResponse.json({ error: error as Error }, { status: 500 });
    }
}
