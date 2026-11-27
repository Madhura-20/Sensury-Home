import React, { useState } from 'react';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { AppPage } from '../types/sensury';
import { useSensury } from '../context/SensuryContext';
import { auth } from '../lib/firebase';

interface AuthPageProps {
  onNavigate: (page: AppPage, authMode?: 'login' | 'register') => void;
  initialMode?: 'login' | 'register';
}

export function AuthPage({ onNavigate, initialMode = 'login' }: AuthPageProps) {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logout } = useSensury();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const formatAuthError = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw.includes('auth/operation-not-allowed')) {
      return 'Email/Password sign-in is not yet enabled in Firebase Console (Authentication → Sign-in method). You can sign in immediately using Google below, or enable Email/Password in Firebase Console.';
    }
    if (raw.includes('auth/popup-closed-by-user')) {
      return 'Sign-in window was closed before completing. Please try again.';
    }
    if (raw.includes('auth/invalid-credential') || raw.includes('auth/wrong-password')) {
      return 'Email or password did not match. Try again or reset your password.';
    }
    if (raw.includes('auth/email-already-in-use')) {
      return 'An account with this email already exists. Switch to Sign In.';
    }
    if (raw.includes('auth/weak-password')) {
      return 'Please choose a password of at least 6 characters.';
    }
    return raw;
  };

  const handleGoogle = async () => {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onNavigate('dashboard');
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
        onNavigate('dashboard');
      } else if (mode === 'register') {
        await registerWithEmail(name, email.trim(), password);
        setNotice('Account created. A verification link has been sent to your email address—please verify it before saving project data.');
      } else {
        await resetPassword(email.trim());
        setNotice('Password reset instructions have been sent to your email address.');
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle signed-in user waiting on email verification
  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#E7E5DF] rounded-xl p-8">
          <MailCheck className="w-8 h-8 text-[#154D34] mb-4" />
          <h1 className="font-display text-2xl font-bold text-[#14171A] mb-2">Verify your email</h1>
          <p className="text-sm text-[#4A5056] leading-relaxed mb-6">
            Your account ({user.email}) is signed in, and SENSURY HOME requires a verified email to
            protect your private home project documents. Check your inbox, then refresh this page.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                if (auth.currentUser) {
                  await sendEmailVerification(auth.currentUser);
                  setNotice('Verification email sent again.');
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#154D34] rounded-lg hover:bg-[#113D29] cursor-pointer"
            >
              Resend Verification Email
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-[#14171A] border border-[#E7E5DF] rounded-lg hover:bg-[#F3F2EE] cursor-pointer"
            >
              I Have Verified
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-[#4A5056] hover:text-[#14171A] cursor-pointer"
            >
              Sign Out
            </button>
          </div>
          {notice && <p className="text-xs text-[#154D34] mt-4">{notice}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center p-6">
      <div className="max-w-md w-full mx-auto">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0F233D] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SENSURY HOME</span>
        </button>

        <div className="bg-white border border-[#E6E2DA] rounded-xl p-8">
          <p className="text-xs font-semibold text-[#1F5F46] mb-1">SENSURY HOME · Home is where Mom is.</p>
          <h1 className="font-display text-2xl font-bold text-[#0F233D] mb-2">
            {mode === 'login'
              ? 'Sign in to your home workspace'
              : mode === 'register'
              ? 'Create your family home account'
              : 'Reset your password'}
          </h1>
          <p className="text-sm text-[#475569] mb-6">
            Save your house plan, track construction stages, record bills, and chat with the AI guide.
          </p>

          {/* Primary Google Auth (Provisioned out-of-the-box) */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogle}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#1F5F46] rounded-lg hover:bg-[#174A36] disabled:opacity-60 transition-colors cursor-pointer"
          >
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E7E5DF]" />
            <span className="text-xs text-[#4A5056]">or use email</span>
            <div className="h-px flex-1 bg-[#E7E5DF]" />
          </div>

          <div className="flex gap-1 p-1 bg-[#F3F2EE] rounded-lg mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setNotice('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'login' ? 'bg-white text-[#14171A] shadow-sm' : 'text-[#4A5056]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setNotice('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'register' ? 'bg-white text-[#14171A] shadow-sm' : 'text-[#4A5056]'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('reset');
                setError('');
                setNotice('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'reset' ? 'bg-white text-[#14171A] shadow-sm' : 'text-[#4A5056]'
              }`}
            >
              Forgot Password
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154D34]/25"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#14171A] mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154D34]/25"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-xs font-medium text-[#14171A] mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2 text-sm border border-[#E7E5DF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154D34]/25"
                />
              </div>
            )}

            {error && <p className="text-xs text-[#DC2626] leading-relaxed">{error}</p>}
            {notice && <p className="text-xs text-[#154D34] leading-relaxed">{notice}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-medium text-[#14171A] bg-[#F3F2EE] border border-[#E7E5DF] rounded-lg hover:bg-[#E7E5DF] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In with Email'
                : mode === 'register'
                ? 'Create Account'
                : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
