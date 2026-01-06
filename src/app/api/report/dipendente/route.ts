import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/db/prisma';
import { requireRole } from '@/lib/apiAuth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(request: NextRequest) {
  // Solo il Datore Di Lavoro può generare report
  const user = requireRole(request, ['DatoreDiLavoro']);
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorizzato. Solo il Datore Di Lavoro può generare report.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const matricola = searchParams.get('matricola');

  if (!matricola) {
    return NextResponse.json(
      { error: 'Matricola obbligatoria' },
      { status: 400 }
    );
  }

  try {
    // Recupera i dati del dipendente
    const dipendente = await prisma.utente.findFirst({
      where: {
        matricola,
        codiceAzienda: user.codiceAzienda
      },
      select: {
        matricola: true,
        nome: true,
        cognome: true,
        email: true,
        ruolo: true,
        dataNascita: true,
        dataAssunzione: true,
      }
    });

    if (!dipendente) {
      return NextResponse.json(
        { error: 'Dipendente non trovato o non appartiene alla tua azienda' },
        { status: 404 }
      );
    }

    // Recupera le segnalazioni del dipendente
    const segnalazioni = await prisma.segnalazione.findMany({
      where: {
        matricola,
        codiceAzienda: user.codiceAzienda
      },
      orderBy: { dataCreazione: 'desc' },
      include: {
        Risorsa: {
          select: { nome: true }
        }
      }
    });

    // Recupera informazioni azienda
    const azienda = await prisma.azienda.findUnique({
      where: { codiceAzienda: user.codiceAzienda },
      select: {
        ragioneSociale: true,
        partitaIva: true,
        sede: true
      }
    });

    // Crea il PDF
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();
    let yPosition = height - 50;

    // Helper function to add new page if needed
    const checkAndAddPage = (requiredSpace: number) => {
      if (yPosition - requiredSpace < 50) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - 50;
        return true;
      }
      return false;
    };

    // Helper function to draw text
    const drawText = (text: string, x: number, size: number, font: any, color = rgb(0, 0, 0)) => {
      page.drawText(text, {
        x,
        y: yPosition,
        size,
        font,
        color,
      });
    };

    // Header del documento
    drawText('WorkSafe - Report Dipendente', 50, 24, timesRomanBold, rgb(0.4, 0.49, 0.92));
    yPosition -= 30;
    
    const dataOra = `Generato il: ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}`;
    drawText(dataOra, 50, 10, timesRomanFont, rgb(0.4, 0.4, 0.4));
    yPosition -= 40;

    // Informazioni Azienda
    if (azienda) {
      drawText('Informazioni Azienda', 50, 14, timesRomanBold, rgb(0.2, 0.2, 0.2));
      yPosition -= 20;
      
      drawText(`Ragione Sociale: ${azienda.ragioneSociale || 'N/A'}`, 50, 10, timesRomanFont);
      yPosition -= 15;
      drawText(`P.IVA: ${azienda.partitaIva || 'N/A'}`, 50, 10, timesRomanFont);
      yPosition -= 15;
      drawText(`Sede: ${azienda.sede || 'N/A'}`, 50, 10, timesRomanFont);
      yPosition -= 30;
    }

    // Informazioni Dipendente
    drawText('Dati Dipendente', 50, 14, timesRomanBold, rgb(0.2, 0.2, 0.2));
    yPosition -= 20;
    
    drawText(`Matricola: ${dipendente.matricola}`, 50, 10, timesRomanFont);
    yPosition -= 15;
    drawText(`Nome: ${dipendente.nome || 'N/A'} ${dipendente.cognome || ''}`, 50, 10, timesRomanFont);
    yPosition -= 15;
    drawText(`Email: ${dipendente.email || 'N/A'}`, 50, 10, timesRomanFont);
    yPosition -= 15;
    drawText(`Ruolo: ${dipendente.ruolo || 'Dipendente'}`, 50, 10, timesRomanFont);
    yPosition -= 15;
    drawText(`Data di Nascita: ${dipendente.dataNascita ? new Date(dipendente.dataNascita).toLocaleDateString('it-IT') : 'N/A'}`, 50, 10, timesRomanFont);
    yPosition -= 15;
    drawText(`Data di Assunzione: ${dipendente.dataAssunzione ? new Date(dipendente.dataAssunzione).toLocaleDateString('it-IT') : 'N/A'}`, 50, 10, timesRomanFont);
    yPosition -= 40;

    // Sezione Segnalazioni
    drawText('Segnalazioni Effettuate', 50, 14, timesRomanBold, rgb(0.2, 0.2, 0.2));
    yPosition -= 20;

    if (segnalazioni.length === 0) {
      drawText('Nessuna segnalazione effettuata.', 50, 10, timesRomanFont, rgb(0.4, 0.4, 0.4));
    } else {
      drawText(`Totale segnalazioni: ${segnalazioni.length}`, 50, 10, timesRomanFont);
      yPosition -= 25;

      // Lista segnalazioni
      for (let i = 0; i < segnalazioni.length; i++) {
        const seg = segnalazioni[i];
        
        // Verifica se c'è spazio
        checkAndAddPage(100);

        drawText(`${i + 1}. ${seg.titolo}`, 50, 11, timesRomanBold, rgb(0.4, 0.49, 0.92));
        yPosition -= 15;
        
        drawText(`   Data: ${seg.dataCreazione ? new Date(seg.dataCreazione).toLocaleDateString('it-IT') : 'N/A'}`, 50, 9, timesRomanFont, rgb(0.4, 0.4, 0.4));
        yPosition -= 12;
        drawText(`   Stato: ${seg.stato || 'N/A'}`, 50, 9, timesRomanFont, rgb(0.4, 0.4, 0.4));
        yPosition -= 12;
        drawText(`   Priorita: ${seg.priorita || 'N/A'}`, 50, 9, timesRomanFont, rgb(0.4, 0.4, 0.4));
        yPosition -= 12;
        drawText(`   Risorsa: ${seg.Risorsa?.nome || 'N/A'}`, 50, 9, timesRomanFont, rgb(0.4, 0.4, 0.4));
        yPosition -= 12;
        
        if (seg.descrizione) {
          const descText = seg.descrizione.substring(0, 150);
          const finalDesc = seg.descrizione.length > 150 ? descText + '...' : descText;
          
          // Split lungo descrizione se necessario
          const maxCharsPerLine = 80;
          const words = finalDesc.split(' ');
          let currentLine = '   Descrizione: ';
          
          for (const word of words) {
            if ((currentLine + word).length > maxCharsPerLine) {
              drawText(currentLine, 50, 9, timesRomanFont, rgb(0.4, 0.4, 0.4));
              yPosition -= 12;
              checkAndAddPage(12);
              currentLine = '   ' + word + ' ';
            } else {
              currentLine += word + ' ';
            }
          }
          if (currentLine.trim().length > 3) {
            drawText(currentLine, 50, 9, timesRomanFont, rgb(0.4, 0.4, 0.4));
            yPosition -= 12;
          }
        }
        
        yPosition -= 15;
      }
    }

    // Footer su tutte le pagine
    const pages = pdfDoc.getPages();
    for (const p of pages) {
      p.drawText(
        'Documento riservato - WorkSafe Sistema di Gestione Sicurezza sul Lavoro',
        {
          x: 50,
          y: 30,
          size: 8,
          font: timesRomanFont,
          color: rgb(0.6, 0.6, 0.6),
        }
      );
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    // Restituisci il PDF
    const nomeFile = `Report_${dipendente.nome}_${dipendente.cognome}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nomeFile}"`,
      },
    });

  } catch (error) {
    console.error('Errore nella generazione del report:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
