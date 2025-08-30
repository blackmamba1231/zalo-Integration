import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:3000";

export default function App() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
    useEffect(() => {
    const url = new URL(window.location.href);
    const s = url.searchParams.get("status");
    const reason = url.searchParams.get("reason");
    if (s === "success") {
      setStatus("Zalo connected successfully.");
    } else if (s === "error") {
      setError(reason || "Something went wrong while connecting Zalo.");
    }
  }, []);

  const connectHref = useMemo(() => {
    const base = API_BASE || "";
    return `${base}/auth/zalo`;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <Header />

        {status && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 text-green-800 px-4 py-3">
            {status}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3">
            {error}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ZaloLogo className="h-9 w-9" />
            <div>
              <h2 className="text-xl font-semibold">Connect your Zalo account</h2>
              <p className="text-sm text-gray-500">Use OAuth 2.0 with PKCE to link your Zalo profile to this app.</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-2 mb-6 list-disc list-inside">
            <li>Click the button below to continue to Zalo’s secure login page.</li>
            <li>After you grant access, you’ll be redirected back here.</li>
            <li>Your tokens are exchanged securely on the server.</li>
          </ul>

          <a
            href={connectHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-90"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 5a.75.75 0 00-1.5 0v5.19l-2.22 2.22a.75.75 0 101.06 1.06l2.41-2.41c.16-.16.25-.38.25-.61V7z"/></svg>
            Connect with Zalo
          </a>

          <hr className="my-6" />

          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-500 select-none group-open:text-gray-700">Advanced</summary>
            <div className="mt-3 text-sm text-gray-600 space-y-2">
              <p>
                This page only performs a <span className="font-mono">GET</span> redirect to your backend at
                <span className="font-mono"> /auth/zalo</span>. The backend generates <em>state</em> and
                <em> code_verifier</em> (PKCE), stores them in HTTP-only cookies, and redirects to Zalo.
              </p>
              <p>
                After login, Zalo calls <span className="font-mono">/auth/zalo/callback</span> on your server, which
                exchanges the code for tokens. For a nicer UX, have the server
                <span className="font-mono"> res.redirect("/ ?status=success")</span> (or
                <span className="font-mono">?status=error&amp;reason=...</span>), so this page can show a banner.
              </p>
            </div>
          </details>
        </div>

        <Footer />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">Account Connections</h1>
      <p className="text-sm text-gray-500">Link external services to your profile</p>
    </div>
  );
}

function Footer() {
  return (
    <div className="text-xs text-gray-400 mt-6 text-center">
      Need help? Check your Zalo app settings and callback URL in the Zalo developer console.
    </div>
  );
}

function ZaloLogo({ className = "" }) {
   return (
    <svg className={className} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1da1f2" />
          <stop offset="100%" stopColor="#0b74d0" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="240" height="240" rx="56" fill="url(#g)" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto" fontWeight="800" fontSize="96" fill="#fff">Z</text>
    </svg>
  );
}
