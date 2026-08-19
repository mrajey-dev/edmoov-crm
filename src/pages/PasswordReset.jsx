import React, { useState } from 'react';
import { Key, Lock, Save, Eye, EyeOff } from 'lucide-react';

export default function PasswordReset() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError('');
    setIsSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="card fadeIn" style={{ maxWidth: '600px', margin: '0 auto', minHeight: '500px' }}>
      <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Key size={24} className="text-primary" /> Password Reset
        </h2>
      </div>

      <div style={{ padding: '0 1rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Ensure your account is using a long, random password to stay secure.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Current Password</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showCurrent ? "text" : "password"} 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 3rem 0.6rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>New Password</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showNew ? "text" : "password"} 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 3rem 0.6rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confirm New Password</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showNew ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 3rem 0.6rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                required
              />
            </div>
          </div>

          {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>{error}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} /> Update Password
            </button>
            {isSaved && <span style={{ color: 'var(--accent-green)', fontSize: '0.9rem', fontWeight: 600 }} className="fadeIn">Password successfully updated!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
