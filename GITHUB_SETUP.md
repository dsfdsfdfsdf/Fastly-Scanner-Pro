# GitHub Setup Guide

This guide will walk you through setting up your Cloudflare Scanner project on GitHub and deploying it to Vercel with automatic deployments.

## Prerequisites

1. A GitHub account
2. Git installed on your computer (already installed if you followed the previous steps)
3. A Vercel account (free)

## Steps to Deploy to GitHub and Vercel

### Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the "+" icon in the top-right corner and select "New repository"
3. Give your repository a name (e.g., "cloudflare-scanner")
4. Choose "Public" (or "Private" if you prefer)
5. Do NOT initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 2: Initialize Git and Push Your Code

1. Open your project folder in a terminal/command prompt
2. Run these commands one by one:

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create your first commit
git commit -m "Initial commit: Cloudflare Scanner Pro"

# Add the GitHub repository as remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/cloudflare-scanner.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Method 1: From Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." and select "Project"
3. Click "Continue" to import your GitHub repository
4. Find and select your newly created repository
5. Vercel will automatically detect this is a Next.js project
6. Click "Deploy" - that's it!

#### Method 2: Using Vercel CLI

1. Install Vercel CLI globally:
```bash
npm i -g vercel
```

2. Navigate to your project directory and run:
```bash
vercel
```

3. Follow the prompts:
   - Link to your GitHub account
   - Select your team (if applicable)
   - Confirm the project name
   - Confirm the root directory
   - Do NOT add any environment variables (press Enter)
   - Confirm "Yes" to auto-install and auto-build

### Step 4: Configure Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy your `main` branch on every push
- Create preview deployments for pull requests
- Handle rollbacks if needed

### Step 5: Customize Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Navigate to "Settings" > "Domains"
3. Add your custom domain if you have one
4. Follow the DNS configuration instructions

## Verification Checklist

After deployment, verify that:

- ✅ Your site is accessible via the Vercel URL
- ✅ All pages load correctly
- ✅ The UI is in English and left-to-right
- ✅ The scanner functionality works
- ✅ The PWA features work (installable, offline capable)
- ✅ The design looks as expected

## Troubleshooting

### If you encounter build errors in Vercel:

1. Check the Vercel logs for specific error messages
2. Ensure all dependencies are in `package.json`
3. Verify that `npm run build` works locally

### If Git commands fail:

1. Make sure you're in the correct project directory
2. Double-check the repository URL
3. Ensure you have proper permissions

### If Vercel deployment fails:

1. Check that your `next.config.mjs` is properly formatted
2. Verify that your build command is `next build`
3. Confirm your output directory is empty or not set

## Post-Setup Maintenance

- Any changes pushed to the `main` branch will automatically trigger a new deployment
- You can set up branch-specific deployments for development/testing
- Monitor your deployments in the Vercel dashboard
- Set up custom domains and SSL certificates as needed

Your project is now ready for GitHub and Vercel deployment with automatic updates!