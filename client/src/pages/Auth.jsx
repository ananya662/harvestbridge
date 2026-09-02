import { useState } from 'react';
import './Auth.css';

const API_URL = 'https://harvestbridge-vuh8.onrender.com/api/auth';

export default function Auth({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('role');
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const goToForm = (selectedRole) => {
    setRole(selectedRole);
    setStep('form');
    setError('');
  };

  const goToConfirm = (e) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Signup failed');
        setStep('form');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setStep('success');
      if (onSuccess) setTimeout(onSuccess, 1200);
    } catch {
      setError('Could not reach the server. Is the backend running?');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setForm({ ...form, name: data.user.name });
      setStep('success');
      if (onSuccess) setTimeout(onSuccess, 1200);
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">HarvestBridge</span>
          <p className="auth-tagline">Sell your harvest directly, no middlemen</p>
        </div>

        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setMode('login'); setStep('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => { setMode('signup'); setStep('role'); setError(''); }}
          >
            Sign up
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {mode === 'login' && step !== 'success' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com" onChange={handleChange} required />
            <label>Password</label>
            <input type="password" name="password" placeholder="Enter password" onChange={handleChange} required />
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {mode === 'signup' && step === 'role' && (
          <div className="auth-role-select">
            <p className="auth-step-label">Choose your role</p>
            <button className="auth-role-card" onClick={() => goToForm('farmer')}>
              <span className="auth-role-icon">🌾</span>
              <span>Farmer</span>
              <span className="auth-role-sub">Sell your produce</span>
            </button>
            <button className="auth-role-card" onClick={() => goToForm('buyer')}>
              <span className="auth-role-icon">🛒</span>
              <span>Buyer</span>
              <span className="auth-role-sub">Buy fresh produce</span>
            </button>
          </div>
        )}

        {mode === 'signup' && step === 'form' && (
          <form className="auth-form" onSubmit={goToConfirm}>
            <button type="button" className="auth-back" onClick={() => setStep('role')}>← Back</button>
            <label>Full name</label>
            <input type="text" name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} required />
            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            <label>Phone number</label>
            <input type="tel" name="phone" placeholder="10-digit number" value={form.phone} onChange={handleChange} required />
            <label>Location</label>
            <input type="text" name="location" placeholder="Village, district" value={form.location} onChange={handleChange} required />
            <label>Password</label>
            <input type="password" name="password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
            <button type="submit" className="auth-btn-primary">Continue</button>
          </form>
        )}

        {mode === 'signup' && step === 'confirm' && (
          <div className="auth-confirm">
            <button type="button" className="auth-back" onClick={() => setStep('form')}>← Edit</button>
            <p className="auth-step-label">Review your details</p>
            <div className="auth-confirm-row"><span>Role</span><span>{role === 'farmer' ? 'Farmer' : 'Buyer'}</span></div>
            <div className="auth-confirm-row"><span>Name</span><span>{form.name}</span></div>
            <div className="auth-confirm-row"><span>Email</span><span>{form.email}</span></div>
            <div className="auth-confirm-row"><span>Phone</span><span>{form.phone}</span></div>
            <div className="auth-confirm-row"><span>Location</span><span>{form.location}</span></div>
            <button className="auth-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating account...' : 'Confirm and create account'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="auth-success">
            <div className="auth-check">✓</div>
            <p className="auth-success-title">
              {mode === 'signup' ? 'Account created!' : 'Logged in!'}
            </p>
            <p className="auth-success-sub">
              {mode === 'signup' ? `Welcome to HarvestBridge, ${form.name || 'there'}` : `Welcome back, ${form.name || ''}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}