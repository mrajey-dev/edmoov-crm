import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Briefcase, Search, Loader2, Building, Globe, Calendar, Percent, Users, Layout, MapPin, Link2, CheckCircle, AlignLeft, Info } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/universities';

export default function Universities() {
  const [universities, setUniversities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingUniversity, setViewingUniversity] = useState(null);
  const [editingUniversity, setEditingUniversity] = useState(null);
  
  const defaultForm = {
    name: '', country: '', city: '', rank: '', status: 'Active',
    established_year: '', acceptance_rate: '', international_students: '',
    campus_facilities: '', description: '', website: ''
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchUniversities();
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await axios.get('https://countriesnow.space/api/v0.1/countries');
      const countryNames = res.data.data.map(c => c.country).sort();
      setCountries(countryNames);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchUniversities = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URL);
      setUniversities(res.data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (university = null) => {
    if (university) {
      setEditingUniversity(university);
      setFormData(university);
    } else {
      setEditingUniversity(null);
      setFormData(defaultForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUniversity(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUniversity) {
        await axios.put(`${API_URL}/${editingUniversity.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      fetchUniversities();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving university:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this university?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchUniversities();
      } catch (error) {
        console.error('Error deleting university:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <span className="stat-badge positive">Active</span>;
      case 'Pending': return <span className="stat-badge negative">Pending</span>;
      case 'Inactive': return <span className="stat-badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>Inactive</span>;
      default: return <span className="stat-badge">{status}</span>;
    }
  };

  const filteredUniversities = universities.filter(uni => 
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card" style={{ minHeight: '600px' }}>
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search universities..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New University
        </button>
      </div>
      
      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
          <thead>
            <tr>
              <th>University Name</th>
              <th>Location</th>
              <th>Global Rank</th>
              <th>Est. Year</th>
              <th>Acceptance Rate</th>
              <th>Int'l Students</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', position: 'sticky', right: 0, background: 'white', zIndex: 1 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                    <Loader2 size={40} className="spinner" style={{ color: 'var(--primary-main)' }} />
                    <span>Loading university data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUniversities.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  No universities found.
                </td>
              </tr>
            ) : (
              filteredUniversities.map(uni => (
                <tr key={uni.id}>
                  <td 
                    style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--primary-main)' }}
                    onClick={() => setViewingUniversity(uni)}
                  >
                  <div className="stat-icon blue" style={{ width: 32, height: 32, padding: 0, flexShrink: 0 }}>
                    <Building size={16} />
                  </div>
                  <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{uni.name}</span>
                </td>
                <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {uni.city ? `${uni.city}, ` : ''}{uni.country}
                </td>
                <td>{uni.rank || '-'}</td>
                <td>{uni.established_year || '-'}</td>
                <td>{uni.acceptance_rate || '-'}</td>
                <td>{uni.international_students || '-'}</td>
                <td>{getStatusBadge(uni.status)}</td>
                <td style={{ textAlign: 'right', position: 'sticky', right: 0, background: 'white', zIndex: 1, boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>
                  <button className="action-btn" onClick={() => handleOpenModal(uni)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(uni.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay fadeIn">
          <div className="modal-content slideUp" style={{ padding: 0, overflow: 'hidden', maxWidth: '600px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            {/* Modal Header */}
            <div className="profile-header">
              <div className="profile-cover" style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)', height: '100px' }}></div>
              <button className="profile-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
              <div className="profile-avatar-wrapper" style={{ bottom: '-24px', left: '1.5rem', width: '48px', height: '48px' }}>
                <Briefcase size={24} color="var(--primary-main)" />
              </div>
            </div>

            <div className="profile-body" style={{ padding: '2rem 1.5rem 1.5rem 1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                  {editingUniversity ? 'Edit University Details' : 'Add New University'}
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
                  {editingUniversity ? 'Update the partnership information for this institution.' : 'Enter the details below to add a new partner university.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                
                {/* Overview Section */}
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={16} /> Overview
                  </h3>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>University Name</label>
                    <input required type="text" name="name" className="form-input" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g. Oxford University" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Country</label>
                      <select required name="country" className="form-select" value={formData.country || ''} onChange={handleInputChange}>
                        <option value="">Select Country</option>
                        {countries.length > 0 ? countries.map((country, idx) => (
                          <option key={idx} value={country}>{country}</option>
                        )) : (
                          <>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>City</label>
                      <input type="text" name="city" className="form-input" value={formData.city || ''} onChange={handleInputChange} placeholder="e.g. London" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Website</label>
                      <input type="text" name="website" className="form-input" value={formData.website || ''} onChange={handleInputChange} placeholder="e.g. www.ox.ac.uk" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</label>
                      <select name="status" className="form-select" value={formData.status || 'Active'} onChange={handleInputChange}>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Academics Section */}
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layout size={16} /> Academics & Stats
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Global Rank</label>
                      <input type="text" name="rank" className="form-input" value={formData.rank || ''} onChange={handleInputChange} placeholder="e.g. #1 Global" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Established Year</label>
                      <input type="text" name="established_year" className="form-input" value={formData.established_year || ''} onChange={handleInputChange} placeholder="e.g. 1096" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Acceptance Rate</label>
                      <input type="text" name="acceptance_rate" className="form-input" value={formData.acceptance_rate || ''} onChange={handleInputChange} placeholder="e.g. 17.5%" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Int'l Students %</label>
                      <input type="text" name="international_students" className="form-input" value={formData.international_students || ''} onChange={handleInputChange} placeholder="e.g. 45%" />
                    </div>
                  </div>
                </div>

                {/* Description & Facilities */}
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={16} /> Campus Details
                  </h3>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Campus Facilities</label>
                    <input type="text" name="campus_facilities" className="form-input" value={formData.campus_facilities || ''} onChange={handleInputChange} placeholder="e.g. Library, Sports Complex..." />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Description</label>
                    <textarea name="description" className="form-input" value={formData.description || ''} onChange={handleInputChange} placeholder="Detailed overview of the university..." style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="secondary-btn" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="primary-btn" style={{ backgroundColor: 'var(--primary-main)', color: 'white', padding: '0.75rem 1.5rem' }}>
                    {editingUniversity ? 'Save Changes' : 'Add University'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* View University Modal */}
      {viewingUniversity && (
        <div className="modal-overlay fadeIn">
          <div className="modal-content slideUp" style={{ padding: 0, overflow: 'hidden', maxWidth: '800px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            {/* Modal Header */}
            <div className="profile-header">
              <div className="profile-cover" style={{ background: 'linear-gradient(135deg, #f43f5e, #fb7185)', height: '120px' }}></div>
              <button className="profile-close-btn" onClick={() => setViewingUniversity(null)}>
                <X size={20} />
              </button>
              <div className="profile-avatar-wrapper" style={{ bottom: '-30px', left: '2rem', width: '80px', height: '80px', border: '4px solid white', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                <Building size={40} color="var(--accent-red)" />
              </div>
            </div>

            <div className="profile-body" style={{ padding: '3rem 2rem 2rem 2rem', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--primary-dark)' }}>{viewingUniversity.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={16} /> {viewingUniversity.city ? `${viewingUniversity.city}, ` : ''}{viewingUniversity.country}
                    </span>
                    {viewingUniversity.website && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Link2 size={16} /> <a href={`https://${viewingUniversity.website}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-main)', textDecoration: 'none' }}>{viewingUniversity.website}</a>
                      </span>
                    )}
                  </div>
                </div>
                {getStatusBadge(viewingUniversity.status)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Academics & Ranking */}
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layout size={16} /> Academics & Ranking
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Global Rank</span>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-main)' }}>{viewingUniversity.rank || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Established</span>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{viewingUniversity.established_year || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Admission Stats */}
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} /> Admission Stats
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Acceptance Rate</span>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{viewingUniversity.acceptance_rate || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Int'l Students</span>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{viewingUniversity.international_students || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campus Facilities */}
              <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> Campus Facilities
                </h3>
                <p style={{ color: 'var(--text-main)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
                  {viewingUniversity.campus_facilities || 'Facilities information not provided.'}
                </p>
              </div>

              {/* Description Section */}
              <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlignLeft size={16} /> Description
                </h3>
                <p style={{ color: 'var(--text-main)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {viewingUniversity.description || 'No description provided for this university.'}
                </p>
              </div>
            </div>

            <div className="form-actions" style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff' }}>
              <button className="secondary-btn" onClick={() => { setViewingUniversity(null); handleOpenModal(viewingUniversity); }}>
                <Edit2 size={16} style={{ marginRight: '0.5rem' }} /> Edit University
              </button>
              <button className="primary-btn" onClick={() => setViewingUniversity(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
