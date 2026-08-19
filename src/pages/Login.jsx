import React, { useState } from 'react';
import { Lock, User, ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay for the loader
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        onLogin();
        navigate('/');
      } else {
        setError('Invalid credentials. Hint: admin / admin');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="login-page">
      <div className="login-card fadeIn slideUp">
        <div className="login-header">
          <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 15 H75 V30 H45 V45 H70 V60 H45 V75 H75 V90 H25 Z" fill="#ff4500" />
              <path d="M10 70 Q 40 -10 90 20 Q 50 10 10 70 Z" fill="#facc15" />
              <path d="M40 50 Q 70 25 95 35 Q 70 40 40 50 Z" fill="#3b82f6" />
            </svg>
            <span style={{ color: '#2c82c9', fontWeight: 800, letterSpacing: '2px', fontSize: '2rem' }}>EDMOOV</span>
          </div>
          <h2>Admin Portal</h2>
          <p>Please sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                placeholder="Enter admin" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
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
  );
}
