# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies (2 minutes)
```bash
cd "C:\Users\IT\OneDrive\Desktop\Claude Projects\Target List Builder\target-list-generator"
npm install
```

### 2. Add API Key (1 minute)
Edit `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

Get your key: https://console.anthropic.com/

### 3. Run Application (30 seconds)
```bash
npm run dev
```

Open: http://localhost:3000

### 4. Test with Sample File (1 minute)
1. Navigate to training files folder
2. Upload any `.csv` file
3. Enter report title: "Test Report"
4. Click "Start Processing"
5. Wait 1-2 minutes (for small test files)
6. Download Excel and PDF

## First Real Use

### Configuration
- **Format:** Choose Detailed for first run (easier to verify)
- **Report Title:** Use industry name (e.g., "HVAC Commissioning")
- **Company Name:** Optional, leave blank for now

### Upload
- Use Sourcescrub CSV export
- File should have 50-300 companies
- Look for these columns: Company Name, Description, Revenue, Executive info

### Processing
- **Small lists (50 companies):** 3-4 minutes
- **Medium lists (100-150 companies):** 5-6 minutes
- **Large lists (200+ companies):** 7-10 minutes

**Don't refresh the page during processing!**

### Review Results
1. Check quality stats (should be 90%+ excellent/good)
2. Preview first 10 companies
3. Download Excel file
4. Open Excel → Tab 2 "Target List"
5. Verify summaries are accurate
6. Manually edit any "Needs Review" items
7. Use for M&A presentation

## Troubleshooting Quick Fixes

**"Missing required columns"**
→ Make sure you uploaded Sourcescrub export (not a custom CSV)

**"API key not configured"**
→ Check `.env.local` has `ANTHROPIC_API_KEY=sk-ant-...`

**Processing takes forever**
→ Normal for 200+ companies. Get coffee. ☕

**Excel won't download**
→ Check browser's download folder, might be blocked by popup blocker

**Need help?**
→ See full README.md for detailed troubleshooting

---

**Pro Tip:** For fastest results, keep lists under 150 companies. Split large universes into multiple reports by geography or sub-sector.
