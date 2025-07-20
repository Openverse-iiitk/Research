# OAuth Configuration Fix Guide

## Problem Identified

The "authentication code missing" error occurs because of redirect URL configuration mismatches between:
1. Supabase dashboard redirect allow list
2. Google OAuth Console authorized redirect URIs  
3. Application code redirect URLs

## Root Cause

Based on extensive research and GitHub discussions, the issue is:
- Supabase redirect URL patterns use `*` vs `**` incorrectly
- `*` only matches non-separator characters (not `/`)
- `**` matches any sequence of characters including `/`
- URLs like `/auth/callback` contain `/` so need `**` pattern

## Solution Steps

### 1. Fix Supabase Dashboard Redirect URLs

Go to [Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/_/auth/url-configuration)

**Replace any existing redirect URLs with:**

For Local Development:
```
http://localhost:3001/**
http://127.0.0.1:3001/**
```

For Production:
```
https://research-iiitk.vercel.app/**
```

### 2. Fix Google OAuth Console

Go to [Google Cloud Console → APIs & Credentials → OAuth 2.0 Client IDs](https://console.cloud.google.com/apis/credentials)

**Authorized JavaScript origins:**
```
http://localhost:3001
http://127.0.0.1:3001
https://research-iiitk.vercel.app
```

**Authorized redirect URIs:**
```
http://localhost:3001/auth/callback
http://127.0.0.1:3001/auth/callback
https://research-iiitk.vercel.app/auth/callback
https://qzamtnoroftvwwckjvkk.supabase.co/auth/v1/callback
```

### 3. Verify Current Configuration

Current environment variables (CONFIRMED CORRECT):
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=49477687834-h9ad8dvtcqqjg3becb58uhccpmstt34j.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET=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`
- `NEXT_PUBLIC_APP_URL=http://localhost:3001`
- `NEXT_PUBLIC_VERCEL_APP_URL=https://research-iiitk.vercel.app`

### 4. Test After Configuration

1. Save changes in both Supabase and Google Console
2. Wait 5-10 minutes for changes to propagate
3. Clear browser cache and cookies
4. Test OAuth flow at: http://localhost:3001/login

## Important Notes

- **Double asterisk (`**`) is crucial** - single `*` won't work for paths with `/`
- **Exact URL matching** - no trailing slashes unless intended
- **Case sensitivity** - URLs must match exactly
- **Propagation time** - Changes can take 5-10 minutes

## Current Status

✅ Application code is correct
✅ Environment variables are correct  
✅ Auth callback handler is correct
❌ Supabase redirect URL patterns need fixing (likely using `*` instead of `**`)
❌ Google Console redirect URIs may need updating

## References

- [Supabase Redirect URLs Documentation](https://supabase.com/docs/guides/auth/redirect-urls)
- [GitHub Discussion: Google OAuth not working locally](https://github.com/orgs/supabase/discussions/20353)
- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
