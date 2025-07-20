# OAuth Authentication Testing Guide

## Current Status ✅

Your Google OAuth configuration has been updated with the correct redirect URLs:
- `http://localhost:3001/auth/callback` (Local dev)
- `http://localhost:3000/auth/callback` (Local dev backup) 
- `https://research-iiitk.vercel.app/auth/callback` (Production)

The OAuth callback infrastructure has been tested and is working correctly.

## Testing Steps

### 1. Local Development Testing

1. Open: http://localhost:3001/login
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Should redirect back to your app and create user in database

### 2. Production Testing

1. Open: https://research-iiitk.vercel.app/login
2. Click "Continue with Google" 
3. Complete Google OAuth flow
4. Should redirect back to your app and create user in database

### 3. Expected Flow

**Success Path:**
1. User clicks "Continue with Google"
2. Redirected to Google OAuth consent screen
3. User grants permissions
4. Google redirects to `/auth/callback` with authorization code
5. App exchanges code for session with Supabase
6. User profile created in database (if first time)
7. User redirected to dashboard based on role

**What to Watch For:**
- No more "Authentication code missing" errors
- Users should be created in your Supabase `users` table
- Console logs should show successful OAuth flow

### 4. Debugging

If issues persist, check:
- Browser developer console for errors
- Network tab to see OAuth redirect URLs
- Supabase dashboard for user creation
- Server logs (localhost terminal or Vercel function logs)

### 5. Database Verification

After successful login, check your Supabase `users` table:
```sql
SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;
```

## Timing Note

Google OAuth settings can take 5 minutes to a few hours to take effect. If you still get "no auth code" errors immediately after updating the settings, wait a bit and try again.

## Test Endpoints

- **Health Check**: `/api/health`
- **OAuth Debug**: `/debug/oauth` 
- **Test OAuth Flow**: `/api/test-oauth?test=oauth`
