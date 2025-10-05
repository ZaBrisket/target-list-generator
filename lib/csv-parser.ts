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
    // Convert ArrayBuffer to string
    const decoder = new TextDecoder('utf-8');
    const csvText = decoder.decode(buffer);

    Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as string[][];

          // Sourcescrub format: skip first 2 rows
          if (rows.length < 4) {
            reject(new Error('File has insufficient rows. Expected at least 4 rows (URL, blank, headers, data).'));
            return;
          }

          // Row 3 (index 2) contains headers
          const headers = rows[2];

          // Rows 4+ (index 3+) contain data
          const dataRows = rows.slice(3);

          // Convert to objects
          const data = dataRows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: any) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
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
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Sourcescrub format: skip first 2 rows
    if (rows.length < 4) {
      throw new Error('File has insufficient rows. Expected at least 4 rows (URL, blank, headers, data).');
    }

    // Row 3 (index 2) contains headers
    const headers = rows[2];

    // Rows 4+ (index 3+) contain data
    const dataRows = rows.slice(3);

    // Convert to objects
    const data = dataRows.map(row => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] !== undefined ? String(row[index]) : '';
      });
      return obj;
    });

    return data;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error}`);
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
