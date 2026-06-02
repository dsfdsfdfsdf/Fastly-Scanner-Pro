# Deployment Instructions

## Deploy to GitHub

1. Create a new repository on GitHub
2. Copy all files from your project to the repository folder
3. Initialize Git in your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

## Deploy to Vercel

### Option 1: Direct from GitHub (Recommended)

1. After pushing your code to GitHub, go to [Vercel](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Select your repository from the list
5. Vercel will automatically detect it's a Next.js project
6. Click "Deploy"
7. Your site will be live with a URL like `https://your-project-name.vercel.app`

### Option 2: Using Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Navigate to your project directory and run:
   ```bash
   vercel
   ```

3. Follow the prompts to link your project to your Vercel account
4. Your project will be deployed automatically

### Option 3: Import from Git

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Choose "Import Git Repository"
4. Paste your GitHub repository URL
5. Configure your project settings if needed
6. Click "Deploy"

## Automatic Updates

Once connected to GitHub, Vercel will automatically deploy:
- New commits pushed to the `main` branch
- Pull requests (as preview deployments)
- Merged pull requests

## Environment Variables (if needed)

If your project requires environment variables:
1. Go to your project settings in Vercel dashboard
2. Navigate to "Environment Variables" section
3. Add your variables there

## Custom Domain (optional)

To connect a custom domain:
1. In your Vercel project dashboard, go to "Settings"
2. Navigate to "Domains" section
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

If you encounter any issues during deployment:

1. Make sure all dependencies are listed in `package.json`
2. Ensure your `next.config.mjs` is properly configured
3. Check that your `tsconfig.json` is valid
4. Verify that your build command works locally (`npm run build`)

## Post-Deployment

After successful deployment:
1. Visit your site using the provided URL
2. Test all functionality
3. Set up custom domain if desired
4. Monitor logs in Vercel dashboard if needed