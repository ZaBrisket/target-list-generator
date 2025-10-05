# Vercel Deployment Instructions

## Quick Deployment Guide

### Prerequisites
- GitHub account
- Vercel account (free to start, Pro recommended for production)
- Your Anthropic API key

---

## Step 1: Create GitHub Repository

### Option A: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop** (if not installed)
   - Visit: https://desktop.github.com/
   - Install and sign in with your GitHub account

2. **Add Project to GitHub Desktop**
   - Open GitHub Desktop
   - Click: `File` → `Add Local Repository`
   - Browse to: `C:\Users\IT\OneDrive\Desktop\Claude Projects\Target List Builder\target-list-generator`
   - Click: `Add Repository`

3. **Create Repository on GitHub**
   - Click: `Publish repository` button
   - Repository name: `target-list-generator`
   - Description: `M&A target list generator with AI-powered summaries`
   - ⚠️ **UNCHECK** "Keep this code private" if you want public, or keep checked for private
   - Click: `Publish Repository`

### Option B: Using Command Line

1. **Initialize Git** (if not already done)
   ```bash
   cd "C:\Users\IT\OneDrive\Desktop\Claude Projects\Target List Builder\target-list-generator"
   git init
   git add .
   git commit -m "Initial commit: Target List Generator"
   ```

2. **Create GitHub Repository**
   - Go to: https://github.com/new
   - Repository name: `target-list-generator`
   - Description: `M&A target list generator with AI-powered summaries`
   - Choose: Public or Private
   - **DO NOT** initialize with README (we already have one)
   - Click: `Create repository`

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/target-list-generator.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy to Vercel

### 2.1: Sign Up for Vercel

1. **Go to Vercel**
   - Visit: https://vercel.com/signup
   - Click: `Continue with GitHub`
   - Authorize Vercel to access your GitHub account

### 2.2: Import Project

1. **Import Repository**
   - On Vercel dashboard, click: `Add New...` → `Project`
   - Find your repository: `target-list-generator`
   - Click: `Import`

2. **Configure Project**
   - **Project Name**: `target-list-generator` (or choose your own)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (leave default)
   - **Output Directory**: `.next` (leave default)
   - **Install Command**: `npm install` (leave default)

### 2.3: Add Environment Variables

**CRITICAL:** Before deploying, add your API key

1. **Expand "Environment Variables" section**

2. **Add Variables:**

   **Variable 1:**
   - Key: `ANTHROPIC_API_KEY`
   - Value: `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`
   - Environment: `Production`, `Preview`, `Development` (check all three)

   **Variable 2:**
   - Key: `NEXT_PUBLIC_MAX_FILE_SIZE`
   - Value: `5242880`
   - Environment: `Production`, `Preview`, `Development` (check all three)

3. **Click: `Add`** for each variable

### 2.4: Deploy

1. **Click: `Deploy`**

2. **Wait for deployment** (usually 2-3 minutes)
   - You'll see build logs
   - Watch for any errors

3. **When complete**, you'll see:
   - ✅ Deployment successful
   - 🎉 Confetti animation
   - Your live URL: `https://target-list-generator-xxx.vercel.app`

---

## Step 3: Test Your Deployment

1. **Click on the deployment URL** or **Visit Domain** button

2. **Test the application:**
   - Upload a small CSV file
   - Configure format and title
   - Click "Start Processing"

3. **⚠️ IMPORTANT: Timeout Issue**

   On Vercel **Hobby (Free) Plan**:
   - Function timeout: **10 seconds**
   - Your processing takes **6-8 minutes**
   - **This will timeout and fail!**

   **Solutions:**

   **Option A: Upgrade to Vercel Pro** (Recommended)
   - Cost: $20/month
   - Function timeout: **5 minutes** (300 seconds)
   - Still might timeout for large lists (200+ companies)
   - Go to: Dashboard → Settings → Upgrade to Pro

   **Option B: Keep Local Deployment**
   - Use Vercel for preview/demo only
   - Run production processing locally with `npm run dev`
   - No timeouts, no extra cost

   **Option C: Use Alternative Hosting**
   - Deploy to AWS/Google Cloud/DigitalOcean
   - No timeout restrictions
   - More complex setup

---

## Step 4: Configure Custom Domain (Optional)

### If you have a custom domain:

1. **Go to Vercel Dashboard**
   - Click on your project
   - Go to: `Settings` → `Domains`

2. **Add Domain**
   - Enter your domain: `targetlists.yourcompany.com`
   - Click: `Add`

3. **Configure DNS**
   - Follow Vercel's instructions to add DNS records
   - Usually: Add CNAME record pointing to Vercel

4. **Wait for SSL**
   - Vercel automatically provisions SSL certificate
   - Usually takes 5-10 minutes

---

## Step 5: Recommended Settings

### 5.1: Enable Continuous Deployment

**Already enabled by default!**
- Every push to `main` branch auto-deploys
- Preview deployments for pull requests

### 5.2: Configure Vercel Pro (If Upgraded)

1. **Go to Project Settings**
   - Settings → Functions

2. **Set Function Max Duration**
   - Region: All regions
   - Max Duration: 300 seconds (5 minutes)

3. **Set Memory**
   - Memory: 1024 MB (recommended for Excel/PDF generation)

### 5.3: Set Up Monitoring

1. **Go to Analytics** (Pro plan feature)
   - Monitor page views
   - Track performance
   - View error logs

2. **Set Up Alerts**
   - Settings → Integrations
   - Add Slack/Email notifications for deployment failures

---

## Important Notes

### ⚠️ Timeout Limitations

**Hobby Plan (Free):**
```
✗ Cannot process lists (10s timeout)
✓ Good for: Demo, testing UI
✓ Cost: $0
```

**Pro Plan ($20/mo):**
```
✓ Can process small lists (50-100 companies)
? May timeout on large lists (200+ companies)
✓ Cost: $20/mo + API usage
```

**Local Deployment:**
```
✓ No timeout limits
✓ Process any size list
✓ Cost: $0 hosting + API usage only
✗ Not accessible remotely
```

### 🔒 Security

**Your API key is secure:**
- ✅ Stored as environment variable (encrypted)
- ✅ Not visible in code or logs
- ✅ Not committed to GitHub (.gitignore)
- ✅ Only accessible by your Vercel functions

**Best practices:**
- Rotate API keys every 3-6 months
- Monitor usage in Anthropic console
- Set up budget alerts

### 💰 Cost Breakdown

**Vercel Hosting:**
- Hobby: $0/month (10s timeout - won't work for processing)
- Pro: $20/month (300s timeout - works for small lists)

**Anthropic API:**
- ~$0.01 per company
- ~$2 per 200-company list
- Estimate your monthly usage

**Total Monthly Cost (Pro Plan):**
- $20 (Vercel) + $10-50 (API) = $30-70/month

**Total Monthly Cost (Local Deployment):**
- $0 (hosting) + $10-50 (API) = $10-50/month

---

## Troubleshooting

### Deployment Failed

**Build errors:**
```bash
# Check build logs in Vercel dashboard
# Common fixes:

# 1. Missing dependencies
Solution: Ensure package.json is committed

# 2. TypeScript errors
Solution: Run `npx tsc --noEmit` locally and fix errors

# 3. Environment variables not set
Solution: Double-check API key in Vercel settings
```

### Function Timeout

**Error: Function execution timed out**
```
This is expected on Hobby plan!

Solutions:
1. Upgrade to Pro plan
2. Use local deployment for processing
3. Implement chunked processing (advanced)
```

### API Key Not Working

**Check:**
1. Environment variable name is exactly: `ANTHROPIC_API_KEY`
2. Value is complete (starts with `sk-ant-`)
3. Redeploy after adding variables (click "Redeploy" button)

### Changes Not Appearing

**After pushing to GitHub:**
1. Go to Vercel dashboard
2. Check "Deployments" tab
3. Verify new deployment started
4. Wait for deployment to complete
5. Hard refresh browser (Ctrl+Shift+R)

---

## Updating Your Deployment

### When you make code changes:

1. **Commit changes locally**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

2. **Vercel auto-deploys**
   - Triggered by push to GitHub
   - Check deployment status in Vercel dashboard
   - Usually completes in 2-3 minutes

3. **Test changes**
   - Visit your Vercel URL
   - Hard refresh (Ctrl+Shift+R)
   - Test functionality

---

## Alternative: Deploy Locally for Production

### If you don't want Vercel Pro:

**Option 1: Keep Using `npm run dev`**
- Works perfectly
- No timeout limits
- Free
- Just keep terminal open

**Option 2: Build for Production**
```bash
cd "C:\Users\IT\OneDrive\Desktop\Claude Projects\Target List Builder\target-list-generator"
npm run build
npm run start
```

Then access at: `http://localhost:3000`

**Option 3: Expose Local App to Internet**
Use ngrok for temporary public access:
```bash
# Install ngrok
npm install -g ngrok

# Run your app
npm run dev

# In another terminal, expose it
ngrok http 3000
```

You'll get a public URL like: `https://abc123.ngrok.io`

---

## Recommendation

### For Your Use Case:

**Best Option: Local Deployment**
- Run `npm run dev` on your computer
- No timeout limits
- Process any size list
- Free (except API costs)
- Access at `localhost:3000`

**When to Use Vercel:**
- Want to share with team remotely
- Need public URL
- Willing to upgrade to Pro plan
- Processing mostly small lists (<100 companies)

**Hybrid Approach:**
- Deploy to Vercel for demo/preview
- Use local deployment for actual processing
- Best of both worlds!

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy to Vercel
3. ⚠️ Test with small file (will likely timeout)
4. 🤔 Decide: Upgrade to Pro OR use local deployment
5. 📊 Start processing your target lists!

---

**Questions?**
- Vercel docs: https://vercel.com/docs
- Vercel support: https://vercel.com/support
- Check README.md for more details

**Your deployment URL will be:**
`https://target-list-generator-[random].vercel.app`

(You can customize this in Vercel settings)
