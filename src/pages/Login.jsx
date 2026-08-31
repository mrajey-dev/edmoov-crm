import React, { useState } from 'react';
import { Lock, User, ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        username,
        password
      });

      const data = response.data;
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('edmoov_admin_auth', 'true');
        // Set default header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        if (onLogin) {
          onLogin(data.user);
        }
        navigate('/');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container slideUp">
        {/* Left Panel: Hero Image & Branding */}
        <div className="login-left-panel">
          <div className="login-left-content">
            <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 15 H75 V30 H45 V45 H70 V60 H45 V75 H75 V90 H25 Z" fill="#ff4500" />
                <path d="M10 70 Q 40 -10 90 20 Q 50 10 10 70 Z" fill="#facc15" />
                <path d="M40 50 Q 70 25 95 35 Q 70 40 40 50 Z" fill="#3b82f6" />
              </svg>
              <span style={{ color: 'white', fontWeight: 800, letterSpacing: '2px', fontSize: '2.5rem' }}>EDMOOV</span>
            </div>
            <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
              Empowering Global Ambitions.
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', maxWidth: '400px', lineHeight: 1.5 }}>
              Manage applications, track leads, and streamline the entire study abroad journey from a single, powerful platform.
            </p>
          </div>
          <div className="login-image-overlay"></div>
        </div>

        {/* Right Panel: Form */}
        <div className="login-right-panel">
          <div className="login-form-wrapper">
            <div className="login-header">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#fff7ed',
                border: '1px solid #ffedd5',
                color: '#c2410c',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.85rem'
              }}>
                <ShieldCheck size={14} /> Super Admin & Admin Portal
              </div>
              <h2>Welcome Back</h2>
              <p>Sign in to access your CRM dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Enter username (e.g. admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="loader-education">
                    <GraduationCap size={22} className="spin-cap" /> Authenticating...
                  </span>
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
