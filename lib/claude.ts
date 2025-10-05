/**
 * Claude API Client for AI Summary Generation
 *
 * Accuracy-first approach:
 * - Individual company processing (not batched)
 * - Detailed prompts (400-500 tokens per company)
 * - Quality validation after each generation
 * - Automatic retry with refinement on quality failures
 * - Max 3 attempts per company
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  AIPromptData,
  AISummaryResult,
  ProcessedCompany,
  SourcescubRawRow,
} from './types';
import {
  validateSummaryQuality,
  generateRefinementPrompt,
  rateSummaryQuality,
} from './quality-validator';
import {
  formatRevenueMillions,
  formatCityState,
} from './csv-parser';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Configuration
const MAX_RETRIES = 3;
const MODEL = 'claude-3-5-sonnet-20241022'; // Latest Claude model

/**
 * Generate AI summary for a single company with quality validation
 */
export async function generateCompanySummary(
  company: SourcescubRawRow,
  retryCount: number = 0
): Promise<AISummaryResult> {
  try {
    // Prepare prompt data
    const promptData: AIPromptData = {
      companyName: company['Company Name'],
      industries: company['Industries'] || 'Not specified',
      revenue: formatRevenue(company['Latest Estimated Revenue ($)']),
      employees: company['Employee Count'] || 'Not specified',
      location: formatCityState(company['City'], company['State']),
      specialties: company['Specialties'] || '',
      fullDescription: company['Description'] || '',
    };

    // Generate prompt
    const prompt = retryCount === 0
      ? buildInitialPrompt(promptData)
      : buildRetryPrompt(promptData, retryCount);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      temperature: 0.3, // Lower temperature for more consistent, factual output
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract summary from response
    const summary = extractSummary(message.content);

    // Validate quality
    const qualityCheck = validateSummaryQuality(
      summary,
      company['Company Name'],
      company['Specialties']
    );

    // If quality check fails and we have retries left, retry with refinement
    if (!qualityCheck.passed && retryCount < MAX_RETRIES) {
      console.log(`Quality check failed for ${company['Company Name']} (attempt ${retryCount + 1}). Retrying...`);

      // Wait a bit before retry to avoid rate limiting
      await sleep(1000);

      // Generate refinement prompt
      const refinementPrompt = generateRefinementPrompt(
        summary,
        qualityCheck,
        company['Company Name'],
        company['Specialties']
      );

      // Retry with refinement
      const refinementMessage = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 300,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: buildInitialPrompt(promptData),
          },
          {
            role: 'assistant',
            content: summary,
          },
          {
            role: 'user',
            content: refinementPrompt,
          },
        ],
      });

      const refinedSummary = extractSummary(refinementMessage.content);

      // Re-validate
      const refinedQualityCheck = validateSummaryQuality(
        refinedSummary,
        company['Company Name'],
        company['Specialties']
      );

      // If still failing and have retries, recursively retry
      if (!refinedQualityCheck.passed && retryCount + 1 < MAX_RETRIES) {
        return generateCompanySummary(company, retryCount + 1);
      }

      // Return refined result
      const quality = rateSummaryQuality(refinedQualityCheck);

      return {
        summary: refinedSummary,
        quality,
        retries: retryCount + 1,
      };
    }

    // Quality check passed or max retries reached
    const quality = rateSummaryQuality(qualityCheck);

    return {
      summary,
      quality,
      retries: retryCount,
    };
  } catch (error: any) {
    // Handle API errors with retry logic
    if (error.status === 429 && retryCount < MAX_RETRIES) {
      // Rate limit - wait and retry
      console.log(`Rate limited. Waiting 5s before retry...`);
      await sleep(5000);
      return generateCompanySummary(company, retryCount + 1);
    }

    if (error.status === 529 && retryCount < MAX_RETRIES) {
      // Overloaded - wait and retry
      console.log(`API overloaded. Waiting 10s before retry...`);
      await sleep(10000);
      return generateCompanySummary(company, retryCount + 1);
    }

    // Return error result
    return {
      summary: company['Description'].substring(0, 150) + '...', // Fallback to truncated description
      quality: 'needs_review',
      retries: retryCount,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Build initial detailed prompt for summary generation
 * Enhanced for 200-250 character executive-ready descriptions
 */
function buildInitialPrompt(data: AIPromptData): string {
  return `You are creating executive-ready company summaries for M&A target analysis presentations.

COMPANY DATA:
Name: ${data.companyName}
Industry: ${data.industries}
Revenue: ${data.revenue}
Employees: ${data.employees}
Location: ${data.location}
Specialties: ${data.specialties}

FULL DESCRIPTION:
${data.fullDescription}

YOUR TASK:
Create a substantive 200-250 character summary that captures:

1. CORE BUSINESS: What they provide/manufacture/specialize in (use specific terminology from specialties)
2. KEY DIFFERENTIATORS: What makes them unique (technical capabilities, proprietary methods, certifications)
3. TARGET MARKETS: Which industries/customer segments they serve (be specific: healthcare, industrial, utilities, etc.)
4. APPLICATIONS: Key use cases or client types when relevant

QUALITY REQUIREMENTS:
- Start with full company name (not abbreviated): "${data.companyName}"
- Use exact terminology from specialties field: ${data.specialties}
- Be specific and factual - avoid generic marketing language
- Format: "[Company Name] provides/specializes in/manufactures [specific offering] for [end markets], including [key capabilities/applications]."
- CRITICAL: Must be 200-250 characters (not words, CHARACTERS!)
- No generic phrases: "leading provider", "innovative solutions", "cutting-edge", "comprehensive", "full-service"
- No truncation: no "...", "etc.", "and more"
- Include specific market segments when mentioned (healthcare facilities, industrial plants, commercial buildings, etc.)

EXAMPLES OF GOOD SUMMARIES:
- "Control Solutions, Incorporated specializes in commissioning including energy optimization for commercial and healthcare facilities."
- "Engineered Systems & Energy Solutions, Inc. provides building automation systems including energy optimization for healthcare and educational facilities."
- "Environmental Test and Balance Co. specializes in commissioning for industrial and utility facilities."

THINK STEP BY STEP:
1. What is their PRIMARY service/product?
2. What SPECIFIC capabilities differentiate them? (from specialties: ${data.specialties})
3. Which MARKETS do they serve? (from industries: ${data.industries})
4. Any KEY applications or notable client types?

Now write the summary (200-250 characters, substantive and specific):`;
}

/**
 * Build retry prompt with additional emphasis
 */
function buildRetryPrompt(data: AIPromptData, retryCount: number): string {
  const emphasis = retryCount === 1
    ? 'IMPORTANT: Previous attempt failed quality check. Focus on specificity, accuracy, and proper length (200-250 characters).'
    : 'CRITICAL: Multiple attempts failed. Ensure exact character count (200-250 characters), include full company name, and use specific terminology from specialties.';

  return `${emphasis}

${buildInitialPrompt(data)}`;
}

/**
 * Extract summary text from Claude API response
 */
function extractSummary(content: any[]): string {
  // Claude API returns content as array of blocks
  const textBlock = content.find(block => block.type === 'text');

  if (!textBlock || !textBlock.text) {
    throw new Error('No text content in API response');
  }

  // Clean up the summary
  let summary = textBlock.text.trim();

  // Remove any markdown formatting
  summary = summary.replace(/\*\*/g, '');
  summary = summary.replace(/\*/g, '');

  // Remove quotes if wrapped
  if (summary.startsWith('"') && summary.endsWith('"')) {
    summary = summary.substring(1, summary.length - 1);
  }

  return summary;
}

/**
 * Format revenue for display in prompt
 */
function formatRevenue(revenueString: string): string {
  if (!revenueString) return 'Not disclosed';

  try {
    const revenue = parseFloat(revenueString.replace(/,/g, ''));
    if (isNaN(revenue)) return 'Not disclosed';

    const millions = revenue / 1000000;

    if (millions >= 1000) {
      return `$${(millions / 1000).toFixed(2)}B`;
    } else if (millions >= 1) {
      return `$${millions.toFixed(2)}M`;
    } else {
      return `$${(revenue / 1000).toFixed(0)}K`;
    }
  } catch {
    return 'Not disclosed';
  }
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process multiple companies with progress tracking
 */
export async function processCompanies(
  companies: SourcescubRawRow[],
  onProgress?: (current: number, total: number, companyName: string) => void
): Promise<ProcessedCompany[]> {
  const results: ProcessedCompany[] = [];

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];

    // Report progress
    if (onProgress) {
      onProgress(i + 1, companies.length, company['Company Name']);
    }

    // Generate AI summary
    const summaryResult = await generateCompanySummary(company);

    // Build processed company object
    const processed: ProcessedCompany = {
      companyName: company['Company Name'],
      informalName: company['Informal Name'] || '',
      city: company['City'] || '',
      state: company['State'] || '',
      cityState: formatCityState(company['City'], company['State']),
      website: company['Website'] || '',
      domain: extractDomain(company['Website']),
      originalDescription: company['Description'] || '',
      aiSummary: summaryResult.summary,
      specialties: company['Specialties'] || '',
      employeeCount: company['Employee Count'] || '',
      latestEstimatedRevenue: parseFloat(company['Latest Estimated Revenue ($)'] || '0'),
      estRevMillions: formatRevenueMillions(company['Latest Estimated Revenue ($)']),
      growthRate6Mo: company['6 Months Growth Rate %'],
      growthRate9Mo: company['9 Months Growth Rate %'],
      growthRate24Mo: company['24 Months Growth Rate %'],
      executiveTitle: company['Executive Title'] || '',
      executiveFirstName: company['Executive First Name'] || '',
      executiveLastName: company['Executive Last Name'] || '',
      executiveName: getExecutiveName(
        company['Executive First Name'],
        company['Executive Last Name']
      ),
      executiveFormatted: formatExecutive(
        company['Executive First Name'],
        company['Executive Last Name'],
        company['Executive Title']
      ),
      industries: company['Industries'] || '',
      summaryQuality: summaryResult.quality,
      summaryRetries: summaryResult.retries,
    };

    results.push(processed);

    // Small delay to avoid rate limiting
    await sleep(500);
  }

  return results;
}

/**
 * Helper: Extract domain from website
 */
function extractDomain(website: string): string {
  if (!website) return '';

  try {
    let domain = website.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    domain = domain.split('/')[0];
    domain = domain.split('?')[0];
    return domain;
  } catch {
    return website;
  }
}

/**
 * Helper: Get executive full name
 */
function getExecutiveName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

/**
 * Helper: Format executive with line break
 */
function formatExecutive(firstName: string, lastName: string, title: string): string {
  const name = [firstName, lastName].filter(Boolean).join(' ');
  if (!name && !title) return '';
  if (!title) return name;
  if (!name) return title;
  return `${name}\n${title}`;
}
