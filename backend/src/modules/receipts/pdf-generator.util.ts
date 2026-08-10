import PDFDocument from 'pdfkit';

export function generateReceiptPdf(data: {
  donationId: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string;
  amount: number; // paise
  tipAmount: number;
  totalAmount: number;
  paymentId: string | null;
  createdAt: Date;
  products?: { title: string; quantity: number; amount: number }[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Donation Receipt', { align: 'center' });
    doc.moveDown();
    doc
      .fontSize(10)
      .fillColor('#666')
      .text(`Receipt for donation #${data.donationId}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).fillColor('#000');
    doc.text(`Campaign: ${data.campaignTitle}`);
    doc.text(`Donor: ${data.donorName} (${data.donorEmail})`);
    doc.text(
      `Date: ${data.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    );
    if (data.paymentId) doc.text(`Payment ID: ${data.paymentId}`);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ddd').stroke();
    doc.moveDown();

    if (data.products && data.products.length > 0) {
      doc.fontSize(13).text('Products donated', { underline: true });
      doc.moveDown(0.5);
      data.products.forEach((p) => {
        doc
          .fontSize(11)
          .text(
            `${p.title}  x${p.quantity}  —  ₹${(p.amount / 100).toLocaleString('en-IN')}`,
          );
      });
      doc.moveDown();
    } else {
      doc
        .fontSize(11)
        .text(
          `Donation amount: ₹${(data.amount / 100).toLocaleString('en-IN')}`,
        );
    }

    doc.text(`Tip: ₹${(data.tipAmount / 100).toLocaleString('en-IN')}`);
    doc.moveDown(0.5);
    doc
      .fontSize(14)
      .text(
        `Total paid: ₹${(data.totalAmount / 100).toLocaleString('en-IN')}`,
        { underline: true },
      );

    doc.moveDown(3);
    doc
      .fontSize(9)
      .fillColor('#888')
      .text('Thank you for your generous contribution.', { align: 'center' });

    doc.end();
  });
}
