/**
 * AdminLogin — separate from the user login. Only accepts role === 'admin'.
 * No "register as admin" option anywhere in the app.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin, isAdmin } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@slicehouse.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.adminLogin({ email: email.trim(), password });
      loginAdmin(data.token, data.user);
      toast({ type: 'success', message: 'Welcome, Admin' });
      navigate('/admin');
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-cream">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <Shield size={28} />
          </span>
          <h1 className="font-serif text-2xl font-bold">Slice House Admin</h1>
          <p className="text-sm text-cream/60">Restricted area · staff access only</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-7">
          <div>
            <label className="label">Admin email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                className="input pl-10"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in to dashboard'}
          </button>

          <div className="rounded-lg bg-cream p-3 text-xs text-charcoal/60">
            <p className="font-semibold text-charcoal/80">Demo credentials</p>
            <p>Email: admin@slicehouse.com</p>
            <p>Password: Admin@12345</p>
          </div>
        </form>
      </div>
    </div>
  );
}
