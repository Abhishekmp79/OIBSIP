/**
 * ResetPassword — sets a new password from a reset token.
 */
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import { isValidPassword } from '../utils/validation';

export function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPassword(password)) {
      toast({ type: 'error', message: 'Password must be at least 8 characters' });
      return;
    }
    if (password !== confirm) {
      toast({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token!, password);
      toast({ type: 'success', message: 'Password reset! Please log in.' });
      navigate('/login');
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Reset failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6">
      <div className="card animate-fade-in p-7">
        <h1 className="font-serif text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-charcoal/60">Choose a strong password for your account.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">New password</label>
            <div className="relative">
              <input
                className="input pr-11"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input
              className="input"
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Resetting…' : 'Reset password'}
            {!loading && <KeyRound size={18} />}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-charcoal/60">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
