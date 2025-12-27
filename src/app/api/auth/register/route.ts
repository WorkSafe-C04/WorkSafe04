import prisma from '@/core/db/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { UtenteNoPass } from '@/model/utente';

export async function POST(request: Request): Promise<Response> {
    try {
        const body = await request.json();
        
        const {matricola, nome, cognome, dataNascita, email, password, ruolo, dataAssunzione} = body;

        if (!matricola || !email || !password) {
            return NextResponse.json({
                message: "Matricola, email e password sono obbligatori"
            }, { status: 400 });
        }

        //Controlla se l'utente esiste già
        const existingUser = await prisma.utente.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({
                message: "Email già registrata"
            }, { status: 409 });
        }

        //Cripta la password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Crea nuovo utente
        const newUser = await prisma.utente.create({
            data: {
                matricola,
                nome,
                cognome,
                dataNascita: dataNascita ? new Date(dataNascita) : null, //Se dataNascita non è null, inserisce il valore passato; altrimenti, inserisce il valore null
                email,
                password: hashedPassword,
                ruolo,
                dataAssunzione: dataAssunzione ? new Date(dataAssunzione) : null 
            }
        });

        //Restituisce gli attributi dell'utente senza la password
        const userWithoutPassword: UtenteNoPass = {
            matricola: newUser.matricola,
            nome: newUser.nome ? newUser.nome : undefined,
            cognome: newUser.cognome ? newUser.cognome : undefined,
            dataNascita: newUser.dataNascita ? newUser.dataNascita : undefined,
            email: newUser.email ? newUser.email : undefined,
            ruolo: newUser.ruolo ? newUser.ruolo : undefined,
            dataAssunzione: newUser.dataAssunzione ? newUser.dataAssunzione : undefined
        };

        return NextResponse.json({
            user: userWithoutPassword
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}