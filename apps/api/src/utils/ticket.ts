import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export const generateTicketPdf = async (registration: any, event: any, user: any, teamMembers: any[] = []) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 600]); // Portrait pass size
  const { width, height } = page.getSize();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Background cream color (EDITORIAL newspaper theme matching)
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.98, 0.97, 0.95), // cream #FAF9F7
  });

  // Borders
  page.drawRectangle({
    x: 10,
    y: 10,
    width: width - 20,
    height: height - 20,
    borderColor: rgb(0.1, 0.1, 0.1),
    borderWidth: 2,
  });

  // Red accent line at top
  page.drawRectangle({
    x: 10,
    y: height - 25,
    width: width - 20,
    height: 15,
    color: rgb(0.88, 0.0, 0.0), // red #E00000
  });

  // Masthead Text
  page.drawText('CODING CLUB NMIMS SHIRPUR', {
    x: 25,
    y: height - 60,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText('OFFICIAL ENTRY PASS', {
    x: 25,
    y: height - 80,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Divider Line
  page.drawLine({
    start: { x: 25, y: height - 90 },
    end: { x: width - 25, y: height - 90 },
    color: rgb(0.1, 0.1, 0.1),
    thickness: 1,
  });

  // Event Details
  page.drawText('EVENT', { x: 25, y: height - 120, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(event.title, { x: 25, y: height - 145, size: 15, font: fontBold, color: rgb(0.1, 0.1, 0.1), maxWidth: 200 });

  page.drawText('PARTICIPANT', { x: 25, y: height - 180, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(user.name, { x: 25, y: height - 200, size: 13, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

  page.drawText('EMAIL', { x: 25, y: height - 230, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(user.email, { x: 25, y: height - 245, size: 9, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

  if (registration.teamName) {
    page.drawText('TEAM NAME', { x: 25, y: height - 275, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
    page.drawText(registration.teamName, { x: 25, y: height - 290, size: 11, font: fontBold, color: rgb(0.88, 0.0, 0.0) });

    if (teamMembers.length > 0) {
      page.drawText('MEMBERS', { x: 25, y: height - 320, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
      const membersText = teamMembers.map(m => m.name).join(', ');
      page.drawText(membersText, { x: 25, y: height - 335, size: 8, font: fontRegular, color: rgb(0.1, 0.1, 0.1), maxWidth: 180 });
    }
  }

  // QR Code Generation
  const qrPayload = JSON.stringify({
    registrationId: registration._id,
    userId: user._id,
    eventSlug: event.slug,
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, scale: 4 });
  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  page.drawImage(qrImage, {
    x: width - 150,
    y: 35,
    width: 120,
    height: 120,
  });

  // Footer Pass Details
  page.drawText('TICKET ID:', { x: 25, y: 75, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(String(registration._id), { x: 25, y: 60, size: 8, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

  page.drawText('DATE & TIME', { x: 25, y: 125, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(new Date(event.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }), {
    x: 25,
    y: 110,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
