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
    '#', // D
    'Company', // E
    'City', // F
    'State', // G
    'City, State', // H
    'Website', // I
    'Domain', // J
    'Description', // K
    'Count', // L (Employee Count)
    'Est. Rev', // M
    'Executive Title', // N
    'Executive Name', // O
    'Executive First Name', // P
    'Executive Last Name', // Q
    'Executive', // R (formatted)
    'Latest Estimated Revenue ($)', // S (optional)
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
    const row = worksheet.addRow([
      '', '', '', // A, B, C (margin)
      index + 1, // D: Sequential number
      company.companyName, // E
      company.city, // F
      company.state, // G
      company.cityState, // H
      company.website, // I
      company.domain, // J
      company.aiSummary, // K
      company.employeeCount, // L
      company.estRevMillions, // M
      company.executiveTitle, // N
      company.executiveName, // O
      company.executiveFirstName, // P
      company.executiveLastName, // Q
      company.executiveFormatted, // R
      company.latestEstimatedRevenue, // S
    ]);

    // Enable text wrapping for executive column (has line break)
    const execCell = row.getCell(18); // Column R
    execCell.alignment = { wrapText: true, vertical: 'top' };

    // Format revenue column (6 decimal places)
    const revCell = row.getCell(13); // Column M
    revCell.numFmt = '0.000000';
  });

  // Set column widths
  worksheet.getColumn('D').width = 5; // #
  worksheet.getColumn('E').width = 30; // Company
  worksheet.getColumn('F').width = 15; // City
  worksheet.getColumn('G').width = 6; // State
  worksheet.getColumn('H').width = 20; // City, State
  worksheet.getColumn('I').width = 25; // Website
  worksheet.getColumn('J').width = 20; // Domain
  worksheet.getColumn('K').width = 50; // Description
  worksheet.getColumn('L').width = 8; // Count
  worksheet.getColumn('M').width = 12; // Est. Rev
  worksheet.getColumn('N').width = 20; // Executive Title
  worksheet.getColumn('O').width = 20; // Executive Name
  worksheet.getColumn('P').width = 15; // First Name
  worksheet.getColumn('Q').width = 15; // Last Name
  worksheet.getColumn('R').width = 25; // Executive formatted
  worksheet.getColumn('S').width = 15; // Revenue $

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
  // Columns positioned at D, F, L, T, AA, AB, AD, AH, AR per spec
  const headerRow = worksheet.getRow(6);

  // Set specific column values
  headerRow.getCell('D').value = '#';
  headerRow.getCell('F').value = 'Company';
  headerRow.getCell('L').value = 'City, State';
  headerRow.getCell('T').value = 'Description';
  headerRow.getCell('AA').value = '6 Months Growth Rate %';
  headerRow.getCell('AB').value = '9 Months Growth Rate %';
  headerRow.getCell('AD').value = '24 Months Growth Rate %';
  headerRow.getCell('AH').value = 'Est. Rev';
  headerRow.getCell('AR').value = 'Executive';

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
    const row = worksheet.getRow(7 + index);

    row.getCell('D').value = index + 1; // #
    row.getCell('F').value = company.companyName;
    row.getCell('L').value = company.cityState;
    row.getCell('T').value = company.aiSummary;
    row.getCell('AA').value = company.growthRate6Mo || '';
    row.getCell('AB').value = company.growthRate9Mo || '';
    row.getCell('AD').value = company.growthRate24Mo || '';
    row.getCell('AH').value = company.estRevMillions;
    row.getCell('AR').value = company.executiveFormatted;

    // Enable text wrapping for executive column
    const execCell = row.getCell('AR');
    execCell.alignment = { wrapText: true, vertical: 'top' };

    // Format revenue column
    const revCell = row.getCell('AH');
    revCell.numFmt = '0.000000';

    row.commit();
  });

  // Set column widths
  worksheet.getColumn('D').width = 5; // #
  worksheet.getColumn('F').width = 30; // Company
  worksheet.getColumn('L').width = 20; // City, State
  worksheet.getColumn('T').width = 50; // Description
  worksheet.getColumn('AA').width = 12; // 6mo growth
  worksheet.getColumn('AB').width = 12; // 9mo growth
  worksheet.getColumn('AD').width = 12; // 24mo growth
  worksheet.getColumn('AH').width = 12; // Est. Rev
  worksheet.getColumn('AR').width = 25; // Executive

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
