# 🚀 START HERE - Target List Generator

## Welcome! This is your complete M&A target list transformation tool.

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Get Your API Key
Visit: https://console.anthropic.com/
- Sign up or log in
- Go to "API Keys"
- Create new key
- Copy it (starts with `sk-ant-`)

### 2️⃣ Add API Key to Project
Open file: `.env.local`

Change this line:
```
ANTHROPIC_API_KEY=your_api_key_here
```

To:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

Save the file.

### 3️⃣ Run the Application
Open terminal in this folder and run:
```bash
npm run dev
```

Then open in browser: **http://localhost:3000**

---

## 📚 Documentation Files

Choose the guide that fits your needs:

### 🎯 **START_HERE.md** (this file)
The absolute basics to get running in 5 minutes.

### ⚡ **QUICKSTART.md**
Step-by-step first use with a sample file (10 minutes).

### 🔧 **SETUP.md**
Complete setup instructions with troubleshooting (15 minutes).

### 📖 **README.md**
Full documentation: features, architecture, deployment (30 minutes).

### 📊 **PROJECT_SUMMARY.md**
Technical overview: what was built, file structure, specifications.

---

## 🎯 What This Tool Does

**Before:** 3-4 hours of manual work per target list
- Export Sourcescrub data
- Manually summarize 600+ char descriptions
- Copy-paste to ChatGPT
- Format in Excel
- Create PDF

**After:** 2 minutes of your time, 6-8 minutes processing
- Upload CSV
- Click "Start Processing"
- Download Excel + PDF
- Present to executives

---

## 🧪 Test It Right Now

**Smallest test file (75 companies, ~4 min):**
```
C:\Users\IT\OneDrive\Desktop\Claude Projects\Target List Builder\
Target List Builder - Excel Files to Train on\
Sourcescrub - UTSS Target Universe 2025.08.20 211158819.csv
```

**Steps:**
1. Make sure dev server is running (`npm run dev`)
2. Open http://localhost:3000
3. Select format: **Detailed (16 columns)**
4. Enter title: **Test UTSS**
5. Upload the file above
6. Click "Start Processing"
7. Wait ~4 minutes
8. Download Excel and PDF

**Compare your output with:**
```
Sourcescrub - UTSS Target Universe 2025.08.20 211158819 (MZ).xlsx
```

Should match: title block, column headers, AI summaries (~120-150 chars), revenue format, executive line breaks.

---

## ✅ Success Checklist

You'll know it's working when:
- [ ] Application loads at http://localhost:3000
- [ ] No errors in terminal
- [ ] Can drag-drop or browse for CSV file
- [ ] Processing starts and shows progress
- [ ] AI summaries generate for each company
- [ ] Excel file downloads with 2 tabs
- [ ] Tab 1 = exact CSV copy
- [ ] Tab 2 = formatted target list
- [ ] PDF downloads and opens correctly

---

## 🐛 Something Not Working?

### Common fixes:

**Port 3000 in use?**
```bash
npx kill-port 3000
npm run dev
```

**API key error?**
- Check `.env.local` has correct key
- Restart dev server after changing file

**Module errors?**
```bash
npm install
```

**Still stuck?**
See **SETUP.md** for detailed troubleshooting.

---

## 💰 What Will This Cost?

**Anthropic API:**
- $0.01 per company
- ~$2 for 200-company list
- ~$10-20/month for typical use

**First $5 in credits are free!** Perfect for testing.

**Hosting (optional):**
- Local use: FREE (just run `npm run dev`)
- Vercel Pro: $20/month (for team deployment)

---

## 🎨 What You'll Get

### Excel File (2 Tabs)
**Tab 1 - Source Data**
- Exact copy of uploaded CSV
- All original columns
- For reference/manual editing

**Tab 2 - Target List**
- Professional title block
- 16 or 9 columns (your choice)
- AI-summarized descriptions (120-150 chars)
- Revenue in millions
- Executive info with line breaks
- Ready to present

### PDF File
- Title page with report info
- Formatted data table
- Auto page breaks
- Page numbers
- Print-ready

---

## 🚀 Ready to Process Real Lists?

**For your first real use:**

1. Export from Sourcescrub
2. Upload CSV to application
3. Choose format:
   - **Detailed:** Full analysis (16 columns)
   - **Minimal:** Growth focus (9 columns)
4. Enter report title (e.g., "HVAC Commissioning")
5. Click "Start Processing"
6. Get coffee ☕ (5-8 minutes)
7. Download Excel + PDF
8. Present to executives 📊

**Pro tip:** Keep lists under 200 companies for fastest processing. Split large universes by geography or sub-sector.

---

## 📞 Need Help?

1. **Quick answer:** See QUICKSTART.md
2. **Setup problem:** See SETUP.md
3. **Deep dive:** See README.md
4. **Technical details:** See PROJECT_SUMMARY.md

---

## 🎉 You're All Set!

Your application is ready to transform Sourcescrub exports into executive-ready target lists.

**Next step:** Add your API key and run `npm run dev`

**Happy processing! 🚀**

---

**Location:** `C:\Users\IT\OneDrive\Desktop\Claude Projects\Target List Builder\target-list-generator\`

**Training Files:** `../Target List Builder - Excel Files to Train on/`

**Version:** 1.0.0
