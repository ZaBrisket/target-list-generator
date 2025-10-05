/**
 * PDF Generator using jsPDF and jsPDF-AutoTable
 *
 * Creates professional PDF export of Target List (Tab 2 only)
 * - Title page with report info
 * - Data table with auto page breaks
 * - Repeated headers on each page
 * - Page numbering
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFExportData, ProcessedCompany } from './types';

/**
 * Generate PDF export
 */
export async function generatePDF(data: PDFExportData): Promise<Buffer> {
  // Create PDF in landscape mode
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
  });

  // Add title page
  addTitlePage(doc, data.config.reportTitle, data.config.companyName, data.processedData.length);

  // Add data table
  if (data.config.format === 'detailed') {
    addDetailedTable(doc, data.processedData);
  } else {
    addMinimalTable(doc, data.processedData);
  }

  // Add page numbers to all pages except title
  addPageNumbers(doc);

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

/**
 * Add title page
 */
function addTitlePage(
  doc: jsPDF,
  reportTitle: string,
  companyName: string | undefined,
  companyCount: number
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle, pageWidth / 2, 60, { align: 'center' });

  // Company name (if provided)
  if (companyName) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(companyName, pageWidth / 2, 75, { align: 'center' });
  }

  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Acquisition Target Universe (Sorted by Est. Revenue)',
    pageWidth / 2,
    companyName ? 95 : 85,
    { align: 'center' }
  );

  // Company count
  doc.setFontSize(12);
  doc.text(
    `${companyCount} Companies`,
    pageWidth / 2,
    companyName ? 110 : 100,
    { align: 'center' }
  );

  // Revenue note
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(
    '($ in millions)',
    pageWidth / 2,
    companyName ? 125 : 115,
    { align: 'center' }
  );

  // Generated date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(
    `Generated: ${today}`,
    pageWidth / 2,
    pageHeight - 20,
    { align: 'center' }
  );

  // Add new page for data
  doc.addPage();
}

/**
 * Add detailed format table
 */
function addDetailedTable(doc: jsPDF, companies: ProcessedCompany[]) {
  // Prepare table data
  const tableData = companies.map((company, index) => [
    index + 1, // #
    company.companyName,
    company.cityState,
    company.aiSummary,
    company.employeeCount,
    company.estRevMillions.toFixed(2),
    company.executiveFormatted.replace('\n', ' - '), // Replace line break with dash for PDF
  ]);

  // Table headers
  const headers = [
    '#',
    'Company',
    'Location',
    'Description',
    'Employees',
    'Est. Rev ($M)',
    'Executive',
  ];

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 20,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'top',
    },
    headStyles: {
      fillColor: [68, 114, 196], // Blue header
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // #
      1: { cellWidth: 50 }, // Company
      2: { cellWidth: 35 }, // Location
      3: { cellWidth: 75 }, // Description
      4: { cellWidth: 20, halign: 'right' }, // Employees
      5: { cellWidth: 20, halign: 'right' }, // Revenue
      6: { cellWidth: 40 }, // Executive
    },
    didDrawPage: (data) => {
      // Header on each page
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Target List', 14, 15);
    },
  });
}

/**
 * Add minimal format table
 */
function addMinimalTable(doc: jsPDF, companies: ProcessedCompany[]) {
  // Prepare table data
  const tableData = companies.map((company, index) => [
    index + 1, // #
    company.companyName,
    company.cityState,
    company.aiSummary,
    company.growthRate6Mo || '-',
    company.growthRate9Mo || '-',
    company.growthRate24Mo || '-',
    company.estRevMillions.toFixed(2),
    company.executiveFormatted.replace('\n', ' - '),
  ]);

  // Table headers
  const headers = [
    '#',
    'Company',
    'Location',
    'Description',
    '6Mo %',
    '9Mo %',
    '24Mo %',
    'Est. Rev ($M)',
    'Executive',
  ];

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 20,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      overflow: 'linebreak',
      valign: 'top',
    },
    headStyles: {
      fillColor: [68, 114, 196],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' }, // #
      1: { cellWidth: 45 }, // Company
      2: { cellWidth: 30 }, // Location
      3: { cellWidth: 65 }, // Description
      4: { cellWidth: 15, halign: 'right' }, // 6mo
      5: { cellWidth: 15, halign: 'right' }, // 9mo
      6: { cellWidth: 15, halign: 'right' }, // 24mo
      7: { cellWidth: 20, halign: 'right' }, // Revenue
      8: { cellWidth: 35 }, // Executive
    },
    didDrawPage: (data) => {
      // Header on each page
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Target List - Growth Metrics', 14, 15);
    },
  });
}

/**
 * Add page numbers to all pages except first (title page)
 */
function addPageNumbers(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i - 1} of ${totalPages - 1}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
}
