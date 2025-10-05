# Target List Generator

Transform Sourcescrub CSV exports into executive-ready M&A target lists with AI-powered summaries.

## Overview

This application converts raw Sourcescrub data (50-300 companies with 54-61 data fields) into polished Excel and PDF reports suitable for M&A pipeline review presentations.

**Key Features:**
- **Accuracy-First AI Summaries**: Each company gets an individually-crafted 120-150 character summary using Claude AI
- **Two-Tab Excel Export**: Preserves source data while delivering formatted target list
- **Professional PDF Export**: Print-ready documents with automatic pagination
- **Quality Validation**: Automated quality checks ensure >95% of summaries are executive-ready
- **Dual Output Formats**: Detailed (16 columns) or Minimal (9 columns with growth metrics)

**Performance:**
- Processing time: 6-8 minutes for 200 companies (accuracy-optimized)
- User time: ~2 minutes (configuration + review)
- Cost: ~$0.01 per company (~$2 per 200-company list)

## Business Context

**Current Workflow:**
1. Export raw data from Sourcescrub
2. Manually review 600-800 character company descriptions
3. Copy-paste into ChatGPT for summarization
4. Format in Excel with title blocks and formulas
5. Create PDF for presentation

**Time:** 3-4 hours per list

**New Workflow:**
1. Upload Sourcescrub CSV
2. Configure report title and format
3. Click "Start Processing"
4. Download Excel and PDF

**Time:** 2 minutes user time, 6-8 minutes processing

## Project Structure

```
target-list-generator/
├── app/
│   ├── actions.ts           # Server actions for processing
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main application UI
│   └── globals.css          # Global styles
├── components/
│   ├── ConfigPanel.tsx      # Format selection & title inputs
│   ├── ProcessingView.tsx   # Multi-stage progress indicator
│   ├── ResultsView.tsx      # Preview & download buttons
│   └── UploadZone.tsx       # Drag-drop file upload
├── lib/
│   ├── types.ts             # TypeScript type definitions
│   ├── csv-parser.ts        # Sourcescrub CSV parsing
│   ├── claude.ts            # Claude API integration
│   ├── quality-validator.ts # AI summary quality checks
│   ├── excel-generator.ts   # ExcelJS two-tab generation
│   └── pdf-generator.ts     # jsPDF export
├── .env.local               # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

1. **Navigate to project directory:**
   ```bash
   cd "C:\Users\IT\OneDrive\Desktop\Claude Projects\Target List Builder\target-list-generator"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   NEXT_PUBLIC_MAX_FILE_SIZE=5242880
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:3000
   ```

## Usage Guide

### Step 1: Configure Output

1. **Select Format:**
   - **Detailed (16 columns)**: Full company details including website, domain, executive info
   - **Minimal (9 columns)**: Essential data with growth metrics (6mo, 9mo, 24mo)

2. **Enter Report Title:**
   - Example: "Critical Power", "HVAC Commissioning", "UTSS Target Universe"
   - Appears in title block of Excel/PDF

3. **Enter Company Name (Optional):**
   - Your company name (e.g., "United Technical Support Service, Inc.")
   - Appears in title block if provided

### Step 2: Upload File

- Drag and drop Sourcescrub CSV/XLSX export
- Or click "Browse Files" to select
- Maximum file size: 5MB
- Supported formats: `.csv`, `.xlsx`, `.xls`

**Expected CSV Format:**
- Row 1: Search URL (automatically skipped)
- Row 2: Blank (automatically skipped)
- Row 3: Column headers
- Row 4+: Company data

### Step 3: Processing

The app will automatically:
1. **Parse Source Data** (~5 seconds)
   - Validates file format
   - Checks for required columns
   - Loads company data

2. **AI Analysis** (6-8 minutes for 200 companies)
   - Each company analyzed individually
   - AI generates 120-150 char summary
   - Quality validation with automatic retry
   - Progress indicator shows current company

3. **Quality Validation** (~15 seconds)
   - Checks summary length (100-180 chars)
   - Verifies company name included
   - Detects generic marketing phrases
   - Flags summaries needing review

4. **Export Generation** (~20 seconds)
   - Creates two-tab Excel workbook
   - Formats title block and headers
   - Applies print settings (landscape, fit to width)

### Step 4: Download & Review

**Results Page Shows:**
- Total companies processed
- Processing time
- Quality breakdown (Excellent / Good / Needs Review)
- Preview table (first 10 companies)
- Download buttons for Excel and PDF

**Excel File (2 Tabs):**
- Tab 1 "Source Data": Exact copy of uploaded CSV for reference
- Tab 2 "Target List": Formatted output with title block

**PDF File:**
- Title page with report info
- Data table with repeated headers
- Auto page breaks
- Page numbers

**Quality Stats:**
- Excellent: Passes all quality checks, ideal length (120-150 chars)
- Good: Passes critical checks, acceptable quality
- Needs Review: May require manual refinement (<5% typically)

### Step 5: Manual Refinement (Optional)

For companies flagged "Needs Review":
1. Open Excel file, Tab 2
2. Review AI summary in Description column
3. Edit if needed (keep 120-150 chars)
4. Save and use for presentation

## Input Data Requirements

### Required Columns (from Sourcescrub):
- Company Name
- City
- State
- Website
- Description
- Specialties
- Employee Count
- Latest Estimated Revenue ($)
- Executive Title
- Executive First Name
- Executive Last Name
- Industries

### Optional Columns (for Minimal format):
- 6 Months Growth Rate %
- 9 Months Growth Rate %
- 24 Months Growth Rate %

## Output Specifications

### Detailed Format (16 Columns)
| Column | Source | Transformation |
|--------|--------|----------------|
| # | Auto | Sequential numbering |
| Company | Company Name | Direct copy |
| City | City | Direct copy |
| State | State | Direct copy |
| City, State | City + State | Formatted: "City, State" |
| Website | Website | Direct copy |
| Domain | Website | Extract domain (remove https://, www.) |
| Description | Description | AI-summarized to 120-150 chars |
| Count | Employee Count | Direct copy |
| Est. Rev | Latest Estimated Revenue ($) | Divide by 1,000,000 |
| Executive Title | Executive Title | Direct copy |
| Executive Name | First + Last | Concatenated |
| Executive First Name | Executive First Name | Direct copy |
| Executive Last Name | Executive Last Name | Direct copy |
| Executive | First + Last + Title | "Name\nTitle" (line break) |
| Latest Estimated Revenue ($) | Latest Estimated Revenue ($) | Optional, can be blank |

### Minimal Format (9 Columns)
| Column | Source | Transformation |
|--------|--------|----------------|
| # | Auto | Sequential numbering |
| Company | Company Name | Direct copy |
| City, State | City + State | Formatted: "City, State" |
| Description | Description | AI-summarized to 120-150 chars |
| 6 Months Growth Rate % | 6 Months Growth Rate % | Direct copy |
| 9 Months Growth Rate % | 9 Months Growth Rate % | Direct copy |
| 24 Months Growth Rate % | 24 Months Growth Rate % | Direct copy |
| Est. Rev | Latest Estimated Revenue ($) | Divide by 1,000,000 |
| Executive | First + Last + Title | "Name\nTitle" (line break) |

### Title Block Format
```
Row 1: [Empty]
Row 2: [Report Title]                    [Company Name (optional)]
Row 3: Acquisition Target Universe (Sorted by Est. Revenue)     ($ in millions)
Row 4: [Empty]
Row 5:                                   Est. Employee
Row 6: [Column Headers]
Row 7+: [Data Rows]
```

## AI Summarization Details

### Prompt Strategy (Accuracy-First)

**Individual Processing:**
- Each company gets a dedicated API call (not batched)
- Detailed 400-500 token prompts with full context
- Temperature: 0.3 (factual, consistent output)
- Model: Claude 3.5 Sonnet

**Quality Requirements:**
1. Length: 120-150 characters (not words)
2. Must include full company name
3. No generic phrases ("leading provider", "innovative solutions")
4. Use industry-specific terminology from Specialties
5. Format: "[Company Name] provides/specializes in [offering] for [market]."
6. No truncation ("...", "etc.")

**Example Transformation:**

**Input (700 chars):**
> "Control Solutions, Inc. specializes in automated control systems solutions, focusing on optimizing system performance and enhancing energy efficiency across various sectors. Their primary offerings include commissioning and retro-commissioning of building automation systems, enhancing indoor air quality, and optimizing existing systems. The company serves a diverse clientele, including large and small businesses, providing tailored solutions to enhance operational efficiency and safety. Use cases encompass optimizing air conditioning, heating, and ventilation systems, reducing energy consumption and reducing operational costs. Revenue streams include service fees for commissioning, maintenance, and ongoing support services."

**Output (130 chars):**
> "Control Solutions, Incorporated specializes in commissioning including energy optimization for commercial and healthcare facilities."

### Retry Logic

If quality validation fails:
1. Generate refinement prompt explaining specific issues
2. Send follow-up message to Claude
3. Re-validate refined summary
4. Repeat up to 3 times total
5. Flag for manual review if still failing

### Rate Limiting

- 500ms delay between companies
- Automatic retry on 429 (rate limit) errors
- 5-second backoff on 529 (overloaded) errors
- Max 3 retries per company

## Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account ([sign up](https://vercel.com/signup))

### Steps

1. **Initialize Git repository:**
   ```bash
   cd "C:\Users\IT\OneDrive\Desktop\Claude Projects\Target List Builder\target-list-generator"
   git init
   git add .
   git commit -m "Initial commit: Target List Generator"
   ```

2. **Create GitHub repository:**
   - Go to https://github.com/new
   - Create new repository (public or private)
   - Follow instructions to push existing repository:
   ```bash
   git remote add origin https://github.com/yourusername/target-list-generator.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

4. **Set environment variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add `ANTHROPIC_API_KEY` with your API key
   - Add `NEXT_PUBLIC_MAX_FILE_SIZE` = `5242880`

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Production Considerations

**API Route Timeout:**
- Default Vercel timeout: 10 seconds (Hobby plan)
- Processing takes 6-8 minutes for 200 companies
- **Solution Options:**
  1. Upgrade to Pro plan (300 second timeout)
  2. Implement chunked processing with progress polling
  3. Use background jobs with status endpoint

**Recommended:** For production use with >100 companies, upgrade to Vercel Pro ($20/mo) for extended function execution time.

**Alternative:** Deploy to a VPS or cloud VM with no timeout restrictions.

## Troubleshooting

### Common Issues

**"Missing required columns" error:**
- Ensure uploaded file is Sourcescrub export (not manually created CSV)
- Check that file has at least 4 rows (URL, blank, headers, data)
- Verify column names match exactly (case-sensitive)

**"File too large" error:**
- Maximum file size is 5MB
- If your export is larger, split into multiple files
- Or increase `NEXT_PUBLIC_MAX_FILE_SIZE` in `.env.local`

**Processing fails during AI analysis:**
- Check that `ANTHROPIC_API_KEY` is set correctly
- Verify API key has sufficient credits
- Check Anthropic API status: https://status.anthropic.com/

**Excel file won't open:**
- Ensure you have Microsoft Excel 2010+ or compatible software
- Try opening in Google Sheets or LibreOffice Calc
- Check that download completed fully (file size > 0)

**PDF looks incorrect:**
- Some summaries may be too long for allocated space
- Manually edit in Excel before generating PDF
- Or use Excel file directly for presentations

**Slow processing:**
- Normal: 6-8 minutes for 200 companies
- Faster: 3-4 minutes for 100 companies
- Slower: 12-15 minutes for 300 companies
- This is intentional for accuracy (not a bug)

## Cost Estimation

### Anthropic API Costs (Claude 3.5 Sonnet)

**Per Company:**
- Input tokens: ~500 (prompt + context)
- Output tokens: ~100 (summary + validation)
- Cost per company: ~$0.01

**Per List:**
- 50 companies: ~$0.50
- 100 companies: ~$1.00
- 200 companies: ~$2.00
- 300 companies: ~$3.00

**Monthly (Estimated):**
- 5 lists/week × 200 companies = 1,000 companies
- 1,000 companies × $0.01 = **$10/month**

**Annual (Estimated):**
- 50 lists/year × 200 companies = 10,000 companies
- 10,000 companies × $0.01 = **$100/year**

**Vercel Hosting:**
- Hobby plan: Free (with timeout limitations)
- Pro plan: $20/month (recommended for production)

**Total Cost:**
- Development/testing: ~$10-20/month
- Production use: ~$30-40/month (Vercel Pro + API)

## Technical Details

### Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **AI:** Anthropic Claude API (Claude 3.5 Sonnet)
- **Excel:** ExcelJS (multi-sheet support, formatting)
- **PDF:** jsPDF + jsPDF-AutoTable
- **CSV Parsing:** PapaParse + XLSX

### Key Design Decisions

**Why individual AI calls (not batched)?**
- Higher accuracy per company
- Better quality control with retries
- Easier to track progress
- More reliable error handling

**Why client-side state management (not database)?**
- Single-user tool (no multi-tenancy needed)
- Stateless processing (no data persistence required)
- Simpler architecture
- Faster development

**Why ExcelJS (not other libraries)?**
- True multi-sheet support
- Advanced formatting capabilities
- Line breaks in cells (for executive formatting)
- Print settings (landscape, fit to width)
- No hidden columns issue

## Development

### Run Locally
```bash
npm run dev
```

### Build Production
```bash
npm run build
npm run start
```

### Type Check
```bash
npx tsc --noEmit
```

### Environment Variables
```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-your-key-here
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
```

## License

Proprietary - Internal use only

## Support

For issues or questions:
1. Check Troubleshooting section above
2. Review training files for expected output format
3. Contact development team

---

**Version:** 1.0.0
**Last Updated:** October 2025
**Built with:** Next.js, TypeScript, Claude AI
