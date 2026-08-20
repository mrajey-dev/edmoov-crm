import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadPageAsPDF = async (fileName = 'export.pdf') => {
  // Hide elements that shouldn't be in the PDF
  const elementsToHide = document.querySelectorAll('.no-print');
  elementsToHide.forEach(el => el.style.display = 'none');

  // We capture the main app container, but exclude the top nav
  const elementToCapture = document.querySelector('.main-content') || document.body;

  try {
    const canvas = await html2canvas(elementToCapture, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc' // light gray background from dashboard
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 Landscape is often better for dashboards
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate aspect ratio
    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;
    const pdfRatio = pdfWidth / pdfHeight;

    let finalWidth = pdfWidth;
    let finalHeight = pdfHeight;

    if (imgRatio > pdfRatio) {
      // Image is wider than PDF
      finalHeight = pdfWidth / imgRatio;
    } else {
      // Image is taller than PDF
      finalWidth = pdfHeight * imgRatio;
    }

    // Add image to PDF (centered if needed, but top-left is usually fine)
    pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
    
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    // Restore hidden elements
    elementsToHide.forEach(el => el.style.display = '');
  }
};
