import prisma from '@/core/db/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { UtenteNoPass } from '@/model/utente';

export async function POST(request: Request): Promise<Response> {
    try {
        const body = await request.json();
        
        const {email, password} = body;

        if (!email || !password) {
            return NextResponse.json({
                message: "Email o password non inserite"
            }, { status: 400 });
        }

        const user = await prisma.utente.findUnique({
            where: {email}
        });

        if (!user) {
            return NextResponse.json({
                message: "Email errata."
            }, { status: 401 });
        }

        if (!user.password) {
            return NextResponse.json({
                message: "Errore interno."
            }, { status: 500 });
        }

        //Se esiste l'utente con quella mail ed ha la password, controlla se quest'ultima è corretta
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({
                message: "Password errata."
            }, { status: 401 });
        }

        //Se la password è corretta, restituisce gli attributi dell'utente senza la password
        const userWithoutPassword: UtenteNoPass = {
            matricola: user.matricola,
            nome: user.nome ? user.nome : undefined,
            cognome: user.cognome ? user.cognome : undefined,
            dataNascita: user.dataNascita ? user.dataNascita : undefined,
            email: user.email ? user.email : undefined,
            ruolo: user.ruolo ? user.ruolo : undefined,
            dataAssunzione: user.dataAssunzione ? user.dataAssunzione : undefined
        };

        return NextResponse.json({
            user: userWithoutPassword
        });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}