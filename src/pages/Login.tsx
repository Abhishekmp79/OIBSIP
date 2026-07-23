/**
 * Login page — email + password. Routes to the dashboard on success.
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isValidEmail } from '../utils/validation';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const data = await api.login({ email: email.trim(), password });
      login(data.token, data.user);
      toast({ type: 'success', message: `Welcome back, ${data.user.fullName.split(' ')[0]}!` });
      const dest = (location.state as { from?: string })?.from || '/dashboard';
      navigate(dest);
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6">
      <div className="card animate-fade-in p-7">
        <h1 className="font-serif text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-charcoal/60">Log in to order your favourite pizzas.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((x) => ({ ...x, email: undefined }));
              }}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-xs text-primary">{errors.email}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                className="input pr-11"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((x) => ({ ...x, password: undefined }));
                }}
                placeholder="••••••••"
                autoComplete="current-password"
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
            {errors.password && <p className="mt-1 text-xs text-primary">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in…' : 'Log in'}
            {!loading && <LogIn size={18} />}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm text-charcoal/60">
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create account
          </Link>
          <Link to="/forgot-password" className="hover:text-primary">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
