import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export async function generateWorkoutPDF(workout: any, userName: string = 'Aluno'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Parse workout content (simplified - assumes markdown structure)
            const lines = workout.content.split('\n');

            // Cover Page
            doc.fontSize(32).font('Helvetica-Bold').text('🏋️ BIOLIFT TRAINER', { align: 'center' });
            doc.moveDown(1);
            doc.fontSize(24).text(workout.title, { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(12).font('Helvetica').fillColor('#666666');
            doc.text(`Criado em: ${new Date(workout.createdAt).toLocaleDateString('pt-BR')}`, { align: 'center' });
            doc.text(`Aluno: ${userName}`, { align: 'center' });

            doc.moveDown(3);
            doc.addPage();

            // Content
            doc.fontSize(10).fillColor('#000000').font('Helvetica');

            let currentY = doc.y;

            lines.forEach((line) => {
                // Check if we need a new page
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                }

                if (line.startsWith('# ')) {
                    doc.fontSize(18).font('Helvetica-Bold').fillColor('#2563EB');
                    doc.text(line.replace('# ', '').replace(/📊|⏱️|🎯|🏋️/g, ''), { continued: false });
                    doc.moveDown(0.5);
                } else if (line.startsWith('## ')) {
                    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000');
                    doc.text(line.replace('## ', '').replace(/📅|🔄/g, ''), { continued: false });
                    doc.moveDown(0.3);
                } else if (line.startsWith('### ')) {
                    doc.fontSize(12).font('Helvetica-Bold').fillColor('#7C3AED');
                    doc.text(line.replace('### ', '').replace(/💪|🗓️/g, ''), { continued: false });
                    doc.moveDown(0.2);
                } else if (line.startsWith('**') && line.includes(':')) {
                    doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
                    const text = line.replace(/\*\*/g, '').replace(/🎯|📊|⏱️|📝|🏠|🔥|🎥/g, '');
                    doc.text(text, { continued: false });
                } else if (line.startsWith('* ') || line.startsWith('- ')) {
                    doc.fontSize(9).font('Helvetica').fillColor('#333333');
                    doc.text('  • ' + line.substring(2), { continued: false });
                } else if (line.startsWith('---')) {
                    doc.moveDown(0.5);
                    doc.strokeColor('#CCCCCC').lineWidth(0.5)
                        .moveTo(50, doc.y)
                        .lineTo(550, doc.y)
                        .stroke();
                    doc.moveDown(0.5);
                } else if (line.trim().length > 0 && !line.startsWith('http')) {
                    doc.fontSize(9).font('Helvetica').fillColor('#000000');
                    doc.text(line.replace(/[📊⏱️🎯🏋️📅🔄💪🗓️🔥🎥🏠📝]/g, ''), { continued: false });
                }

                currentY = doc.y;
            });

            // Footer on last page
            doc.fontSize(8).fillColor('#999999');
            doc.text('Gerado por BioLift Trainer AI', 50, 750, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}
