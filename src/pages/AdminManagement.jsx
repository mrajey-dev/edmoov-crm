import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  UserPlus,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Search,
  Key,
  GraduationCap,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminManagement() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Current logged in user
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://127.0.0.1:8000/api/admin/users');
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching admins:', err);
      showNotification('error', 'Failed to load admins list. Ensure you are logged in as Super Admin.');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name || '',
      username: admin.username || '',
      email: admin.email || '',
      password: '',
      confirmPassword: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (!editingAdmin) {
      if (!formData.password) {
        setFormError('Password is required for new admin.');
        return;
      }
      if (formData.password.length < 4) {
        setFormError('Password must be at least 4 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
    } else {
      if (formData.password && formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      if (editingAdmin) {
        const payload = {
          name: formData.name,
          username: formData.username,
          email: formData.email,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await axios.put(`http://127.0.0.1:8000/api/admin/users/${editingAdmin.id}`, payload);
        showNotification('success', `Admin "${formData.name}" updated successfully.`);
      } else {
        await axios.post('http://127.0.0.1:8000/api/admin/users', {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        showNotification('success', `New Admin "${formData.name}" created successfully!`);
      }

      setIsModalOpen(false);
      fetchAdmins();
    } catch (err) {
      console.error('Error saving admin:', err);
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setFormError(firstError);
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('An error occurred while saving the admin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (admin.id === currentUser.id) {
      alert('You cannot delete your own Super Admin account.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete admin "${admin.name}" (@${admin.username})? This action cannot be undone.`)) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/admin/users/${admin.id}`);
        showNotification('success', `Admin "${admin.name}" deleted.`);
        fetchAdmins();
      } catch (err) {
        console.error('Failed to delete admin:', err);
        showNotification('error', err.response?.data?.message || 'Failed to delete admin.');
      }
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const q = searchTerm.toLowerCase();
    return (
      (admin.name && admin.name.toLowerCase().includes(q)) ||
      (admin.username && admin.username.toLowerCase().includes(q)) ||
      (admin.email && admin.email.toLowerCase().includes(q))
    );
  });

  const totalLeads = admins.reduce((sum, a) => sum + (a.leads_count || 0) + (a.raw_leads_count || 0), 0);
  const totalStudents = admins.reduce((sum, a) => sum + (a.students_count || 0), 0);

  return (
    <div className="admin-management-page fadeIn" style={{ padding: '0.5rem 0' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '0.85rem 1.4rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Total Admins</span>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#0f172a' }}>{admins.length}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Total Leads Managed</span>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#0f172a' }}>{totalLeads}</h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Applicants Enrolled</span>
            <h3 style={{ margin: 0, fontSize: '1.6rem', color: '#0f172a' }}>{totalStudents}</h3>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Create New Admin */}
      <div className="card" style={{
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '450px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search admins by name, username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <button
          className="primary-btn"
          onClick={handleOpenCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #ff4500, #ff6b3d)',
            color: 'white',
            fontWeight: 600,
            padding: '0.65rem 1.25rem',
            borderRadius: '8px'
          }}
        >
          <UserPlus size={18} /> Create New Admin
        </button>
      </div>

      {/* Admins Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Administrator</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Leads Assigned</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Applicants</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Created</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Loading administrators...
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No administrators found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map(admin => {
                  const isSuper = admin.role === 'super_admin';
                  const isSelf = admin.id === currentUser.id;

                  return (
                    <tr key={admin.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: isSuper ? 'linear-gradient(135deg, #ff4500, #f59e0b)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1rem'
                          }}>
                            {admin.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {admin.name}
                              {isSelf && (
                                <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                              @{admin.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        {isSuper ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '999px',
                            background: '#fef3c7',
                            color: '#b45309',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}>
                            <ShieldCheck size={14} /> Super Admin
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '999px',
                            background: '#e0e7ff',
                            color: '#4338ca',
                            fontWeight: 600,
                            fontSize: '0.8rem'
                          }}>
                            <User size={14} /> Admin
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.9rem' }}>
                        {admin.email}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {(admin.leads_count || 0) + (admin.raw_leads_count || 0)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '4px' }}>leads</span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {admin.students_count || 0}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '4px' }}>applicants</span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: '#64748b', fontSize: '0.85rem' }}>
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEditModal(admin)}
                            title="Edit Admin"
                            style={{
                              border: 'none',
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '0.45rem',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={16} />
                          </button>

                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteAdmin(admin)}
                              title="Delete Admin"
                              style={{
                                border: 'none',
                                background: '#fee2e2',
                                color: '#ef4444',
                                padding: '0.45rem',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Admin Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="slideUp" style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff4500, #ff6b3d)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {editingAdmin ? <Edit2 size={18} /> : <UserPlus size={18} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
                    {editingAdmin ? `Edit Admin: ${editingAdmin.name}` : 'Create New Admin'}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {editingAdmin ? 'Update administrator credentials & details' : 'Grant access to a new CRM administrator'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {formError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Username *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700 }}>
                    @
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="johndoe (letters, numbers, dashes)"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    required
                    placeholder="john@edmoov.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  {editingAdmin ? 'Change Password (leave empty to keep existing)' : 'Password *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={editingAdmin ? 'New password (optional)' : 'Minimum 4 characters'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {(formData.password || !editingAdmin) && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Confirm Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 1rem 0.65rem 2.4rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem'
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="primary-btn"
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ff4500, #ff6b3d)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Saving...' : (editingAdmin ? 'Update Admin' : 'Create Admin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
