import React, { useState, useEffect } from 'react';
import { Users, Filter, X, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function AdminFilterBar({ selectedAdminId, onChange }) {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://127.0.0.1:8000/api/admin/users-list');
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch admin list for filter:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAdmin = admins.find(a => String(a.id) === String(selectedAdminId));

  return (
    <div className="admin-filter-bar fadeIn" style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '0.65rem 1.2rem',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.85rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: selectedAdminId ? '#eef2ff' : '#f1f5f9',
          color: selectedAdminId ? '#4f46e5' : '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Filter size={16} />
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', display: 'block' }}>
            Super Admin View Filter
          </span>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b' }}>
            {selectedAdmin ? `Viewing data for ${selectedAdmin.name} (@${selectedAdmin.username})` : 'Global CRM View (All Admins)'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedAdminId || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={isLoading}
            style={{
              padding: '0.45rem 2rem 0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: 'white',
              fontSize: '0.88rem',
              fontWeight: 500,
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '210px'
            }}
          >
            <option value="">All Admins (Entire CRM)</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.name} (@{admin.username}) {admin.role === 'super_admin' ? '★ Super Admin' : ''}
              </option>
            ))}
          </select>
        </div>

        {selectedAdminId && (
          <button
            onClick={() => onChange(null)}
            title="Reset to All Admins"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#ef4444',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <X size={14} /> Clear Filter
          </button>
        )}
      </div>
    </div>
  );
}
