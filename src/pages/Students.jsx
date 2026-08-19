import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, User, Search, Loader2, Mail, Phone, MapPin, Activity, FileText, Download, GraduationCap } from 'lucide-react';
import axios from 'axios';

const BASE_API_URL = 'http://127.0.0.1:8000/api';

const maxDob = new Date();
maxDob.setFullYear(maxDob.getFullYear() - 18);
const maxDobString = maxDob.toISOString().split('T')[0];

export default function Students({ isApplicationsPage = false }) {
  const API_URL = isApplicationsPage ? `${BASE_API_URL}/applications` : `${BASE_API_URL}/students`;
  
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const defaultForm = { 
    name: '', email: '', phone: '', program: '', status: 'Active',
    dob: '', passport_number: '', address: '',
    highest_qualification: '', passing_year: '', grades_percentage: '', english_proficiency: '',
    parents_occupation: '', family_annual_income: '',
    finance_source: 'Self-funded',
    preferred_country: '', preferred_college: '', preferred_course: '',
    enrolled_date: ''
  };
  const [formData, setFormData] = useState(defaultForm);
  const [documents, setDocuments] = useState([]);

  const handleAddDocument = () => setDocuments([...documents, { name: '', file: null }]);
  const handleRemoveDocument = (index) => setDocuments(documents.filter((_, i) => i !== index));
  const handleDocumentChange = (index, field, value) => {
    const newDocs = [...documents];
    newDocs[index][field] = value;
    setDocuments(newDocs);
  };

  useEffect(() => {
    fetchStudents();
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

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URL);
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (student = null) => {
    setActiveTab('personal');
    if (student) {
      setEditingStudent(student);
      setFormData({ ...defaultForm, ...student });
      setDocuments([]); // Start with clean slate for new uploads
    } else {
      setEditingStudent(null);
      setFormData(defaultForm);
      setDocuments([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'personal') {
      setActiveTab('education');
      return;
    }
    if (activeTab === 'education') {
      setActiveTab('study');
      return;
    }
    if (activeTab === 'study') {
      setActiveTab('documents');
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      
      documents.forEach(doc => {
        if (doc.file) {
          data.append('documents[]', doc.file);
          data.append('document_names[]', doc.name || doc.file.name);
        }
      });

      if (editingStudent) {
        data.append('_method', 'PUT');
        await axios.post(`${API_URL}/${editingStudent.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
      } else {
        await axios.post(API_URL, data, { headers: { 'Content-Type': 'multipart/form-data' }});
      }
      fetchStudents();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const getStatusBadge = (status, leadType) => {
    const displayStatus = leadType || status;
    if (!displayStatus) return <span className="stat-badge">-</span>;
    
    switch (displayStatus.toLowerCase()) {
      case 'hot': return <span className="stat-badge" style={{ backgroundColor: '#ff450020', color: '#ff4500' }}>Hot</span>;
      case 'warm': return <span className="stat-badge" style={{ backgroundColor: '#facc1520', color: '#b45309' }}>Warm</span>;
      case 'cold': return <span className="stat-badge" style={{ backgroundColor: '#3b82f620', color: '#1d4ed8' }}>Cold</span>;
      case 'approved': return <span className="stat-badge" style={{ backgroundColor: '#10b98120', color: '#047857' }}>Approved</span>;
      case 'dead': return <span className="stat-badge" style={{ backgroundColor: '#64748b20', color: '#334155' }}>Dead</span>;
      case 'active': return <span className="stat-badge positive">Active</span>;
      case 'pending': return <span className="stat-badge negative">Pending</span>;
      case 'graduated': return <span className="stat-badge" style={{ backgroundColor: '#dbeafe', color: '#1e3a8a' }}>Graduated</span>;
      default: return <span className="stat-badge" style={{ textTransform: 'capitalize' }}>{displayStatus}</span>;
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card" style={{ minHeight: '600px' }}>
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div className="search-container">
          <Search size={18} className="search-icon" color="var(--text-muted)" />
          <input 
            type="text" 
            className="search-input"
            placeholder={isApplicationsPage ? "Search applications..." : "Search students..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {!isApplicationsPage && (
          <button className="primary-btn" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add New Student
          </button>
        )}
      </div>
      
      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Program</th>
              <th>DOB</th>
              <th>Passport</th>
              <th>Address</th>
              <th>Qualification</th>
              <th>Passing Year</th>
              <th>Grades</th>
              <th>English Prof.</th>
              <th>Parents Occ.</th>
              <th>Fam. Income</th>
              <th>Fin. Source</th>
              <th>Pref. Country</th>
              <th>Pref. College</th>
              <th>Pref. Course</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', position: 'sticky', right: 0, background: 'white', zIndex: 1 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="19" style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                    <Loader2 size={40} className="spinner" style={{ color: 'var(--primary-main)' }} />
                    <span>Loading student data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="19" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  {isApplicationsPage ? "No approved applications found." : "No students found."}
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td 
                  style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--primary-main)' }} 
                  onClick={() => setViewingStudent(student)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="stat-icon blue" style={{ width: 32, height: 32, padding: 0 }}>
                      <User size={16} />
                    </div>
                    {student.name}
                  </div>
                </td>
                <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.program}</td>
                <td>{student.dob || '-'}</td>
                <td>{student.passport_number || '-'}</td>
                <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.address || '-'}</td>
                <td>{student.highest_qualification || '-'}</td>
                <td>{student.passing_year || '-'}</td>
                <td>{student.grades_percentage || '-'}</td>
                <td>{student.english_proficiency || '-'}</td>
                <td>{student.parents_occupation || '-'}</td>
                <td>{student.family_annual_income || '-'}</td>
                <td>{student.finance_source || '-'}</td>
                <td>{student.preferred_country || '-'}</td>
                <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.preferred_college || '-'}</td>
                <td>{student.preferred_course || '-'}</td>
                <td>{getStatusBadge(student.status, student.lead_type)}</td>
                <td style={{ textAlign: 'right', position: 'sticky', right: 0, background: 'white', zIndex: 1, boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>
                  <button className="action-btn" onClick={() => handleOpenModal(student)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(student.id)}>
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
              <div className="profile-cover" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', height: '100px' }}></div>
              <button className="profile-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
              <div className="profile-avatar-wrapper" style={{ bottom: '-24px', left: '1.5rem', width: '48px', height: '48px' }}>
                <User size={24} color="var(--primary-main)" />
              </div>
            </div>

            <div className="profile-body" style={{ padding: '2rem 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                  {editingStudent ? 'Edit Student Details' : 'Add New Student'}
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
                  Complete the student's profile for their study abroad application.
                </p>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <button 
                  type="button"
                  style={{ background: 'none', border: 'none', padding: '0.5rem 0', borderBottom: activeTab === 'personal' ? '2px solid var(--primary-main)' : '2px solid transparent', color: activeTab === 'personal' ? 'var(--primary-main)' : 'var(--text-muted)', fontWeight: activeTab === 'personal' ? 600 : 500, cursor: 'pointer' }}
                  onClick={() => setActiveTab('personal')}
                >Personal</button>
                <button 
                  type="button"
                  style={{ background: 'none', border: 'none', padding: '0.5rem 0', borderBottom: activeTab === 'education' ? '2px solid var(--primary-main)' : '2px solid transparent', color: activeTab === 'education' ? 'var(--primary-main)' : 'var(--text-muted)', fontWeight: activeTab === 'education' ? 600 : 500, cursor: 'pointer' }}
                  onClick={() => setActiveTab('education')}
                >Education & Family</button>
                <button 
                  type="button"
                  style={{ background: 'none', border: 'none', padding: '0.5rem 0', borderBottom: activeTab === 'study' ? '2px solid var(--primary-main)' : '2px solid transparent', color: activeTab === 'study' ? 'var(--primary-main)' : 'var(--text-muted)', fontWeight: activeTab === 'study' ? 600 : 500, cursor: 'pointer' }}
                  onClick={() => setActiveTab('study')}
                >Study & Finance</button>
                <button 
                  type="button"
                  style={{ background: 'none', border: 'none', padding: '0.5rem 0', borderBottom: activeTab === 'documents' ? '2px solid var(--primary-main)' : '2px solid transparent', color: activeTab === 'documents' ? 'var(--primary-main)' : 'var(--text-muted)', fontWeight: activeTab === 'documents' ? 600 : 500, cursor: 'pointer' }}
                  onClick={() => setActiveTab('documents')}
                >Documents</button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={{ overflowY: 'auto', paddingRight: '0.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {activeTab === 'personal' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Full Name</label>
                          <input required type="text" name="name" className="form-input" value={formData.name || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Email Address</label>
                          <input required type="email" name="email" className="form-input" value={formData.email || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Phone Number</label>
                          <input required type="text" name="phone" className="form-input" value={formData.phone || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date of Birth (18+ Only)</label>
                          <input type="date" name="dob" max={maxDobString} className="form-input" value={formData.dob || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Passport Number</label>
                          <input type="text" name="passport_number" className="form-input" value={formData.passport_number || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Enrollment Status</label>
                          <select name="status" className="form-select" value={formData.status || 'Active'} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }}>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Graduated">Graduated</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Full Address</label>
                        <textarea name="address" className="form-input" value={formData.address || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc', minHeight: '60px' }}></textarea>
                      </div>
                    </>
                  )}

                  {activeTab === 'education' && (
                    <>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Education Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Highest Qualification</label>
                          <input type="text" name="highest_qualification" className="form-input" value={formData.highest_qualification || ''} onChange={handleInputChange} placeholder="e.g. Bachelor's Degree" style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Passing Year</label>
                          <input type="text" name="passing_year" className="form-input" value={formData.passing_year || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Grades / Percentage</label>
                          <input type="text" name="grades_percentage" className="form-input" value={formData.grades_percentage || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>English Proficiency</label>
                          <input type="text" name="english_proficiency" className="form-input" value={formData.english_proficiency || ''} onChange={handleInputChange} placeholder="e.g. IELTS 7.5" style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                      </div>
                      
                      <h4 style={{ margin: '1rem 0 0 0', fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Family Background</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Parents' Occupation</label>
                          <input type="text" name="parents_occupation" className="form-input" value={formData.parents_occupation || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Annual Income</label>
                          <input type="text" name="family_annual_income" className="form-input" value={formData.family_annual_income || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'study' && (
                    <>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Study Preferences</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Preferred Country</label>
                          <select name="preferred_country" className="form-select" value={formData.preferred_country || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }}>
                            <option value="">Select Country</option>
                            {countries.length > 0 ? countries.map((country, idx) => (
                              <option key={idx} value={country}>{country}</option>
                            )) : (
                              <>
                                <option value="USA">USA</option>
                                <option value="UK">UK</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                                <option value="Germany">Germany</option>
                                <option value="Other">Other</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Preferred Course</label>
                          <input type="text" name="preferred_course" className="form-input" value={formData.preferred_course || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Preferred College / University</label>
                        <input type="text" name="preferred_college" className="form-input" value={formData.preferred_college || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                      </div>
                      
                      <h4 style={{ margin: '1rem 0 0 0', fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Finance & Dashboard</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Source of Finance</label>
                          <select name="finance_source" className="form-select" value={formData.finance_source || 'Self-funded'} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }}>
                            <option value="Self-funded">Self-funded</option>
                            <option value="Education Loan">Education Loan</option>
                            <option value="Sponsorship">Sponsorship</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>General Program Title (Table View)</label>
                          <input type="text" name="program" className="form-input" value={formData.program || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Enrolled Date</label>
                          <input type="date" name="enrolled_date" className="form-input" value={formData.enrolled_date || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'documents' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Student Documents</h4>
                        <button type="button" className="secondary-btn" onClick={handleAddDocument} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Plus size={14} /> Add Document
                        </button>
                      </div>
                      
                      {documents.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                          No documents added yet. Click the button above to upload.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {documents.map((doc, index) => (
                            <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                              <div style={{ flex: 1 }}>
                                <input type="text" className="form-input" placeholder="Document Name (e.g., Passport)" value={doc.name} onChange={(e) => handleDocumentChange(index, 'name', e.target.value)} required style={{ backgroundColor: 'white' }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <input type="file" className="form-input" onChange={(e) => handleDocumentChange(index, 'file', e.target.files[0])} required style={{ backgroundColor: 'white', padding: '0.4rem' }} />
                              </div>
                              <button type="button" onClick={() => handleRemoveDocument(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                </div>

                <div className="form-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <button type="button" className="secondary-btn" onClick={handleCloseModal}>Cancel</button>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {activeTab !== 'personal' && (
                      <button type="button" className="secondary-btn" onClick={() => setActiveTab(activeTab === 'documents' ? 'study' : activeTab === 'study' ? 'education' : 'personal')}>
                        Back
                      </button>
                    )}
                    <button type="submit" className="primary-btn" style={{ backgroundColor: 'var(--primary-main)', color: 'white', padding: '0.75rem 1.5rem' }}>
                      {activeTab !== 'documents' ? 'Next' : (editingStudent ? 'Save Changes' : 'Add Student')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {viewingStudent && (
        <div className="modal-overlay fadeIn">
          <div className="modal-content slideUp" style={{ maxWidth: '800px', padding: '2.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary-main), var(--primary-dark))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                  <User size={36} />
                </div>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: 'var(--text-main)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {viewingStudent.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Activity size={16} /> ID: #{viewingStudent.id}</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-color)' }}></span>
                    <span>Enrolled: {viewingStudent.enrolled_date ? new Date(viewingStudent.enrolled_date).toLocaleDateString() : (new Date(viewingStudent.created_at).toLocaleDateString() || 'Recently')}</span>
                  </div>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setViewingStudent(null)} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '8px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '2rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '1rem' }}>
              
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} /> Personal & Contact
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Email Address</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.email || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Phone Number</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.phone || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Date of Birth</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.dob || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Passport</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.passport_number || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Home Address</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.address || '-'}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={18} /> Education & Family
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Highest Qualification</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.highest_qualification || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Passing Year</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.passing_year || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Grades (%)</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.grades_percentage || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>English Proficiency</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.english_proficiency || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Parents' Occupation</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.parents_occupation || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Family Income</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.family_annual_income || '-'}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} /> Study Preferences & Finance
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Pref. Country</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.preferred_country || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Pref. College</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.preferred_college || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Pref. Course</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.preferred_course || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Enrolled Program</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.program || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Finance Source</span>
                    <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{viewingStudent.finance_source || '-'}</p>
                  </div>
                  <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', display: 'block', fontWeight: 600 }}>Application Status</span>
                    <div style={{ marginTop: '0.25rem' }}>{getStatusBadge(viewingStudent.status)}</div>
                  </div>
                </div>
              </div>

              {viewingStudent.documents && viewingStudent.documents.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} /> Uploaded Documents
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {viewingStudent.documents.map((doc, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <FileText size={20} color="var(--primary-main)" />
                          <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{doc.document_name}</span>
                        </div>
                        <a href={`http://127.0.0.1:8000/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                          <Download size={16} /> View/Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} /> Activity History
                </h3>
                <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-main)', marginTop: '0.4rem', flexShrink: 0, boxShadow: '0 0 0 4px rgba(37,99,235,0.1)' }}></div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>Application submitted</p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(viewingStudent.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border-color)', marginTop: '0.4rem', flexShrink: 0 }}></div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>Initial consultation completed</p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border-color)', marginTop: '0.4rem', flexShrink: 0 }}></div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>Documents verified</p>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="form-actions" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <button className="secondary-btn" onClick={() => { setViewingStudent(null); handleOpenModal(viewingStudent); }}>
                <Edit2 size={16} style={{ marginRight: '0.5rem' }} /> Edit Details
              </button>
              <button className="primary-btn" onClick={() => setViewingStudent(null)}>
                Close
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
