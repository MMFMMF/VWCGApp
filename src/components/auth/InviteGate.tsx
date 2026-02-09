import { useState, useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@stores/authStore';
import { validateInviteCode } from '@lib/auth/inviteCode';

interface InviteGateProps {
  children: ReactNode;
  fallbackUrl?: string;
}

export default function InviteGate({ children, fallbackUrl = '/invite' }: InviteGateProps) {
  const { isAuthenticated, checkSession, authenticate } = useAuthStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if session is valid on mount
    const valid = checkSession();
    setIsLoading(false);

    // Check for code in URL params (for direct links)
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode && !valid) {
      handleSubmit(urlCode);
    }
  }, []);

  const handleSubmit = async (submitCode?: string) => {
    const codeToValidate = submitCode || code;
    setError(null);

    if (!codeToValidate.trim()) {
      setError('Please enter an invite code');
      return;
    }

    if (validateInviteCode(codeToValidate)) {
      authenticate(codeToValidate);
    } else {
      setError('Invalid invite code. Please check and try again.');
    }
  };

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // ACC-02: If authenticated, show protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // ACC-02: Show invite code entry form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900">Invite Required</h1>
            <p className="mt-2 text-gray-600">
              Enter your invite code to access the assessment tools.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700 mb-1">
                Invite Code
              </label>
              <input
                id="invite-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VWCG-XXXX-XXXX"
                className={`w-full px-4 py-3 text-lg font-mono tracking-wider border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                autoComplete="off"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Access Tools
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have a code?{' '}
              <a href="/#contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Request access
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
