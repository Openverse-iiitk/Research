# Research Connect - Deployment Guide

## Overview
This guide covers deploying the Research Connect application to Vercel with Supabase as the backend.

## Prerequisites
1. Supabase project setup
2. Vercel account
3. GitHub repository with your code

## Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from Settings > API

### 2. Database Schema Setup
1. Go to SQL Editor in your Supabase dashboard
2. Run the schema from `supabase-schema.sql`
3. Run the storage setup from `storage-setup.sql`

### 3. Google OAuth Configuration
1. Go to Authentication > Providers in Supabase
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: Your Google OAuth Client ID
   - Client Secret: Your Google OAuth Client Secret
4. Set the redirect URL to: `https://your-project.supabase.co/auth/v1/callback`
    - **Where to set:** In the Google Cloud Console, go to **APIs & Services > Credentials**, select your OAuth 2.0 Client ID, and add this URL to the **Authorized redirect URIs** field.
5. In advanced settings, add domain hint: `iiitkottayam.ac.in`
    - **Where to set:** In the Google Cloud Console, under your OAuth consent screen, add `iiitkottayam.ac.in` to the list of **Authorized domains**.

> **Note:** Adding your domain to **Authorized domains** restricts which users can authenticate, but it is not the same as setting the app's user type to **Internal**.  
> - Setting the app as **Internal** (in the Audience section of the consent screen) restricts access to users within your Google Workspace organization.  
> - Adding an authorized domain allows users with emails from that domain to authenticate, but does not limit access strictly to organization members unless combined with other settings.  
> - For most educational institutions, adding the domain as an authorized domain is sufficient for domain-based restriction, but if you want to restrict access only to users within your institution's Google Workspace, set the app as **Internal**.

### 4. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure consent screen with your domain
6. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `https://your-vercel-app.vercel.app/auth/callback`
7. In OAuth consent screen, add `iiitkottayam.ac.in` as authorized domain

### 5. Storage Buckets
The storage setup script creates these buckets:
- `avatars` (public) - User profile images
- `blog-pdfs` (private) - Blog post attachments
- `resumes` (private) - Student resumes

## Vercel Deployment

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Set the framework preset to "Next.js"

### 2. Environment Variables
Add these environment variables in Vercel dashboard:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth (optional, if using additional OAuth features)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

### 3. Deploy
1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Your app will be live at the provided Vercel URL

## Post-Deployment Configuration

### 1. Update Google OAuth Redirect URIs
Add your Vercel app URL to Google OAuth configuration:
- `https://your-vercel-app.vercel.app/auth/callback`

### 2. Update Supabase Authentication
1. Go to Authentication > URL Configuration in Supabase
2. Add your Vercel URL to Site URL and Redirect URLs:
   - Site URL: `https://your-vercel-app.vercel.app`
   - Redirect URLs: `https://your-vercel-app.vercel.app/auth/callback`

### 3. Test Authentication Flow
1. Visit your deployed app
2. Try Google sign-in with an `@iiitkottayam.ac.in` email
3. Complete the username/password setup
4. Test creating blog posts, projects, and applications

## Domain Configuration (Optional)

### 1. Custom Domain in Vercel
1. Go to your project settings in Vercel
2. Add your custom domain (e.g., `research.iiitkottayam.ac.in`)
3. Configure DNS records as instructed

### 2. Update OAuth Configurations
Update all OAuth redirect URIs to use your custom domain instead of Vercel's URL.

## Security Checklist

### Row Level Security (RLS)
Ensure these RLS policies are enabled:
- ✅ Users can only update their own profiles
- ✅ Students can only view their own applications
- ✅ Teachers can only view applications to their projects
- ✅ Blog posts respect author permissions
- ✅ File uploads are restricted by user and role

### Environment Variables
- ✅ All secrets are stored in Vercel environment variables
- ✅ No sensitive data in client-side code
- ✅ Service role key is only used in API routes

### OAuth Security
- ✅ Domain restriction to `@iiitkottayam.ac.in`
- ✅ Proper redirect URL validation
- ✅ Session management with Supabase Auth

## Monitoring and Maintenance

### 1. Error Monitoring
- Set up Vercel Analytics
- Monitor Supabase logs for errors
- Set up alerts for authentication failures

### 2. Database Maintenance
- Regular backup of Supabase database
- Monitor storage usage
- Clean up old files periodically

### 3. Performance Optimization
- Enable Vercel Edge Functions for better performance
- Optimize images with Next.js Image component
- Use Supabase CDN for file serving

## Troubleshooting

### Common Issues

1. **OAuth Domain Error**
   - Check Google OAuth domain restrictions
   - Verify email domain validation in auth callback

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies are not too restrictive

3. **File Upload Issues**
   - Verify storage bucket policies
   - Check file size and type restrictions

4. **Build Failures**
   - Check TypeScript errors
   - Verify all environment variables are set

### Support
For issues specific to this application, check the GitHub repository or contact the development team.

## Security Notes

### Important Security Measures Implemented:

1. **Email Domain Restriction**: Only `@iiitkottayam.ac.in` emails can register
2. **Row Level Security**: Database access is restricted based on user roles
3. **File Upload Security**: Files are scanned and restricted by type/size
4. **Session Management**: Secure session handling with Supabase Auth
5. **API Protection**: All API routes require authentication
6. **Input Validation**: All user inputs are validated on both client and server

### Data Privacy:
- User data is stored securely in Supabase (EU/US regions available)
- File uploads are stored in private buckets with access controls
- No sensitive data is logged or exposed in client-side code

This application follows GDPR and privacy best practices for educational institutions.
