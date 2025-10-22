# Deploying SynchroHR to Vercel

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub account with this repository connected
3. Supabase project credentials (already configured in Lovable Cloud)

## Deployment Steps

### Option 1: GitHub Integration (Recommended)

1. **Connect to GitHub**
   - In Lovable, click the GitHub icon in the top right
   - Authorize and create/connect a repository
   - All changes in Lovable will automatically sync to GitHub

2. **Deploy to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the Vite framework
   - Click "Deploy"

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
     VITE_SUPABASE_PROJECT_ID=your_project_id
     ```
   - Get these values from your Lovable Cloud backend

4. **Redeploy**
   - After adding environment variables, trigger a redeploy
   - Your app will be live at your-app.vercel.app

### Option 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
   vercel env add VITE_SUPABASE_PROJECT_ID
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch automatically deploys to production
- Pull requests create preview deployments
- Rollback to any previous deployment with one click

## Environment Variables Setup

Get your Supabase credentials from Lovable Cloud:

1. In Lovable, click "View Backend" button
2. Navigate to Settings → API
3. Copy the following values:
   - Project URL → `VITE_SUPABASE_URL`
   - Project API keys (anon/public) → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Project ID → `VITE_SUPABASE_PROJECT_ID`

## Custom Domain

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

## Authentication Configuration

After deployment, update your Supabase auth settings:

1. Go to Lovable Cloud backend → Authentication → URL Configuration
2. Add your Vercel domain to "Site URL"
3. Add your Vercel domain to "Redirect URLs"
   - Format: `https://your-domain.vercel.app/**`

## Troubleshooting

### 404 on Page Refresh
- Ensure `vercel.json` has the rewrite rule (already configured)
- Check that `outputDirectory` is set to `dist`

### Environment Variables Not Loading
- Ensure all variables are prefixed with `VITE_`
- Redeploy after adding new variables
- Check Vercel logs for build errors

### Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Ensure Node.js version compatibility

## Performance Optimization

The app is already optimized with:
- ✅ Code splitting with React lazy loading
- ✅ Asset caching headers (31536000s for static assets)
- ✅ Production builds with minification
- ✅ Optimized bundle size
- ✅ CDN distribution via Vercel Edge Network

## Monitoring

1. **Vercel Analytics**
   - Automatic performance monitoring
   - Real User Metrics (RUM)
   - Available in Vercel dashboard

2. **Supabase Logs**
   - Monitor backend logs in Lovable Cloud
   - Track API usage and errors
   - Database performance metrics

## Support

- Vercel Documentation: https://vercel.com/docs
- Lovable Documentation: https://docs.lovable.dev
- Supabase Documentation: https://supabase.com/docs
