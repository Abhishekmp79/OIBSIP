/**
 * Register page — fullName, email, phone, password.
 * Shows inline validation + a password strength meter. On success, stores the
 * JWT and routes to the dashboard; a verification email is sent by the server.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  passwordStrength,
} from '../utils/validation';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid phone number';
    if (!isValidPassword(form.password)) next.password = 'Minimum 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await api.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      login(data.token, data.user);
      toast({ type: 'success', message: 'Account created! Check your email to verify.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(form.password);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6">
      <div className="card animate-fade-in p-7">
        <h1 className="font-serif text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-charcoal/60">
          Join Slice House for hot, fresh pizzas delivered fast.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Field label="Full name" error={errors.fullName}>
            <input
              className="input"
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>

          <Field label="Phone" error={errors.phone}>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+91 90000 12345"
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>

          <Field label="Password" error={errors.password}>
            <div className="relative">
              <input
                className="input pr-11"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
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
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-charcoal/10">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(strength.score / 4) * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <span className="text-xs font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </Field>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating…' : 'Create account'}
            {!loading && <UserPlus size={18} />}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-charcoal/60">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-charcoal/50">
        <Link to="/forgot-password" className="hover:text-primary">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-primary">{error}</p>}
    </div>
  );
}
