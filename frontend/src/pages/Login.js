import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20,
      background: 'radial-gradient(ellipse at top, rgba(239,68,68,0.08) 0%, var(--bg) 60%)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>❤️‍🔥</div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text2)' }}>Sign in to manage your LifeQR profile</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email address</label>
              <input
                type="email" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required autoFocus
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                fontSize: 14, color: 'var(--red-light)'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><div className="spinner" />Signing in...</> : '→ Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text2)', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--red-light)', fontWeight: 600, textDecoration: 'none' }}>
            Create LifeQR
          </Link>
        </p>
      </div>
    </div>
  );
}
