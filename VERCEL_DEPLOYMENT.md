# Vercel Deployment Guide for SentinelX

## Prerequisites

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Create a Vercel account at [vercel.com](https://vercel.com)

## Environment Variables Setup

Before deploying, you need to configure these environment variables in your Vercel dashboard:

### Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_APP_NAME`: SentinelX (default)
- `NEXT_PUBLIC_APP_VERSION`: 1.0.0 (default)
- `NEXT_PUBLIC_AUTH_PROVIDER`: supabase (default)

### Optional Environment Variables
- `NEXT_PUBLIC_API_URL`: Custom backend API URL (if using separate backend)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL for real-time features

## Deployment Steps

### Option 1: Using Vercel CLI

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy from project root:**
   ```bash
   cd sentinelx
   vercel --prod
   ```

3. **Follow the prompts** to link your project and configure settings

### Option 2: Using Vercel Dashboard

1. **Connect GitHub Repository:**
   - Go to your Vercel dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `sentinelx` folder as the root directory

2. **Configure Build Settings:**
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add all required variables from above

4. **Deploy:**
   - Click "Deploy" to start the deployment process

## Local Testing Before Deployment

1. **Build the project locally:**
   ```bash
   cd sentinelx
   npm run build
   ```

2. **Test the build:**
   ```bash
   npm run start
   ```

3. **Verify everything works** before deploying to Vercel

## Post-Deployment Checklist

- [ ] Verify the site loads correctly
- [ ] Test authentication flow
- [ ] Check all API endpoints
- [ ] Test responsive design
- [ ] Verify environment variables are working
- [ ] Check console for any errors

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check that all dependencies are installed
   - Verify TypeScript compilation
   - Check for missing environment variables

2. **Runtime Errors:**
   - Ensure Supabase credentials are correct
   - Check API endpoints are accessible
   - Verify environment variables are properly set

3. **Image Optimization Issues:**
   - The config uses `unoptimized: true` for Vercel compatibility
   - If you want optimized images, remove this line and ensure images are properly imported

## Custom Domain Setup (Optional)

1. Go to your Vercel project dashboard
2. Navigate to "Domains" tab
3. Add your custom domain
4. Follow DNS configuration instructions

## Performance Optimization

The deployment includes:
- SWC minification for faster builds
- Console.log removal in production
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Static export configuration for better caching

## Support

For deployment issues:
- Check Vercel's deployment logs
- Review the build output for errors
- Ensure all environment variables are correctly configured
- Verify your Supabase project is accessible
