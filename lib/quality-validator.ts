/**
 * Quality Validation for AI-Generated Summaries
 *
 * Validates that AI summaries meet executive-ready quality standards:
 * - Length: 180-280 characters (target 200-250)
 * - Contains company name
 * - No generic marketing phrases
 * - Industry-specific terminology
 * - Proper formatting
 * - Not truncated
 */

import { QualityCheckResult } from './types';

// Banned generic phrases that indicate low-quality summaries
const GENERIC_PHRASES = [
  'leading provider',
  'innovative solutions',
  'cutting-edge',
  'state-of-the-art',
  'world-class',
  'industry leader',
  'premier provider',
  'trusted partner',
  'comprehensive solutions',
  'full-service',
  'one-stop shop',
  'best-in-class',
];

// Truncation indicators
const TRUNCATION_INDICATORS = ['...', 'etc.', 'etc', ' and more'];

/**
 * Perform comprehensive quality check on AI summary
 */
export function validateSummaryQuality(
  summary: string,
  companyName: string,
  specialties: string
): QualityCheckResult {
  const issues: string[] = [];

  // 1. Length check (180-280 characters, ideal 200-250)
  const length = summary.length;
  const lengthValid = length >= 180 && length <= 280;

  if (!lengthValid) {
    if (length < 180) {
      issues.push(`Too short (${length} chars, need 180-280)`);
    } else {
      issues.push(`Too long (${length} chars, max 280)`);
    }
  } else if (length < 200 || length > 250) {
    // Not an error, but note it's outside ideal range
    issues.push(`Length acceptable but outside ideal range (${length} chars, ideal 200-250)`);
  }

  // 2. Company name check
  const normalizedSummary = summary.toLowerCase();
  const normalizedCompanyName = companyName.toLowerCase();

  // Extract first part of company name (before comma or "Inc" etc)
  const companyNameCore = companyName
    .split(',')[0]
    .replace(/\s+(inc|incorporated|llc|ltd|corp|corporation)\.?$/i, '')
    .trim()
    .toLowerCase();

  const hasCompanyName =
    normalizedSummary.includes(normalizedCompanyName) ||
    normalizedSummary.includes(companyNameCore);

  if (!hasCompanyName) {
    issues.push('Missing company name');
  }

  // 3. Generic phrases check
  const hasGenericPhrases = GENERIC_PHRASES.some(phrase =>
    normalizedSummary.includes(phrase)
  );

  if (hasGenericPhrases) {
    const foundPhrases = GENERIC_PHRASES.filter(phrase =>
      normalizedSummary.includes(phrase)
    );
    issues.push(`Contains generic phrases: ${foundPhrases.join(', ')}`);
  }

  // 4. Industry terms check (from specialties)
  let hasIndustryTerms = false;

  if (specialties) {
    // Extract key terms from specialties (split by comma, take first few words)
    const specialtyTerms = specialties
      .toLowerCase()
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 3); // Only meaningful terms

    // Check if any specialty terms appear in summary
    hasIndustryTerms = specialtyTerms.some(term =>
      normalizedSummary.includes(term)
    );

    if (!hasIndustryTerms && specialtyTerms.length > 0) {
      issues.push('Lacks industry-specific terminology from specialties');
    }
  }

  // 5. Proper formatting check
  const isProperlyFormatted =
    summary.charAt(0) === summary.charAt(0).toUpperCase() && // Starts with capital
    summary.endsWith('.'); // Ends with period

  if (!isProperlyFormatted) {
    if (summary.charAt(0) !== summary.charAt(0).toUpperCase()) {
      issues.push('Does not start with capital letter');
    }
    if (!summary.endsWith('.')) {
      issues.push('Does not end with period');
    }
  }

  // 6. Truncation check
  const isTruncated = TRUNCATION_INDICATORS.some(indicator =>
    summary.includes(indicator)
  );

  if (isTruncated) {
    issues.push('Appears to be truncated (contains "...", "etc.", or "and more")');
  }

  // 7. Check for empty or very vague content
  const vaguePhrases = [
    'various services',
    'multiple solutions',
    'different products',
    'wide range',
    'diverse offerings',
  ];

  const isVague = vaguePhrases.some(phrase => normalizedSummary.includes(phrase));

  if (isVague) {
    issues.push('Contains vague descriptions instead of specific offerings');
  }

  // Determine if check passed
  const criticalIssues = issues.filter(
    issue =>
      issue.includes('Too short') ||
      issue.includes('Too long') ||
      issue.includes('Missing company name') ||
      issue.includes('truncated')
  );

  const passed = criticalIssues.length === 0;

  return {
    passed,
    issues,
    length,
    hasCompanyName,
    hasGenericPhrases,
    hasIndustryTerms,
    isProperlyFormatted,
    isTruncated,
  };
}

/**
 * Generate refinement prompt based on quality issues
 */
export function generateRefinementPrompt(
  originalSummary: string,
  qualityCheck: QualityCheckResult,
  companyName: string,
  specialties: string
): string {
  const problems: string[] = [];

  if (!qualityCheck.hasCompanyName) {
    problems.push(`- Must include the full company name: "${companyName}"`);
  }

  if (qualityCheck.hasGenericPhrases) {
    problems.push('- Remove generic marketing phrases like "leading provider", "innovative solutions"');
  }

  if (!qualityCheck.hasIndustryTerms && specialties) {
    problems.push(`- Include specific terminology from their specialties: ${specialties.split(',').slice(0, 3).join(', ')}`);
  }

  if (qualityCheck.length < 180) {
    problems.push('- Expand to at least 180 characters with more specific details');
  }

  if (qualityCheck.length > 280) {
    problems.push('- Shorten to maximum 280 characters while keeping key details');
  }

  if (!qualityCheck.isProperlyFormatted) {
    problems.push('- Start with capital letter and end with period');
  }

  if (qualityCheck.isTruncated) {
    problems.push('- Do not truncate; write a complete summary');
  }

  return `The previous summary needs improvement:

"${originalSummary}"

PROBLEMS:
${problems.join('\n')}

Please rewrite the summary addressing all the above issues. Keep it factual, specific, and between 200-250 characters.`;
}

/**
 * Determine summary quality rating
 */
export function rateSummaryQuality(qualityCheck: QualityCheckResult): 'excellent' | 'good' | 'needs_review' {
  // Excellent: passes all checks, ideal length
  if (
    qualityCheck.passed &&
    qualityCheck.length >= 200 &&
    qualityCheck.length <= 250 &&
    qualityCheck.hasCompanyName &&
    !qualityCheck.hasGenericPhrases &&
    qualityCheck.hasIndustryTerms &&
    qualityCheck.isProperlyFormatted &&
    !qualityCheck.isTruncated
  ) {
    return 'excellent';
  }

  // Good: passes critical checks, acceptable length
  if (
    qualityCheck.passed &&
    qualityCheck.hasCompanyName &&
    !qualityCheck.isTruncated
  ) {
    return 'good';
  }

  // Needs review: has critical issues
  return 'needs_review';
}
