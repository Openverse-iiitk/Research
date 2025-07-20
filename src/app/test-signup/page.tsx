"use client";
import { useState } from 'react';

export default function TestSignupPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'sanisettykumar24bcs0217@iiitkottayam.ac.in',
          password: 'TestPassword123',
          name: 'Test User',
          role: 'student',
          department: 'Computer Science & Engineering'
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Email Signup Test</h1>
        
        <button
          onClick={testSignup}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Email Signup'}
        </button>

        {result && (
          <div className="mt-8 p-6 bg-slate-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-6 bg-slate-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check Supabase Dashboard &gt; Authentication &gt; Settings</li>
            <li>Verify "Enable email confirmations" setting</li>
            <li>Check SMTP configuration in Authentication &gt; Settings &gt; SMTP</li>
            <li>Verify email templates are configured</li>
            <li>Check site URL and redirect URLs</li>
            <li>Look at Supabase logs for any errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
