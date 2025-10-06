/**
 * Excel Generator using ExcelJS
 *
 * Creates two-tab Excel workbook:
 * - Tab 1: "Source Data" - Exact copy of uploaded CSV
 * - Tab 2: "Target List" - Formatted output with title block
 *
 * NO HIDDEN COLUMNS - all columns are visible
 * Landscape printing, fit to width
 */

import ExcelJS from 'exceljs';
import {
  ExcelExportData,
  ProcessedCompany,
  OutputFormat,
  SourcescubRawRow,
} from './types';

/**
 * Generate complete Excel workbook with both tabs
 */
export async function generateExcel(data: ExcelExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Target List Generator';
  workbook.created = new Date();

  // Tab 1: Source Data
  createSourceDataTab(workbook, data.sourceData);

  // Tab 2: Target List (formatted)
  if (data.config.format === 'detailed') {
    createDetailedFormatTab(workbook, data.processedData, data.config);
  } else {
    createMinimalFormatTab(workbook, data.processedData, data.config);
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Create Tab 1: Source Data (raw CSV data)
 */
function createSourceDataTab(
  workbook: ExcelJS.Workbook,
  sourceData: SourcescubRawRow[]
) {
  const worksheet = workbook.addWorksheet('Source Data');

  if (sourceData.length === 0) return;

  // Get all column headers from first row
  const headers = Object.keys(sourceData[0]);

  // Add header row
  worksheet.addRow(headers);

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data rows
  sourceData.forEach(row => {
    const values = headers.map(header => row[header as keyof SourcescubRawRow] || '');
    worksheet.addRow(values);
  });

  // Auto-fit columns (basic)
  worksheet.columns.forEach((column, index) => {
    column.width = 15; // Default width
  });
}

/**
 * Create Tab 2: Target List - Detailed Format (16 columns)
 */
function createDetailedFormatTab(
  workbook: ExcelJS.Workbook,
  companies: ProcessedCompany[],
  config: { reportTitle: string; companyName?: string }
) {
  const worksheet = workbook.addWorksheet('Target List');

  // Title block (rows 1-5)
  createTitleBlock(worksheet, config.reportTitle, config.companyName);

  // Column headers (row 6)
  const headerRow = worksheet.getRow(6);
  headerRow.values = [
    '', '', '', // A, B, C (margin columns)
    '', // D (Logo)
    '#', // E
    'Company', // F
    'City', // G
    'State', // H
    'City, State', // I
    'Website', // J
    'Domain', // K
    'Description', // L
    'Count', // M (Employee Count)
    'Est. Rev', // N
    'Executive Title', // O
    'Executive Name', // P
    'Executive First Name', // Q
    'Executive Last Name', // R
    'Executive', // S (formatted)
    'Latest Estimated Revenue ($)', // T (optional)
  ];

  // Style header row
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD0D0D0' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  // Data rows (row 7+)
  companies.forEach((company, index) => {
    const rowIndex = 7 + index;
    const row = worksheet.addRow([
      '', '', '', // A, B, C (margin)
      '', // D: Logo placeholder
      index + 1, // E: Sequential number
      company.companyName, // F
      company.city, // G
      company.state, // H
      company.cityState, // I
      company.website, // J
      company.domain, // K
      company.aiSummary, // L
      company.employeeCount, // M
      company.estRevMillions, // N
      company.executiveTitle, // O
      company.executiveName, // P
      company.executiveFirstName, // Q
      company.executiveLastName, // R
      formatExecutiveSingleLine(company.executiveFirstName, company.executiveLastName, company.executiveTitle), // S - single line format
      company.latestEstimatedRevenue, // T
    ]);

    // Add logo image if available
    if (company.logo) {
      try {
        // Extract base64 data
        const base64Data = company.logo.replace(/^data:image\/\w+;base64,/, '');

        // Add image to workbook
        const imageId = workbook.addImage({
          base64: base64Data,
          extension: 'png',
        });

        // Insert image in logo column (column D)
        // Image positioned at row center, 40x40 pixels
        worksheet.addImage(imageId, {
          tl: { col: 3, row: rowIndex - 1 }, // Top-left (0-indexed)
          ext: { width: 40, height: 40 },
          editAs: 'oneCell',
        });

        // Set row height to accommodate logo
        row.height = 32;
      } catch (error) {
        console.warn(`Failed to add logo for ${company.companyName}:`, error);
      }
    }

    // Format revenue column (1 decimal place)
    const revCell = row.getCell(14); // Column N
    revCell.numFmt = '0.0';
  });

  // Set column widths
  worksheet.getColumn('D').width = 7; // Logo
  worksheet.getColumn('E').width = 5; // #
  worksheet.getColumn('F').width = 30; // Company
  worksheet.getColumn('G').width = 15; // City
  worksheet.getColumn('H').width = 6; // State
  worksheet.getColumn('I').width = 20; // City, State
  worksheet.getColumn('J').width = 25; // Website
  worksheet.getColumn('K').width = 20; // Domain
  worksheet.getColumn('L').width = 60; // Description (wider for 200-250 chars)
  worksheet.getColumn('M').width = 8; // Count
  worksheet.getColumn('N').width = 12; // Est. Rev
  worksheet.getColumn('O').width = 20; // Executive Title
  worksheet.getColumn('P').width = 20; // Executive Name
  worksheet.getColumn('Q').width = 15; // First Name
  worksheet.getColumn('R').width = 15; // Last Name
  worksheet.getColumn('S').width = 25; // Executive formatted
  worksheet.getColumn('T').width = 15; // Revenue $

  // Page setup for printing
  worksheet.pageSetup = {
    paperSize: 9, // Letter
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0, // Unlimited pages vertically
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    },
  };

  // Print titles (repeat header row on each page)
  worksheet.pageSetup.printTitlesRow = '6:6';
}

/**
 * Create Tab 2: Target List - Minimal Format (9 columns)
 */
function createMinimalFormatTab(
  workbook: ExcelJS.Workbook,
  companies: ProcessedCompany[],
  config: { reportTitle: string; companyName?: string }
) {
  const worksheet = workbook.addWorksheet('Target List');

  // Title block (rows 1-5)
  createTitleBlock(worksheet, config.reportTitle, config.companyName);

  // Column headers (row 6)
  // Columns positioned at D (logo), E (#), G (Company), M (City,State), U (Description), AB, AC, AE, AI, AS per spec
  const headerRow = worksheet.getRow(6);

  // Set specific column values
  headerRow.getCell('D').value = ''; // Logo
  headerRow.getCell('E').value = '#';
  headerRow.getCell('G').value = 'Company';
  headerRow.getCell('M').value = 'City, State';
  headerRow.getCell('U').value = 'Description';
  headerRow.getCell('AB').value = '6 Months Growth Rate %';
  headerRow.getCell('AC').value = '9 Months Growth Rate %';
  headerRow.getCell('AE').value = '24 Months Growth Rate %';
  headerRow.getCell('AI').value = 'Est. Rev';
  headerRow.getCell('AS').value = 'Executive';

  // Style header row
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD0D0D0' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;

  // Data rows (row 7+)
  companies.forEach((company, index) => {
    const rowIndex = 7 + index;
    const row = worksheet.getRow(rowIndex);

    // D: Logo (placeholder)
    row.getCell('E').value = index + 1; // #
    row.getCell('G').value = company.companyName;
    row.getCell('M').value = company.cityState;
    row.getCell('U').value = company.aiSummary;
    row.getCell('AB').value = company.growthRate6Mo || '';
    row.getCell('AC').value = company.growthRate9Mo || '';
    row.getCell('AE').value = company.growthRate24Mo || '';
    row.getCell('AI').value = company.estRevMillions;
    row.getCell('AS').value = formatExecutiveSingleLine(company.executiveFirstName, company.executiveLastName, company.executiveTitle);

    // Add logo image if available
    if (company.logo) {
      try {
        const base64Data = company.logo.replace(/^data:image\/\w+;base64,/, '');

        const imageId = workbook.addImage({
          base64: base64Data,
          extension: 'png',
        });

        // Insert image in logo column (column D, 0-indexed = col 3)
        worksheet.addImage(imageId, {
          tl: { col: 3, row: rowIndex - 1 },
          ext: { width: 35, height: 35 },
          editAs: 'oneCell',
        });

        row.height = 30;
      } catch (error) {
        console.warn(`Failed to add logo for ${company.companyName}:`, error);
      }
    }

    // Format revenue column (1 decimal place)
    const revCell = row.getCell('AI');
    revCell.numFmt = '0.0';

    row.commit();
  });

  // Set column widths
  worksheet.getColumn('D').width = 7; // Logo
  worksheet.getColumn('E').width = 5; // #
  worksheet.getColumn('G').width = 30; // Company
  worksheet.getColumn('M').width = 20; // City, State
  worksheet.getColumn('U').width = 60; // Description (wider for 200-250 chars)
  worksheet.getColumn('AB').width = 12; // 6mo growth
  worksheet.getColumn('AC').width = 12; // 9mo growth
  worksheet.getColumn('AE').width = 12; // 24mo growth
  worksheet.getColumn('AI').width = 12; // Est. Rev
  worksheet.getColumn('AS').width = 25; // Executive

  // Page setup for printing
  worksheet.pageSetup = {
    paperSize: 9, // Letter
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.25,
      right: 0.25,
      top: 0.5,
      bottom: 0.5,
      header: 0.3,
      footer: 0.3,
    },
  };

  // Print titles
  worksheet.pageSetup.printTitlesRow = '6:6';
}

/**
 * Create title block (rows 1-5) per specification
 */
function createTitleBlock(
  worksheet: ExcelJS.Workbook['worksheets'][0],
  reportTitle: string,
  companyName?: string
) {
  // Row 1: Empty
  worksheet.getRow(1).values = [''];

  // Row 2: Report title and optional company name
  const row2 = worksheet.getRow(2);
  if (companyName) {
    row2.getCell('C').value = reportTitle;
    row2.getCell('D').value = companyName;
  } else {
    row2.getCell('C').value = reportTitle;
  }

  // Merge cells C2:K2 for title
  worksheet.mergeCells('C2:K2');
  row2.getCell('C').font = { bold: true, size: 14 };
  row2.getCell('C').alignment = { horizontal: 'center' };
  row2.height = 25;

  // Row 3: Subtitle
  const row3 = worksheet.getRow(3);
  row3.getCell('C').value = 'Acquisition Target Universe (Sorted by Est. Revenue)';
  row3.getCell('C').font = { bold: true, size: 12 };

  row3.getCell('U').value = '($ in millions)';
  row3.getCell('U').font = { italic: true, size: 10 };

  // Row 4: Empty
  worksheet.getRow(4).values = [''];

  // Row 5: Label for employee count
  const row5 = worksheet.getRow(5);
  row5.getCell('M').value = 'Est. Employee';
  row5.getCell('M').font = { size: 10 };
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

