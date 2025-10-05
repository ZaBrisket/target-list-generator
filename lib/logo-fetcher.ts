/**
 * Logo Fetcher for Company Branding
 *
 * Three-tier fallback system for fetching company logos:
 * 1. Clearbit Logo API (free, no auth)
 * 2. Google Favicon API
 * 3. Generated initials circle (colored background)
 *
 * Returns base64-encoded images for embedding in PDFs and Excel
 */

export interface LogoResult {
  success: boolean;
  data?: string; // base64 encoded image (data:image/png;base64,...)
  source: 'clearbit' | 'favicon' | 'initials' | 'none';
  error?: string;
}

const FETCH_TIMEOUT = 2000; // 2 seconds per logo
const LOGO_SIZE = 32; // 32x32px for PDF/Excel

/**
 * Fetch company logo with three-tier fallback
 */
export async function fetchCompanyLogo(
  domain: string,
  companyName: string
): Promise<LogoResult> {
  if (!domain || domain.trim() === '') {
    return generateInitialsLogo(companyName);
  }

  // Clean domain (remove www., http://, etc.)
  const cleanDomain = cleanDomainName(domain);

  // Try Clearbit first
  const clearbitResult = await fetchFromClearbit(cleanDomain);
  if (clearbitResult.success) {
    return clearbitResult;
  }

  // Try Google Favicon as fallback
  const faviconResult = await fetchFromGoogleFavicon(cleanDomain);
  if (faviconResult.success) {
    return faviconResult;
  }

  // Generate initials as final fallback
  return generateInitialsLogo(companyName);
}

/**
 * Fetch logo from Clearbit Logo API
 * Free service: https://logo.clearbit.com/{domain}
 */
async function fetchFromClearbit(domain: string): Promise<LogoResult> {
  try {
    const url = `https://logo.clearbit.com/${domain}`;
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT);

    if (!response.ok) {
      return {
        success: false,
        source: 'clearbit',
        error: `HTTP ${response.status}`,
      };
    }

    const blob = await response.blob();
    const base64 = await blobToBase64(blob);

    return {
      success: true,
      data: base64,
      source: 'clearbit',
    };
  } catch (error: any) {
    return {
      success: false,
      source: 'clearbit',
      error: error.message || 'Fetch failed',
    };
  }
}

/**
 * Fetch favicon from Google's favicon service
 * https://www.google.com/s2/favicons?domain={domain}&sz=64
 */
async function fetchFromGoogleFavicon(domain: string): Promise<LogoResult> {
  try {
    const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT);

    if (!response.ok) {
      return {
        success: false,
        source: 'favicon',
        error: `HTTP ${response.status}`,
      };
    }

    const blob = await response.blob();

    // Check if we got an actual image (Google returns default icon if not found)
    if (blob.size < 100) {
      // Too small, likely the default icon
      return {
        success: false,
        source: 'favicon',
        error: 'Default icon returned',
      };
    }

    const base64 = await blobToBase64(blob);

    return {
      success: true,
      data: base64,
      source: 'favicon',
    };
  } catch (error: any) {
    return {
      success: false,
      source: 'favicon',
      error: error.message || 'Fetch failed',
    };
  }
}

/**
 * Generate a logo from company initials
 * Creates a colored circle with initials in the center
 */
function generateInitialsLogo(companyName: string): LogoResult {
  try {
    const initials = getCompanyInitials(companyName);
    const color = generateColorFromName(companyName);

    // Create SVG
    const svg = `
      <svg width="${LOGO_SIZE}" height="${LOGO_SIZE}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${LOGO_SIZE / 2}" cy="${LOGO_SIZE / 2}" r="${LOGO_SIZE / 2}" fill="${color}"/>
        <text
          x="50%"
          y="50%"
          text-anchor="middle"
          dy=".35em"
          font-family="Arial, sans-serif"
          font-size="${LOGO_SIZE / 2.5}"
          font-weight="bold"
          fill="white"
        >${initials}</text>
      </svg>
    `;

    // Convert SVG to base64
    const base64 = `data:image/svg+xml;base64,${btoa(svg)}`;

    return {
      success: true,
      data: base64,
      source: 'initials',
    };
  } catch (error: any) {
    return {
      success: false,
      source: 'none',
      error: error.message || 'Failed to generate initials',
    };
  }
}

/**
 * Extract initials from company name
 * Examples:
 * - "Apple Inc." -> "AI"
 * - "Microsoft Corporation" -> "MC"
 * - "ABC" -> "AB"
 */
function getCompanyInitials(companyName: string): string {
  if (!companyName || companyName.trim() === '') {
    return '??';
  }

  // Remove common suffixes
  const cleaned = companyName
    .replace(/,?\s+(Inc|LLC|Ltd|Corp|Corporation|Company|Co)\b\.?/gi, '')
    .trim();

  // Split into words
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);

  if (words.length === 0) {
    return companyName.substring(0, 2).toUpperCase();
  }

  if (words.length === 1) {
    // Single word - take first two letters
    return words[0].substring(0, 2).toUpperCase();
  }

  // Multiple words - take first letter of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Generate a consistent color from company name
 * Same name always generates same color
 */
function generateColorFromName(name: string): string {
  // Hash the name to get a number
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL color (using hue from hash)
  // Saturation: 65%, Lightness: 50% for good readability
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

/**
 * Clean domain name (remove protocol, www, etc.)
 */
function cleanDomainName(domain: string): string {
  return domain
    .replace(/^https?:\/\//, '') // Remove protocol
    .replace(/^www\./, '') // Remove www.
    .split('/')[0] // Take only domain part
    .split('?')[0] // Remove query string
    .toLowerCase()
    .trim();
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TargetListGenerator/1.0',
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Convert Blob to base64 data URL
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Batch fetch logos with concurrency limit
 * Prevents overwhelming the API with too many simultaneous requests
 */
export async function batchFetchLogos(
  companies: Array<{ domain: string; companyName: string }>,
  concurrency: number = 5,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, LogoResult>> {
  const results = new Map<string, LogoResult>();
  const queue = [...companies];
  let completed = 0;

  // Process in batches with concurrency limit
  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency);

    const batchResults = await Promise.all(
      batch.map(async (company) => {
        const result = await fetchCompanyLogo(company.domain, company.companyName);
        return { key: company.companyName, result };
      })
    );

    // Store results
    batchResults.forEach(({ key, result }) => {
      results.set(key, result);
      completed++;
      if (onProgress) {
        onProgress(completed, companies.length);
      }
    });

    // Small delay between batches to be respectful to APIs
    if (queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
