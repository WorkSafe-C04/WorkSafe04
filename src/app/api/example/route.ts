import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const data = [
    {stringa: undefined, numero: 1, nome : "Cataldo", cognome : "Rossi", numeroTelefono: "1234567890"},
    {stringa: 'Esempio 2', numero: 2, nome : "Mario", cognome : "Bianchi", numeroTelefono: "0987654321"},
    {stringa: 'Esempio 3', numero: 3, nome : "Luigi", cognome : "CIAOOOOO" , numeroTelefono: "1122334455"},
  ];

  return Response.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return Response.json({ success: true, data: body }, { status: 200 });
}