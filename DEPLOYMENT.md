# Deployment Guide - Personal CRM

This guide will help you deploy your Personal CRM application to Vercel.

## Prerequisites

- GitHub repository (already created)
- Vercel account
- PostgreSQL database (we'll use Vercel Postgres or external provider)
- Microsoft 365 developer account

## Step 1: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)** and sign in with your GitHub account

2. **Import your repository**:
   - Click "New Project"
   - Select your `personal-crm` repository
   - Vercel will automatically detect the monorepo structure

3. **Configure the project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root of the repository)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `packages/frontend/dist`
   - **Install Command**: `npm run install:all`

## Step 2: Set up Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

### Backend Environment Variables
```
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-super-secret-jwt-key-here
MS_CLIENT_ID=your-microsoft-app-client-id
MS_CLIENT_SECRET=your-microsoft-app-client-secret
MS_TENANT_ID=your-microsoft-tenant-id
MS_REDIRECT_URI=https://your-app.vercel.app/api/auth/microsoft/callback
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Frontend Environment Variables
```
VITE_API_URL=https://your-app.vercel.app
VITE_MS_CLIENT_ID=your-microsoft-app-client-id
VITE_MS_TENANT_ID=your-microsoft-tenant-id
VITE_MS_REDIRECT_URI=https://your-app.vercel.app
```

## Step 3: Set up Database

### Option A: Vercel Postgres (Recommended)
1. In your Vercel dashboard, go to **Storage**
2. Create a new Postgres database
3. Copy the connection string to your `DATABASE_URL` environment variable
4. Run database migrations:
   ```bash
   # Locally with the production database
   cd packages/backend
   npx prisma db push
   ```

### Option B: External PostgreSQL
- Use services like Supabase, Railway, or PlanetScale
- Add the connection string to your environment variables

## Step 4: Configure Microsoft 365

1. **Update Azure App Registration**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to your app registration
   - Update redirect URIs to include:
     - `https://your-app.vercel.app`
     - `https://your-app.vercel.app/api/auth/microsoft/callback`

2. **Update environment variables** with your Microsoft 365 credentials

## Step 5: Deploy

1. **Push your changes** to GitHub:
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Vercel will automatically deploy** when you push to the main branch

3. **Check the deployment** in your Vercel dashboard

## Step 6: Post-Deployment Setup

1. **Run database migrations** (if using external database):
   ```bash
   # Connect to your production database
   npx prisma db push --schema=packages/backend/prisma/schema.prisma
   ```

2. **Test the application**:
   - Visit your Vercel URL
   - Test Microsoft 365 authentication
   - Verify all features work correctly

## Environment Variables Reference

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Server
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here

# Microsoft 365 / Azure AD
MS_CLIENT_ID=your-microsoft-app-client-id
MS_CLIENT_SECRET=your-microsoft-app-client-secret
MS_TENANT_ID=your-microsoft-tenant-id
MS_REDIRECT_URI=https://your-app.vercel.app/api/auth/microsoft/callback

# CORS
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (.env)
```env
VITE_API_URL=https://your-app.vercel.app
VITE_MS_CLIENT_ID=your-microsoft-app-client-id
VITE_MS_TENANT_ID=your-microsoft-tenant-id
VITE_MS_REDIRECT_URI=https://your-app.vercel.app
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are properly installed
   - Verify TypeScript compilation
   - Check environment variables are set correctly

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correct
   - Check database is accessible from Vercel
   - Run migrations if needed

3. **Microsoft 365 Authentication**:
   - Verify redirect URIs are correct
   - Check client ID and secret
   - Ensure API permissions are granted

4. **CORS Issues**:
   - Verify `FRONTEND_URL` matches your Vercel domain
   - Check CORS configuration in backend

### Getting Help

- Check Vercel deployment logs in the dashboard
- Review GitHub Actions (if using)
- Check application logs in Vercel Functions

## Next Steps

After successful deployment:

1. **Set up custom domain** (optional)
2. **Configure monitoring** and analytics
3. **Set up CI/CD** for automated deployments
4. **Configure backups** for your database
5. **Set up SSL certificates** (handled by Vercel) 