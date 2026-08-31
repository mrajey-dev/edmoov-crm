import React, { useState, useEffect } from 'react';
import { X, User, Plus, FileText, Download, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/students';
const maxDob = new Date();
maxDob.setFullYear(maxDob.getFullYear() - 18);
const maxDobString = maxDob.toISOString().split('T')[0];

export default function StudentFormModal({ student = null, isEditing = false, onClose, onSuccess, onAddLater }) {
  const [activeTab, setActiveTab] = useState('personal');
  const defaultForm = { 
    name: '', email: '', phone: '', program: '', status: 'Active',
    dob: '', passport_number: '', address: '',
    highest_qualification: '', passing_year: '', grades_percentage: '', english_proficiency: '',
    parents_occupation: '', family_annual_income: '',
    finance_source: 'Self-funded',
    preferred_country: '', preferred_college: '', preferred_course: '',
    preferred_country_2: '', preferred_college_2: '', preferred_course_2: '',
    preferred_country_3: '', preferred_college_3: '', preferred_course_3: '',
    enrolled_date: ''
  };
  
  const [formData, setFormData] = useState(student ? { ...defaultForm, ...student } : defaultForm);
  const [documents, setDocuments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState(student?.documents || []);
  const [countries, setCountries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);

  useEffect(() => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDocument = () => setDocuments([...documents, { name: '', file: null }]);
  const handleRemoveDocument = (index) => setDocuments(documents.filter((_, i) => i !== index));
  const handleDocumentChange = (index, field, value) => {
    const newDocs = [...documents];
    newDocs[index][field] = value;
    setDocuments(newDocs);
  };

  const handleDeleteExistingDocument = async (docId) => {
    if (window.confirm('Are you sure you want to permanently delete this document?')) {
      try {
        setDeletingDocId(docId);
        await axios.delete(`${API_URL}/${student.id}/documents/${docId}`);
        setExistingDocuments(prev => prev.filter(d => d.id !== docId));
      } catch (error) {
        console.error('Error deleting document:', error);
      } finally {
        setDeletingDocId(null);
      }
    }
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
      setIsSubmitting(true);
      const data = new FormData();
      Object.keys(defaultForm).forEach(key => {
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

      let responseData;
      if (isEditing && student?.id) {
        data.append('_method', 'PUT');
        const res = await axios.post(`${API_URL}/${student.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
        responseData = res.data;
      } else {
        const res = await axios.post(API_URL, data, { headers: { 'Content-Type': 'multipart/form-data' }});
        responseData = res.data;
      }
      
      if (onSuccess) {
        onSuccess(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student details. Please check the required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay fadeIn">
      <div className="modal-content slideUp" style={{ padding: 0, overflow: 'hidden', maxWidth: '600px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        {/* Modal Header */}
        <div className="profile-header">
          <div className="profile-cover" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', height: '100px' }}></div>
          <button type="button" className="profile-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
          <div className="profile-avatar-wrapper" style={{ bottom: '-24px', left: '1.5rem', width: '48px', height: '48px' }}>
            <User size={24} color="var(--primary-main)" />
          </div>
        </div>

        <div className="profile-body" style={{ padding: '2rem 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
              {isEditing ? 'Edit Student Details' : 'Add New Student'}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Passport Number</label>
                      <input type="text" name="passport_number" className="form-input" value={formData.passport_number || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
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
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Study Preferences (Max 3)</h4>
                  
                  {/* Preference 1 */}
                  <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#fff' }}>
                    <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>Preference 1 (Primary)</h5>
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
                    <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Preferred College / University</label>
                      <input type="text" name="preferred_college" className="form-input" value={formData.preferred_college || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                    </div>
                  </div>

                  {/* Preference 2 */}
                  <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#fff' }}>
                    <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>Preference 2 (Optional)</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Preferred Country</label>
                        <select name="preferred_country_2" className="form-select" value={formData.preferred_country_2 || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }}>
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
                        <input type="text" name="preferred_course_2" className="form-input" value={formData.preferred_course_2 || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Preferred College / University</label>
                      <input type="text" name="preferred_college_2" className="form-input" value={formData.preferred_college_2 || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                    </div>
                  </div>

                  {/* Preference 3 */}
                  <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#fff' }}>
                    <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>Preference 3 (Optional)</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Preferred Country</label>
                        <select name="preferred_country_3" className="form-select" value={formData.preferred_country_3 || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }}>
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
                        <input type="text" name="preferred_course_3" className="form-input" value={formData.preferred_course_3 || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Preferred College / University</label>
                      <input type="text" name="preferred_college_3" className="form-input" value={formData.preferred_college_3 || ''} onChange={handleInputChange} style={{ backgroundColor: '#f8fafc' }} />
                    </div>
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

                  {existingDocuments.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <h5 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Previously Uploaded</h5>
                      {existingDocuments.map((doc) => (
                        <div key={doc.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                          <FileText size={18} color="var(--primary-main)" style={{ marginLeft: '0.5rem' }} />
                          <div style={{ flex: 1, marginLeft: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                            {doc.document_name}
                          </div>
                          <a href={`http://127.0.0.1:8000/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, marginRight: '1rem' }}>
                            <Download size={16} />
                          </a>
                          <button type="button" onClick={() => handleDeleteExistingDocument(doc.id)} disabled={deletingDocId === doc.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {deletingDocId === doc.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {documents.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h5 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>New Uploads</h5>
                      {documents.map((doc, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
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

                  {documents.length === 0 && existingDocuments.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                      No documents added yet. Click the button above to upload.
                    </div>
                  )}
                </>
              )}

            </div>

            <div className="form-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
                {onAddLater && (
                  <button type="button" className="secondary-btn" onClick={onAddLater} style={{ color: 'var(--primary-main)', borderColor: 'var(--primary-main)' }}>Add Later</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {activeTab !== 'personal' && (
                  <button type="button" className="secondary-btn" onClick={() => setActiveTab(activeTab === 'documents' ? 'study' : activeTab === 'study' ? 'education' : 'personal')}>
                    Back
                  </button>
                )}
                <button type="submit" className="primary-btn" disabled={isSubmitting} style={{ backgroundColor: 'var(--primary-main)', color: 'white', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSubmitting ? <><Loader2 className="spin" size={16} /> {activeTab !== 'documents' ? 'Processing...' : 'Saving...'}</> : (activeTab !== 'documents' ? 'Next' : (isEditing ? 'Save Changes' : 'Save Details'))}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
