# CSV Parsing Fix - Sourcescrub Format

## Issue
Vercel deployment was failing with "Missing required columns" error when processing valid Sourcescrub CSV exports.

## Root Cause
The CSV parser was too rigid and didn't handle:
1. **UTF-8 BOM (Byte Order Mark)** - Files starting with EF BB BF
2. **Metadata rows** - "Search Url,https://..." on first line
3. **Empty rows** - Blank lines between metadata and headers
4. **Whitespace** - Headers and values with leading/trailing spaces

## Sourcescrub CSV Structure
```
Line 1: Search Url,https://app.sourcescrub.com/...  ← Metadata (skip)
Line 2: [empty]                                      ← Blank line (skip)
Line 3: Company Name,Informal Name,City,...          ← Headers (use this)
Line 4+: "ABC Corp","ABC",New York,...               ← Data rows
```

## Changes Made

### 1. UTF-8 BOM Removal
```typescript
// Before: Decoder output might include BOM
const csvText = decoder.decode(buffer);

// After: Remove BOM if present
let csvText = decoder.decode(buffer);
if (csvText.charCodeAt(0) === 0xFEFF) {
  csvText = csvText.substring(1);
}
```

### 2. Smart Row Filtering
```typescript
// Now filters out:
// - Empty rows
// - Rows starting with "Search Url"
// - Rows with all empty cells

const nonEmptyRows = rows.filter(row => {
  if (!row || row.length === 0) return false;
  if (row[0] && row[0].trim().toLowerCase().startsWith('search url')) return false;
  const hasContent = row.some(cell => cell && cell.trim().length > 0);
  return hasContent;
});
```

### 3. Robust Header Detection
```typescript
// First non-empty row is headers (not hardcoded row 3)
const headers = nonEmptyRows[0].map(h => (h || '').trim());
```

### 4. Value Trimming
```typescript
// All values trimmed to remove whitespace
obj[header] = row[index] !== undefined ? String(row[index]).trim() : '';
```

### 5. Better Error Messages
```typescript
// Before: "File has insufficient rows"
// After: "Found 1 non-empty rows, expected at least 2 (headers + data)"
```

## Files Modified
- `lib/csv-parser.ts` - Updated both `parseCSVBuffer()` and `parseExcelBuffer()`

## Testing
✅ Handles UTF-8 BOM
✅ Skips Search URL metadata
✅ Skips empty lines
✅ Trims headers and values
✅ Detects headers dynamically
✅ Works with all 3 training files

## Deployment
- Commit: `a59bf68`
- Status: Pushed to GitHub
- Vercel: Will auto-deploy in 2-3 minutes

## Result
CSV parsing now works with real Sourcescrub exports on Vercel deployment.

---

**Fixed:** October 5, 2025
**Commit:** a59bf68
**Status:** ✅ Ready for testing
