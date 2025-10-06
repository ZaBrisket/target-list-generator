/**
 * PDF Generator using jsPDF and jsPDF-AutoTable
 *
 * Creates professional PDF export of Target List (Tab 2 only)
 * - Professional styling with company logos
 * - Times-Roman font family
 * - Dark blue header (#1e3a5f) with white text
 * - Alternating row colors (#ffffff and #f8f9fa)
 * - Proper spacing (10px vertical, 12px horizontal)
 * - Footer with date and page numbers
 * - Auto page breaks with repeated headers
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFExportData, ProcessedCompany } from './types';

// Professional color scheme
const COLORS = {
  headerBg: [30, 58, 95] as [number, number, number], // #1e3a5f
  headerText: [255, 255, 255] as [number, number, number], // White
  rowEven: [255, 255, 255] as [number, number, number], // #ffffff
  rowOdd: [248, 249, 250] as [number, number, number], // #f8f9fa
  text: [0, 0, 0] as [number, number, number], // Black
};

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
  doc.setFont('times', 'bold');
  doc.text(reportTitle, pageWidth / 2, 60, { align: 'center' });

  // Company name (if provided)
  if (companyName) {
    doc.setFontSize(16);
    doc.setFont('times', 'normal');
    doc.text(companyName, pageWidth / 2, 75, { align: 'center' });
  }

  // Subtitle
  doc.setFontSize(14);
  doc.setFont('times', 'normal');
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
  doc.setFont('times', 'italic');
  doc.text(
    '($ in millions)',
    pageWidth / 2,
    companyName ? 125 : 115,
    { align: 'center' }
  );

  // Generated date
  doc.setFontSize(9);
  doc.setFont('times', 'normal');
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
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Prepare table data with logo placeholders
  const tableData = companies.map((company, index) => [
    '', // Logo placeholder (will be drawn separately)
    index + 1, // #
    company.companyName,
    company.cityState,
    company.aiSummary,
    company.employeeCount,
    company.estRevMillions.toFixed(1), // Single decimal place
    formatExecutiveSingleLine(company.executiveFirstName, company.executiveLastName, company.executiveTitle),
  ]);

  // Table headers
  const headers = [
    '', // Logo column
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
    theme: 'plain',
    styles: {
      font: 'times',
      fontSize: 9,
      cellPadding: { top: 3.5, right: 4.2, bottom: 3.5, left: 4.2 }, // 10px vertical, 12px horizontal (approx)
      overflow: 'linebreak',
      valign: 'middle',
      textColor: COLORS.text,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.headerText,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 11,
      cellPadding: { top: 3.5, right: 4.2, bottom: 3.5, left: 4.2 },
    },
    alternateRowStyles: {
      fillColor: COLORS.rowOdd,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' }, // Logo
      1: { cellWidth: 8, halign: 'center' }, // #
      2: { cellWidth: 40 }, // Company
      3: { cellWidth: 25 }, // Location
      4: { cellWidth: 95 }, // Description (expanded to prevent mid-word truncation)
      5: { cellWidth: 15, halign: 'right' }, // Employees
      6: { cellWidth: 15, halign: 'right' }, // Revenue
      7: { cellWidth: 35 }, // Executive
    },
    didDrawCell: (data) => {
      // Draw logos in first column (skip header row)
      if (data.column.index === 0 && data.row.index >= 0) {
        const company = companies[data.row.index];
        if (company.logo) {
          try {
            const cellX = data.cell.x;
            const cellY = data.cell.y;
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;

            // Center logo in cell (8x8mm square)
            const logoSize = 8;
            const logoX = cellX + (cellWidth - logoSize) / 2;
            const logoY = cellY + (cellHeight - logoSize) / 2;

            doc.addImage(company.logo, 'PNG', logoX, logoY, logoSize, logoSize);
          } catch (error) {
            // Skip logo if image fails to load
            console.warn(`Failed to add logo for ${company.companyName}:`, error);
          }
        }
      }
    },
    didDrawPage: (data) => {
      // Add footer with date and page number
      const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Date on left
      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.text(today, 14, pageHeight - 10);

      // Page number on right
      const pageNum = doc.getCurrentPageInfo().pageNumber - 1; // Subtract title page
      const totalPages = doc.getNumberOfPages() - 1;
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    },
  });
}

/**
 * Add minimal format table
 */
function addMinimalTable(doc: jsPDF, companies: ProcessedCompany[]) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Prepare table data with logo placeholders
  const tableData = companies.map((company, index) => [
    '', // Logo placeholder
    index + 1, // #
    company.companyName,
    company.cityState,
    company.aiSummary,
    company.growthRate6Mo || '-',
    company.growthRate9Mo || '-',
    company.growthRate24Mo || '-',
    company.estRevMillions.toFixed(1), // Single decimal place
    formatExecutiveSingleLine(company.executiveFirstName, company.executiveLastName, company.executiveTitle),
  ]);

  // Table headers
  const headers = [
    '', // Logo column
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
    theme: 'plain',
    styles: {
      font: 'times',
      fontSize: 8,
      cellPadding: { top: 3.5, right: 4.2, bottom: 3.5, left: 4.2 },
      overflow: 'linebreak',
      valign: 'middle',
      textColor: COLORS.text,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.headerText,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10,
      cellPadding: { top: 3.5, right: 4.2, bottom: 3.5, left: 4.2 },
    },
    alternateRowStyles: {
      fillColor: COLORS.rowOdd,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // Logo
      1: { cellWidth: 7, halign: 'center' }, // #
      2: { cellWidth: 35 }, // Company
      3: { cellWidth: 23 }, // Location
      4: { cellWidth: 85 }, // Description (expanded to prevent mid-word truncation)
      5: { cellWidth: 12, halign: 'right' }, // 6mo
      6: { cellWidth: 12, halign: 'right' }, // 9mo
      7: { cellWidth: 12, halign: 'right' }, // 24mo
      8: { cellWidth: 15, halign: 'right' }, // Revenue
      9: { cellWidth: 30 }, // Executive
    },
    didDrawCell: (data) => {
      // Draw logos in first column (skip header row)
      if (data.column.index === 0 && data.row.index >= 0) {
        const company = companies[data.row.index];
        if (company.logo) {
          try {
            const cellX = data.cell.x;
            const cellY = data.cell.y;
            const cellWidth = data.cell.width;
            const cellHeight = data.cell.height;

            // Center logo in cell (7x7mm square for minimal format)
            const logoSize = 7;
            const logoX = cellX + (cellWidth - logoSize) / 2;
            const logoY = cellY + (cellHeight - logoSize) / 2;

            doc.addImage(company.logo, 'PNG', logoX, logoY, logoSize, logoSize);
          } catch (error) {
            console.warn(`Failed to add logo for ${company.companyName}:`, error);
          }
        }
      }
    },
    didDrawPage: (data) => {
      // Add footer with date and page number
      const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Date on left
      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.text(today, 14, pageHeight - 10);

      // Page number on right
      const pageNum = doc.getCurrentPageInfo().pageNumber - 1;
      const totalPages = doc.getNumberOfPages() - 1;
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
    },
  });
}


/**
 * Format executive name and title as single line
 * "FirstName LastName, Title" instead of "FirstName LastName\nTitle"
 */
function formatExecutiveSingleLine(firstName: string, lastName: string, title: string): string {
  const name = [firstName, lastName].filter(Boolean).join(" ");

  if (!name && !title) return "";
  if (!title) return name;
  if (!name) return title;

  return `${name}, ${title}`;
}

