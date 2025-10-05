'use server';

/**
 * Server Actions for Target List Generator
 * Handles file processing, AI analysis, and export generation
 */

import { parseUploadedFile } from '@/lib/csv-parser';
import { processCompanies } from '@/lib/claude';
import { generateExcel } from '@/lib/excel-generator';
import { generatePDF } from '@/lib/pdf-generator';
import { batchFetchLogos } from '@/lib/logo-fetcher';
import {
  OutputConfig,
  ProcessedCompany,
  SourcescubRawRow,
  ValidationResult,
} from '@/lib/types';

export interface ProcessFileResult {
  success: boolean;
  validation?: ValidationResult;
  error?: string;
  sourceData?: string; // JSON stringified source data
}

export interface ProcessCompaniesResult {
  success: boolean;
  processedData?: string; // JSON stringified processed companies
  error?: string;
}

export interface GenerateExcelResult {
  success: boolean;
  fileData?: string; // Base64 encoded file
  fileName?: string;
  error?: string;
}

/**
 * Parse and validate uploaded file
 */
export async function parseFile(formData: FormData): Promise<ProcessFileResult> {
  try {
    const file = formData.get('file') as File;

    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    // Convert file to array buffer for server-side processing
    const arrayBuffer = await file.arrayBuffer();

    // Parse file
    const { data, validation } = await parseUploadedFile(arrayBuffer, file.name);

    if (!validation.isValid) {
      return {
        success: false,
        validation,
        error: validation.errors.join('; '),
      };
    }

    // Return parsed data as JSON string (to avoid serialization issues)
    return {
      success: true,
      validation,
      sourceData: JSON.stringify(data),
    };
  } catch (error: any) {
    console.error('Parse file error:', error);
    return {
      success: false,
      error: error.message || 'Failed to parse file',
    };
  }
}

/**
 * Process companies with AI and fetch logos
 * Note: This is a long-running operation (6-8 minutes for 200 companies)
 */
export async function processCompaniesAction(
  sourceDataJson: string
): Promise<ProcessCompaniesResult> {
  try {
    const sourceData: SourcescubRawRow[] = JSON.parse(sourceDataJson);

    // Process companies with AI (generates summaries)
    const processedCompanies = await processCompanies(sourceData);

    // Fetch logos in parallel (5 concurrent requests max)
    console.log('Fetching company logos...');
    const logoData = processedCompanies.map(company => ({
      domain: company.domain,
      companyName: company.companyName,
    }));

    const logoResults = await batchFetchLogos(logoData, 5, (current, total) => {
      console.log(`Fetched logo ${current}/${total}`);
    });

    // Attach logos to processed companies
    processedCompanies.forEach(company => {
      const logoResult = logoResults.get(company.companyName);
      if (logoResult && logoResult.success) {
        company.logo = logoResult.data;
        company.logoSource = logoResult.source;
      } else {
        company.logoSource = 'none';
      }
    });

    console.log(`Successfully processed ${processedCompanies.length} companies with logos`);

    return {
      success: true,
      processedData: JSON.stringify(processedCompanies),
    };
  } catch (error: any) {
    console.error('Process companies error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process companies',
    };
  }
}

/**
 * Generate Excel file
 */
export async function generateExcelAction(
  sourceDataJson: string,
  processedDataJson: string,
  config: OutputConfig
): Promise<GenerateExcelResult> {
  try {
    const sourceData: SourcescubRawRow[] = JSON.parse(sourceDataJson);
    const processedData: ProcessedCompany[] = JSON.parse(processedDataJson);

    // Generate Excel
    const excelBuffer = await generateExcel({
      config,
      sourceData,
      processedData,
    });

    // Convert to base64 for transfer
    const base64 = excelBuffer.toString('base64');

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `${config.reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;

    return {
      success: true,
      fileData: base64,
      fileName,
    };
  } catch (error: any) {
    console.error('Generate Excel error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate Excel file',
    };
  }
}

/**
 * Generate PDF file
 */
export async function generatePDFAction(
  processedDataJson: string,
  config: OutputConfig
): Promise<GenerateExcelResult> {
  try {
    const processedData: ProcessedCompany[] = JSON.parse(processedDataJson);

    // Generate PDF
    const pdfBuffer = await generatePDF({
      config,
      processedData,
    });

    // Convert to base64 for transfer
    const base64 = pdfBuffer.toString('base64');

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `${config.reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;

    return {
      success: true,
      fileData: base64,
      fileName,
    };
  } catch (error: any) {
    console.error('Generate PDF error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate PDF file',
    };
  }
}
