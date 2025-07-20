"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Helper function to get the correct URL for different environments
const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    (process.env.NODE_ENV === 'production' ? 'https://research-iiitk.vercel.app/' : 'http://localhost:3000/');
  url = url.includes('http') ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export default function OAuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const getDebugInfo = () => {
      const info = {
        currentUrl: window.location.href,
        origin: window.location.origin,
        environment: process.env.NODE_ENV,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      setDebugInfo(info);
    };

    getDebugInfo();
  }, []);

  const testGoogleOAuth = async () => {
    try {
      const redirectTo = `${getURL()}auth/callback`;
      console.log('Testing Google OAuth with redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        alert(`OAuth Error: ${error.message}`);
      } else {
        console.log('OAuth initiated successfully:', data);
      }
    } catch (error) {
      console.error('Unexpected OAuth error:', error);
      alert(`Unexpected Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">OAuth Debug Information</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Environment Information</h2>
          </div>
          <div className="border-t border-gray-200">
            <pre className="p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Test OAuth Flow</h2>
            <p className="mt-1 text-sm text-gray-500">
              Click the button below to test the Google OAuth flow with current configuration.
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
            <button
              onClick={testGoogleOAuth}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Test Google OAuth
            </button>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Required Google OAuth Redirect URLs</h3>
          <p className="text-sm text-yellow-700 mb-2">
            Make sure these URLs are configured in your Google Cloud Console OAuth app:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            <li><code>http://localhost:3001/auth/callback</code> (development)</li>
            <li><code>https://research-iiitk.vercel.app/auth/callback</code> (production)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
