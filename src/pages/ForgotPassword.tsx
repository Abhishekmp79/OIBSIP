/**
 * ForgotPassword — requests a reset link. Always shows success message
 * (matches backend anti-enumeration behaviour).
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import { isValidEmail } from '../utils/validation';

export function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast({ type: 'error', message: 'Enter a valid email' });
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6">
      <div className="card animate-fade-in p-7">
        {sent ? (
          <div className="text-center">
            <MailCheck size={48} className="mx-auto text-sage" />
            <h1 className="mt-4 font-serif text-2xl font-bold">Check your inbox</h1>
            <p className="mt-2 text-charcoal/70">
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
              It expires in 1 hour.
            </p>
            <Link to="/login" className="btn-primary mt-6">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-2xl font-bold">Forgot password?</h1>
            <p className="mt-1 text-sm text-charcoal/60">
              Enter your email and we'll send you a secure reset link.
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-charcoal/60">
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
