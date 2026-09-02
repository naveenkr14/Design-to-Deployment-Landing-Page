import { useState } from 'react';
import { signInWithProvider } from '../lib/auth.js';

const PROVIDERS = [
  { id: 'google', label: 'Google' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'instagram', label: 'Instagram' },
];

function ProviderIcon({ provider }) {
  if (provider === 'google') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z" />
        <path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6Z" />
        <path fill="#FBBC05" d="M6.54 13.68a5.85 5.85 0 0 1 0-3.36V7.79H3.3a9.6 9.6 0 0 0 0 8.42l3.24-2.53Z" />
        <path fill="#EA4335" d="M12 6.29c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.38 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.01 9.46 6.29 12 6.29Z" />
      </svg>
    );
  }

  if (provider === 'twitter') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.4L6.47 22H3.36l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.73L8.28 4.05H6.42L17.8 19.84Z" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function SocialAuth({ redirectTo, onError }) {
  const [loading, setLoading] = useState('');

  async function handleProvider(provider) {
    onError?.('');
    if (provider === 'instagram') {
      onError?.('Instagram login needs a custom OAuth provider in Supabase before it can be used.');
      return;
    }

    setLoading(provider);
    try {
      await signInWithProvider(provider, `${window.location.origin}${redirectTo}`);
    } catch (error) {
      onError?.(error.message || `${provider} login failed.`);
      setLoading('');
    }
  }

  return (
    <>
      <div className="social-divider"><span>or continue with</span></div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'.5rem' }}>
        {PROVIDERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="social-button"
            onClick={() => handleProvider(id)}
            disabled={Boolean(loading)}
            aria-label={`Continue with ${label}`}
            title={id === 'instagram' ? 'Requires custom Supabase OAuth setup' : `Continue with ${label}`}
          >
            {loading === id ? <span className="social-button__loading" aria-hidden="true" /> : <ProviderIcon provider={id} />}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
