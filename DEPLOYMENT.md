# QA Dashboard - Deployment Guide

## Overview

This guide covers deploying the QA Dashboard to Vercel with a PostgreSQL database. The application has been configured to handle database migrations properly in production.

## Prerequisites

- Vercel account
- PostgreSQL database (cloud-hosted)
- Google OAuth credentials
- Git repository

## Database Setup

### Option 1: Neon (Recommended)
1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string

### Option 2: Supabase
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

### Option 3: Railway
1. Go to [Railway](https://railway.app)
2. Create a new PostgreSQL service
3. Copy the connection string

## Vercel Deployment

### 1. Environment Variables

Set these environment variables in your Vercel project:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-app.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Webhook (optional)
WEBHOOK_SECRET_TOKEN="your-webhook-secret"
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for development)

### 3. Deploy to Vercel

#### Option A: Vercel CLI
```bash
npm install -g vercel
vercel
```

#### Option B: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Import the project
3. Configure environment variables
4. Deploy

### 4. Post-Deployment: Run Database Migrations

**IMPORTANT**: After your first deployment, you need to run database migrations manually.

#### Method 1: Using Vercel CLI (Recommended)
```bash
# Set your production DATABASE_URL locally
export DATABASE_URL="your-production-database-url"

# Run the migration script
node scripts/deploy-migrations.js
```

#### Method 2: Using Vercel Functions
1. Go to your Vercel dashboard
2. Navigate to Functions tab
3. Create a new function or use the existing API
4. Run migrations through the API

#### Method 3: Direct Database Access
If you have direct access to your PostgreSQL database:
```sql
-- Run the migration SQL directly
ALTER TABLE "test_plans" ADD COLUMN "acceptance_criteria" TEXT,
ADD COLUMN "deliverables" TEXT,
ADD COLUMN "environment" TEXT,
ADD COLUMN "objectives" TEXT,
ADD COLUMN "resources" TEXT,
ADD COLUMN "risk_management" TEXT,
ADD COLUMN "schedule" TEXT,
ADD COLUMN "scope" TEXT,
ADD COLUMN "test_strategy" TEXT;
```

## Troubleshooting

### Common Issues

#### 1. "Column 'objectives' does not exist" Error
**Cause**: Database migrations haven't been run in production.
**Solution**: Run the migration script as described above.

#### 2. Build Fails with Database Connection Error
**Cause**: Vercel trying to connect to database during build.
**Solution**: This has been fixed in the current configuration. The build no longer attempts database connections.

#### 3. Authentication Issues
**Cause**: Incorrect OAuth configuration or environment variables.
**Solution**: 
- Verify `NEXTAUTH_URL` matches your deployment URL
- Check Google OAuth redirect URIs
- Ensure `NEXTAUTH_SECRET` is set

#### 4. Database Connection Issues
**Cause**: Incorrect `DATABASE_URL` or network restrictions.
**Solution**:
- Verify the connection string format
- Ensure SSL is enabled (`?sslmode=require`)
- Check database firewall settings

### Verification Steps

1. **Test Authentication**:
   - Visit `/login`
   - Try logging in with Google

2. **Test Database Connection**:
   - Visit `/test-management`
   - Try creating a test case (should work)
   - Try creating a test plan (should work after migrations)

3. **Check Logs**:
   - Monitor Vercel function logs
   - Check browser console for errors

## Environment-Specific Notes

### Development
- Uses local SQLite database by default
- Migrations run automatically with `prisma migrate dev`

### Production
- Uses PostgreSQL database
- Migrations must be run manually after deployment
- Build process excludes database operations

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **Database Access**: Use connection pooling and SSL
3. **Authentication**: Ensure proper OAuth configuration
4. **CORS**: Configure allowed origins appropriately

## Monitoring

- Monitor Vercel function logs for errors
- Set up database monitoring (if available)
- Monitor application performance
- Set up error tracking (e.g., Sentry)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Verify environment variables
4. Test database connectivity
5. Check migration status

---

**Last Updated**: January 2025
**Version**: 1.0.0