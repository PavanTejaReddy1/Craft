import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../api/index.js';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-sm">
        <Link to="/" className="block text-xl font-bold text-gray-900 mb-10">CRAFT</Link>

        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-4" />
            <p className="text-gray-600">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Email verified!</h1>
            <p className="text-gray-500 mb-6">Your email has been verified. You can now access all features of CRAFT.</p>
            <Link to="/dashboard" className="btn-primary w-full block text-center">Go to Dashboard</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h1>
            <p className="text-gray-500 mb-6">The link is invalid or has expired. Request a new verification email.</p>
            <Link to="/login" className="btn-secondary w-full block text-center">Back to Sign In</Link>
          </>
        )}
      </div>
    </div>
  );
};
