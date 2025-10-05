/**
 * CSV Parser for Sourcescrub Format
 *
 * Handles the specific Sourcescrub CSV format:
 * - Row 1: Search URL (skip)
 * - Row 2: Blank (skip)
 * - Row 3: Column headers
 * - Row 4+: Company data
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SourcescubRawRow, ValidationResult } from './types';

// Required columns for validation
const REQUIRED_COLUMNS = [
  'Company Name',
  'City',
  'State',
  'Website',
  'Description',
  'Employee Count',
  'Latest Estimated Revenue ($)',
  'Executive Title',
  'Executive First Name',
  'Executive Last Name',
];

/**
 * Parse uploaded file (CSV or XLSX) into Sourcescrub format
 * Server-side version that works with file buffer
 */
export async function parseUploadedFile(fileBuffer: ArrayBuffer, fileName: string): Promise<{
  data: SourcescubRawRow[];
  validation: ValidationResult;
}> {
  const fileExtension = fileName.toLowerCase().split('.').pop();

  let rawData: any[] = [];

  if (fileExtension === 'csv') {
    rawData = await parseCSVBuffer(fileBuffer);
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    rawData = await parseExcelBuffer(fileBuffer);
  } else {
    throw new Error('Unsupported file format. Please upload CSV or XLSX files.');
  }

  // Validate the parsed data
  const validation = validateData(rawData);

  return {
    data: rawData as SourcescubRawRow[],
    validation,
  };
}

/**
 * Parse CSV buffer with Sourcescrub format handling
 */
async function parseCSVBuffer(buffer: ArrayBuffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      // Convert ArrayBuffer to string, handling UTF-8 BOM
      const decoder = new TextDecoder('utf-8');
      let csvText = decoder.decode(buffer);

      // Remove UTF-8 BOM if present (EF BB BF)
      if (csvText.charCodeAt(0) === 0xFEFF) {
        csvText = csvText.substring(1);
      }

      // Parse CSV
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: 'greedy', // Skip all empty lines including whitespace-only
        complete: (results) => {
          try {
            const rows = results.data as string[][];

            // Filter out completely empty rows and the Search URL row
            const nonEmptyRows = rows.filter(row => {
              // Skip if row is empty or all cells are empty
              if (!row || row.length === 0) return false;

              // Skip if first cell starts with "Search Url" (metadata row)
              if (row[0] && row[0].trim().toLowerCase().startsWith('search url')) return false;

              // Skip if all cells are empty
              const hasContent = row.some(cell => cell && cell.trim().length > 0);
              return hasContent;
            });

            // Validate we have enough rows
            if (nonEmptyRows.length < 2) {
              reject(new Error(`File has insufficient rows. Found ${nonEmptyRows.length} non-empty rows, expected at least 2 (headers + data).`));
              return;
            }

            // First non-empty row should be headers
            const headers = nonEmptyRows[0].map(h => (h || '').trim());

            // Validate headers are present
            if (headers.length === 0 || headers.every(h => !h)) {
              reject(new Error('No valid column headers found in CSV file.'));
              return;
            }

            // Remaining rows are data
            const dataRows = nonEmptyRows.slice(1);

            if (dataRows.length === 0) {
              reject(new Error('No data rows found in CSV file.'));
              return;
            }

            // Convert to objects
            const data = dataRows.map(row => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] !== undefined ? String(row[index]).trim() : '';
              });
              return obj;
            });

            resolve(data);
          } catch (error: any) {
            reject(new Error(`Error processing CSV data: ${error.message}`));
          }
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    } catch (error: any) {
      reject(new Error(`Failed to decode CSV file: ${error.message}`));
    }
  });
}

/**
 * Parse Excel buffer
 */
async function parseExcelBuffer(buffer: ArrayBuffer): Promise<any[]> {
  try {
    // Read workbook from buffer
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to array of arrays
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

    // Filter out completely empty rows and the Search URL row
    const nonEmptyRows = rows.filter(row => {
      // Skip if row is empty or all cells are empty
      if (!row || row.length === 0) return false;

      // Skip if first cell starts with "Search Url" (metadata row)
      if (row[0] && String(row[0]).trim().toLowerCase().startsWith('search url')) return false;

      // Skip if all cells are empty
      const hasContent = row.some(cell => cell !== undefined && cell !== null && String(cell).trim().length > 0);
      return hasContent;
    });

    // Validate we have enough rows
    if (nonEmptyRows.length < 2) {
      throw new Error(`File has insufficient rows. Found ${nonEmptyRows.length} non-empty rows, expected at least 2 (headers + data).`);
    }

    // First non-empty row should be headers
    const headers = nonEmptyRows[0].map((h: any) => String(h || '').trim());

    // Validate headers are present
    if (headers.length === 0 || headers.every((h: string) => !h)) {
      throw new Error('No valid column headers found in Excel file.');
    }

    // Remaining rows are data
    const dataRows = nonEmptyRows.slice(1);

    if (dataRows.length === 0) {
      throw new Error('No data rows found in Excel file.');
    }

    // Convert to objects
    const data = dataRows.map(row => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] !== undefined && row[index] !== null ? String(row[index]).trim() : '';
      });
      return obj;
    });

    return data;
  } catch (error: any) {
    throw new Error(`Failed to parse Excel file: ${error.message || error}`);
  }
}

/**
 * Validate parsed data
 */
function validateData(data: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data is empty
  if (data.length === 0) {
    errors.push('No data rows found in file');
    return {
      isValid: false,
      errors,
      warnings,
      rowCount: 0,
      missingColumns: [],
    };
  }

  // Check for required columns
  const firstRow = data[0];
  const availableColumns = Object.keys(firstRow);
  const missingColumns = REQUIRED_COLUMNS.filter(
    col => !availableColumns.includes(col)
  );

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Check for reasonable data volume
  if (data.length > 500) {
    warnings.push(`Large file detected (${data.length} companies). Processing may take 15-20 minutes.`);
  } else if (data.length > 300) {
    warnings.push(`File contains ${data.length} companies. Processing will take approximately 10-12 minutes.`);
  }

  // Check for missing critical data
  let rowsWithMissingData = 0;
  data.forEach((row, index) => {
    const hasMissingCritical =
      !row['Company Name'] ||
      !row['Description'] ||
      !row['Latest Estimated Revenue ($)'];

    if (hasMissingCritical) {
      rowsWithMissingData++;
    }
  });

  if (rowsWithMissingData > 0) {
    warnings.push(`${rowsWithMissingData} rows have missing critical data (company name, description, or revenue)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    rowCount: data.length,
    missingColumns,
  };
}

/**
 * Extract domain from website URL
 */
export function extractDomain(website: string): string {
  if (!website) return '';

  try {
    // Remove protocol
    let domain = website.replace(/^https?:\/\//, '');

    // Remove www.
    domain = domain.replace(/^www\./, '');

    // Remove path and query string
    domain = domain.split('/')[0];
    domain = domain.split('?')[0];

    return domain;
  } catch {
    return website;
  }
}

/**
 * Format revenue in millions
 */
export function formatRevenueMillions(revenueString: string): number {
  if (!revenueString) return 0;

  try {
    // Remove any commas and parse as float
    const revenue = parseFloat(revenueString.replace(/,/g, ''));

    if (isNaN(revenue)) return 0;

    // Convert to millions
    return revenue / 1000000;
  } catch {
    return 0;
  }
}

/**
 * Create city, state formatted string
 */
export function formatCityState(city: string, state: string): string {
  const parts = [];
  if (city) parts.push(city);
  if (state) parts.push(state);
  return parts.join(', ');
}

/**
 * Format executive name and title with line break
 */
export function formatExecutive(firstName: string, lastName: string, title: string): string {
  const name = [firstName, lastName].filter(Boolean).join(' ');
  if (!name && !title) return '';
  if (!title) return name;
  if (!name) return title;
  return `${name}\n${title}`;
}

/**
 * Get executive full name
 */
export function getExecutiveName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}
