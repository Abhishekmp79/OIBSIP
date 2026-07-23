/**
 * VerifyEmail — calls /verify/:token when the route loads.
 */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../api';

export function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.verifyEmail(token!);
        if (!active) return;
        setMessage(data.message);
        setState('success');
      } catch (err: any) {
        if (!active) return;
        setMessage(err.message || 'Verification failed');
        setState('error');
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      {state === 'loading' && (
        <>
          <div className="animate-bounce text-5xl">🍕</div>
          <p className="mt-4 text-charcoal/70">Verifying your email…</p>
        </>
      )}
      {state === 'success' && (
        <div className="card animate-pop w-full p-8">
          <CheckCircle2 size={56} className="mx-auto text-sage" />
          <h1 className="mt-4 font-serif text-2xl font-bold">Email verified!</h1>
          <p className="mt-2 text-charcoal/70">{message}</p>
          <Link to="/login" className="btn-primary mt-6">
            Go to login
          </Link>
        </div>
      )}
      {state === 'error' && (
        <div className="card animate-pop w-full p-8">
          <XCircle size={56} className="mx-auto text-primary" />
          <h1 className="mt-4 font-serif text-2xl font-bold">Verification failed</h1>
          <p className="mt-2 text-charcoal/70">{message}</p>
          <Link to="/register" className="btn-primary mt-6">
            Back to register
          </Link>
        </div>
      )}
    </div>
  );
}
