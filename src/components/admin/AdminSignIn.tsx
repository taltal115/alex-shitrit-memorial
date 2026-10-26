'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth';

interface AdminSignInProps {
  title: string;
  message: string;
}

function signInErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-email'
  ) {
    return 'הדוא״ל או הסיסמה שגויים';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'ההתחברות בוטלה';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'הדומיין הזה אינו מורשה להתחברות';
  }
  if (code === 'auth/too-many-requests') {
    return 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות';
  }
  return 'ההתחברות נכשלה';
}

export default function AdminSignIn({ title, message }: AdminSignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configured = isFirebaseConfigured();

  async function handleGoogle() {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(signInErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEmail(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      setError(signInErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-8 text-center">
      <Shield className="mx-auto mb-4 text-amber-600" size={48} />
      <h2 className="text-2xl font-bold mb-4 text-amber-900">{title}</h2>
      <p className="text-amber-800 mb-6">{message}</p>

      {configured ? (
        <div className="space-y-4 text-right">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full bg-white border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            התחבר עם Google
          </button>
          <form onSubmit={handleEmail} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="דוא״ל"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="סיסמה"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-sand text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              התחבר עם דוא״ל
            </button>
          </form>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      ) : (
        <p className="text-sm text-amber-700">
          חסרים מפתחות Firebase ב-.env.local. אחרי שתוסיפו אותם, ההתחברות תיפתח כאן.
        </p>
      )}
    </div>
  );
}
