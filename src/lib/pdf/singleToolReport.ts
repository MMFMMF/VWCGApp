import jsPDF from 'jspdf';
import type { PDFSection } from '@types/tool';

interface SingleToolReportConfig {
  toolName: string;
  pdfSection: PDFSection;
  generatedAt: Date;
}

const COLORS = {
  primary: '#4F46E5',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#1F2937',
  lightGray: '#F3F4F6'
};

export async function generateSingleToolPDF(config: SingleToolReportConfig): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Helper functions
  const drawLine = (y: number, color = COLORS.lightGray) => {
    doc.setDrawColor(color);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // === HEADER ===
  // VWCG branding - left aligned
  doc.setFontSize(20);
  doc.setTextColor(COLORS.primary);
  doc.text('VWCG', margin, yPos);

  // Generation date - right aligned
  doc.setFontSize(10);
  doc.setTextColor(COLORS.secondary);
  doc.text(
    config.generatedAt.toLocaleDateString(),
    pageWidth - margin,
    yPos,
    { align: 'right' }
  );

  yPos += 10;

  // Tool name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.text);
  doc.text(config.pdfSection.title || config.toolName, margin, yPos);
  yPos += 10;

  drawLine(yPos);
  yPos += 8;

  // === CONTENT ===

  // Summary / Overall score
  if (config.pdfSection.summary) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.secondary);
    const summaryLines = doc.splitTextToSize(config.pdfSection.summary, contentWidth);
    doc.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 5 + 8;
  }

  // Dimension table from tables[0]
  if (config.pdfSection.tables && config.pdfSection.tables.length > 0) {
    const table = config.pdfSection.tables[0];

    checkPageBreak(50);

    // Table header row - primary color background
    doc.setFillColor(COLORS.primary);
    doc.rect(margin, yPos - 2, contentWidth, 8, 'F');

    doc.setFontSize(9);
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    const colWidth = contentWidth / table.headers.length;

    table.headers.forEach((header, idx) => {
      doc.text(header, margin + idx * colWidth + 2, yPos + 3);
    });
    yPos += 10;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.text);
    for (const row of table.rows) {
      checkPageBreak(8);

      row.forEach((cell, idx) => {
        const cellText = doc.splitTextToSize(cell, colWidth - 4);
        doc.text(cellText[0] || '', margin + idx * colWidth + 2, yPos);
      });
      yPos += 6;
    }
    yPos += 8;
  }

  // Additional tables beyond the first
  if (config.pdfSection.tables && config.pdfSection.tables.length > 1) {
    for (let t = 1; t < config.pdfSection.tables.length; t++) {
      const table = config.pdfSection.tables[t];

      checkPageBreak(50);

      // Table header row
      doc.setFillColor(COLORS.lightGray);
      doc.rect(margin, yPos - 2, contentWidth, 8, 'F');

      doc.setFontSize(9);
      doc.setTextColor(COLORS.text);
      doc.setFont('helvetica', 'bold');
      const colWidth = contentWidth / table.headers.length;

      table.headers.forEach((header, idx) => {
        doc.text(header, margin + idx * colWidth + 2, yPos + 3);
      });
      yPos += 10;

      doc.setFont('helvetica', 'normal');
      for (const row of table.rows) {
        checkPageBreak(8);
        row.forEach((cell, idx) => {
          const cellText = doc.splitTextToSize(cell, colWidth - 4);
          doc.text(cellText[0] || '', margin + idx * colWidth + 2, yPos);
        });
        yPos += 6;
      }
      yPos += 8;
    }
  }

  // Key findings from insights
  if (config.pdfSection.insights && config.pdfSection.insights.length > 0) {
    checkPageBreak(30);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.text);
    doc.text('Key Findings:', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const insight of config.pdfSection.insights) {
      checkPageBreak(10);
      const bulletText = `\u2022 ${insight}`;
      const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
      doc.text(lines, margin + 5, yPos);
      yPos += lines.length * 5 + 2;
    }
  }

  // === FOOTER ON ALL PAGES ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.secondary);
    doc.text(
      'Generated by VWCGApp \u2014 vwcgapp.com',
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
    if (totalPages > 1) {
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 14,
        { align: 'center' }
      );
    }
  }

  return doc.output('blob');
}

export function getSingleToolReportFilename(toolName: string, date: Date): string {
  const safeName = toolName.replace(/[^a-zA-Z0-9]/g, '-');
  const dateStr = date.toISOString().split('T')[0];
  return `VWCG-${safeName}-${dateStr}.pdf`;
}
