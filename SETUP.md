# Complete Setup Instructions

## ✅ What's Already Done

The application is fully built and dependencies are installed. You just need to:
1. Add your Anthropic API key
2. Run the dev server
3. Test with your training files

## 🔑 Step 1: Get Your Anthropic API Key

1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Navigate to: API Keys
4. Click "Create Key"
5. Copy your key (starts with `sk-ant-`)

**Important:** Keep this key secure. Don't share it or commit it to version control.

## ⚙️ Step 2: Configure Your API Key

Open the file: `.env.local`

Replace:
```
ANTHROPIC_API_KEY=your_api_key_here
```

With:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

Save the file.

## 🚀 Step 3: Start the Application

Open a terminal in the project folder and run:

```bash
npm run dev
```

You should see:
```
 ▲ Next.js 14.x.x
 - Local:        http://localhost:3000
 - Ready in XXXms
```

Open your browser to: **http://localhost:3000**

## 🧪 Step 4: Test with Training Files

### Quick Test (Small File)
1. In the app, select format: **Detailed (16 columns)**
2. Enter report title: **Test HVAC**
3. Upload file: `Sourcescrub - UTSS Target Universe 2025.08.20 211158819.csv` (75 companies)
4. Click "Start Processing"
5. Wait ~4 minutes
6. Download Excel and verify output

### Full Test (Larger File)
1. Select format: **Detailed (16 columns)**
2. Enter report title: **HVAC Commissioning & Testing Universe**
3. Upload file: `Sourcescrub - HVACR Commissioning & Testing Universe 2025.09.11 191959719.csv` (208 companies)
4. Click "Start Processing"
5. Wait ~8 minutes
6. Download Excel and PDF

### Compare with Expected Output
Open both files:
- Your generated: `HVAC_Commissioning___Testing_Universe_YYYYMMDD.xlsx`
- Expected output: `HVACR Commissioning Testing Universe 2025.09.11 (MZ).xlsx`

Compare Tab 2 "Target List":
- ✅ Title block matches
- ✅ Column headers match
- ✅ AI summaries are ~120-150 characters
- ✅ Revenue is in millions (6 decimal places)
- ✅ Executive has line break (Name\nTitle)
- ✅ Domain extracted from website
- ✅ No hidden columns

## 📊 What to Check in Output

### Excel File - Tab 1 "Source Data"
- Should be exact copy of uploaded CSV
- All original columns preserved
- No formatting, just raw data

### Excel File - Tab 2 "Target List"
**Title Block:**
- Row 2: Report title (merged cells C2:K2)
- Row 3: "Acquisition Target Universe (Sorted by Est. Revenue)" + "($ in millions)"
- Row 5: "Est. Employee" label

**Data Quality:**
- Sequential numbering in # column
- AI summaries are concise and specific (not generic)
- Revenue is divided by 1,000,000 (e.g., 11585319 → 11.585319)
- Executive column has line break between name and title
- Domain is clean (no https://, no www.)

### PDF File
- Title page with report info
- Data table starts on page 2
- Headers repeat on each page
- Page numbers at bottom
- All data fits within page width

## 🐛 Common Setup Issues

### Issue: "Module not found" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "API key not configured" error
**Solution:**
- Check `.env.local` file exists
- Verify key starts with `sk-ant-`
- Restart dev server after changing `.env.local`

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Issue: TypeScript errors
**Solution:**
```bash
npx tsc --noEmit
```
Fix any reported errors before running.

### Issue: Excel file downloads but won't open
**Solution:**
- Check browser's download folder
- Try opening in Google Sheets or LibreOffice
- Verify download completed fully (check file size)

## 🎯 Success Criteria

You'll know it's working when:
- ✅ Application loads without errors
- ✅ Can upload CSV file
- ✅ Processing completes without crashes
- ✅ Excel file downloads successfully
- ✅ Excel has 2 tabs (Source Data + Target List)
- ✅ Tab 2 has formatted title block
- ✅ AI summaries are concise and specific
- ✅ 90%+ summaries are rated "excellent" or "good"
- ✅ PDF downloads and opens correctly

## 📈 Next Steps After Testing

### For Development Use
Just run `npm run dev` whenever you need to process a list.

### For Production Deployment
See README.md section "Deployment (Vercel)" for full instructions.

**Quick version:**
1. Create GitHub repository
2. Push code to GitHub
3. Import to Vercel
4. Add `ANTHROPIC_API_KEY` to Vercel environment variables
5. Deploy (automatic)

### For Team Use
- Deploy to Vercel with your API key
- Share URL with team members
- Monitor API usage in Anthropic console
- Set up budget alerts if needed

## 💰 Cost Management

### Monitor Usage
- Anthropic Console: https://console.anthropic.com/
- Check "Usage" section for current month
- Set up budget alerts

### Estimate Costs
- Small list (50 companies): ~$0.50
- Medium list (150 companies): ~$1.50
- Large list (300 companies): ~$3.00

### Budget Guidelines
- Light use (5 lists/month): ~$10/month
- Medium use (20 lists/month): ~$40/month
- Heavy use (50 lists/month): ~$100/month

## 🔒 Security Best Practices

1. **Never commit `.env.local` to version control** (already in .gitignore)
2. **Don't share your API key** with anyone
3. **Rotate keys periodically** (every 3-6 months)
4. **Set up usage limits** in Anthropic console
5. **Monitor for unusual activity** (check console weekly)

## 📞 Getting Help

### Resources
- Full documentation: README.md
- Quick start: QUICKSTART.md
- This setup guide: SETUP.md

### Troubleshooting
1. Check terminal for error messages
2. Review browser console (F12)
3. Verify API key is correct
4. Restart dev server
5. Clear browser cache

### Still Stuck?
1. Check that all files are in correct locations
2. Verify Node.js version: `node --version` (should be 18+)
3. Verify npm version: `npm --version` (should be 9+)
4. Try deleting `node_modules` and reinstalling

---

## 🎉 You're Ready!

Run `npm run dev` and start transforming your Sourcescrub exports into executive-ready target lists!

**Happy processing! 🚀**
