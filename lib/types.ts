/**
 * Type definitions for Target List Generator
 * Business logic for M&A target list transformation
 */

// ============================================================================
// CSV INPUT TYPES (Sourcescrub Format)
// ============================================================================

export interface SourcescubRawRow {
  'Company Name': string;
  'Informal Name': string;
  'Founding Year': string;
  'Street': string;
  'City': string;
  'State': string;
  'Postal Code': string;
  'Country': string;
  'Phone Number': string;
  'Website': string;
  'Description': string;
  'Specialties': string;
  'LinkedIn Account': string;
  'Employee Count': string;
  'Employee Range': string;
  'Products and Services': string;
  'End Markets': string;
  'Top List Count': string;
  'Investment Banking Conference Count': string;
  'Latest Web Traffic Rank': string;
  'Latest Web Traffic Rank Change Absolute': string;
  'Latest Web Traffic Rank Change Percentage': string;
  'Latest Web Traffic Visits': string;
  'Latest Web Traffic Visits Change Percentage': string;
  '3 Months Growth Rate %': string;
  '6 Months Growth Rate %': string;
  '9 Months Growth Rate %': string;
  '12 Months Growth Rate %': string;
  '24 Months Growth Rate %': string;
  'Growth Intent': string;
  'Job Count': string;
  'Ownership': string;
  'Total Raised': string;
  'Latest Raised': string;
  'Date of Most Recent Investment': string;
  'Investors': string;
  'Parent Company': string;
  'Executive Title': string;
  'Executive First Name': string;
  'Executive Last Name': string;
  'Executive Email': string;
  'Executive LinkedIn': string;
  'Last Financial Year': string;
  'Verified Revenue': string;
  'Latest Estimated Revenue ($)': string;
  'Latest Estimated Revenue Min ($)': string;
  'Latest Estimated Revenue Max ($)': string;
  'Financial Growth %': string;
  'Financial Growth Period (yr)': string;
  'Sources Count': string;
  'CRM Id': string;
  '(CRM) Top Prospect?': string;
  'My Tags': string;
  'Firm Tags': string;
  'Industries': string;
  'Lists': string;
  'ProfileUrl': string;
  'Lead Investor': string;
  'Notes': string;
  'Registration Number 1': string;
  'Registry Type 1': string;
}

// ============================================================================
// PROCESSED COMPANY DATA
// ============================================================================

export interface ProcessedCompany {
  // Core identifiers
  companyName: string;
  informalName: string;

  // Location
  city: string;
  state: string;
  cityState: string; // "City, State" format

  // Web presence
  website: string;
  domain: string; // Extracted from website (no https://, no www)

  // Descriptions
  originalDescription: string;
  aiSummary: string; // AI-generated 120-150 char summary
  specialties: string;

  // Financials
  employeeCount: string;
  latestEstimatedRevenue: number; // Raw dollar amount
  estRevMillions: number; // Revenue / 1,000,000

  // Growth metrics (optional)
  growthRate6Mo?: string;
  growthRate9Mo?: string;
  growthRate24Mo?: string;

  // Executive
  executiveTitle: string;
  executiveFirstName: string;
  executiveLastName: string;
  executiveName: string; // "First Last"
  executiveFormatted: string; // "First Last\nTitle" (with line break)

  // Additional data
  industries: string;

  // Quality flags
  summaryQuality: 'excellent' | 'good' | 'needs_review';
  summaryRetries: number;
}

// ============================================================================
// OUTPUT FORMATS
// ============================================================================

export type OutputFormat = 'detailed' | 'minimal';

export interface OutputConfig {
  format: OutputFormat;
  reportTitle: string;
  companyName?: string; // Optional company name for title block
}

// Detailed format (16 columns)
export interface DetailedOutputRow {
  '#': number;
  'Company': string;
  'City': string;
  'State': string;
  'City, State': string;
  'Website': string;
  'Domain': string;
  'Description': string; // AI summary
  'Count': string; // Employee count
  'Est. Rev': number; // In millions
  'Executive Title': string;
  'Executive Name': string;
  'Executive First Name': string;
  'Executive Last Name': string;
  'Executive': string; // Formatted with line break
  'Latest Estimated Revenue ($)': string; // Optional, can be blank
}

// Minimal format (9 columns)
export interface MinimalOutputRow {
  '#': number;
  'Company': string;
  'City, State': string;
  'Description': string; // AI summary
  '6 Months Growth Rate %': string;
  '9 Months Growth Rate %': string;
  '24 Months Growth Rate %': string;
  'Est. Rev': number; // In millions
  'Executive': string; // Formatted with line break
}

// ============================================================================
// AI PROCESSING
// ============================================================================

export interface AIPromptData {
  companyName: string;
  industries: string;
  revenue: string; // Formatted like "$11.59M"
  employees: string;
  location: string; // "City, State"
  specialties: string;
  fullDescription: string;
}

export interface AISummaryResult {
  summary: string;
  quality: 'excellent' | 'good' | 'needs_review';
  retries: number;
  error?: string;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  missingColumns: string[];
}

export interface QualityCheckResult {
  passed: boolean;
  issues: string[];
  length: number;
  hasCompanyName: boolean;
  hasGenericPhrases: boolean;
  hasIndustryTerms: boolean;
  isProperlyFormatted: boolean;
  isTruncated: boolean;
}

// ============================================================================
// PROCESSING STATUS
// ============================================================================

export type ProcessingStage =
  | 'idle'
  | 'parsing'
  | 'ai_processing'
  | 'validation'
  | 'generating_excel'
  | 'generating_pdf'
  | 'complete'
  | 'error';

export interface ProcessingStatus {
  stage: ProcessingStage;
  currentCompany?: string;
  processed: number;
  total: number;
  timeElapsed: number;
  timeRemaining?: number;
  error?: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExcelExportData {
  config: OutputConfig;
  sourceData: SourcescubRawRow[];
  processedData: ProcessedCompany[];
}

export interface PDFExportData {
  config: OutputConfig;
  processedData: ProcessedCompany[];
}
