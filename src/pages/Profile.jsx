import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, UserCircle } from 'lucide-react';

export default function Profile() {
  const [formData, setFormData] = useState({
    name: 'Admin',
    email: 'admin@edmoov.com',
    phone: '+1 (555) 000-1234',
    location: 'New York, USA',
    bio: 'Lead Administrator for EDMOOV University Counseling Platform.'
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="card fadeIn" style={{ maxWidth: '800px', margin: '0 auto', minHeight: '600px' }}>
      <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserCircle size={24} className="text-primary" /> My Profile
        </h2>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Profile Sidebar */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-main), #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <UserCircle size={80} style={{ opacity: 0.9 }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem' }}>{formData.name}</h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Administrator</span>
          </div>
          <button className="icon-btn" style={{ background: 'var(--primary-main)', color: 'white', width: '100%', borderRadius: '6px', fontSize: '0.9rem' }}>
            Change Photo
          </button>
        </div>

        {/* Profile Form */}
        <div style={{ flex: '2 1 400px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Phone Number</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Location</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bio</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                style={{ width: '100%', padding: '0.6rem 1rem', border: '1px solid var(--border-color)', borderRadius: '6px', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> Save Changes
              </button>
              {isSaved && <span style={{ color: 'var(--accent-green)', fontSize: '0.9rem', fontWeight: 600 }} className="fadeIn">Successfully updated!</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
