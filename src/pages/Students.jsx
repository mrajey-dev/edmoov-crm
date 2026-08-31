import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, User, Search, Loader2, Mail, Phone, MapPin, Activity, FileText, Download, GraduationCap } from 'lucide-react';
import axios from 'axios';
import StudentFormModal from '../components/StudentFormModal';

const BASE_API_URL = 'http://127.0.0.1:8000/api';

export default function Students({ isApplicationsPage = false }) {
  const API_URL = isApplicationsPage ? `${BASE_API_URL}/applications` : `${BASE_API_URL}/students`;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialLeadType = searchParams.get('lead_type') || 'all';
  
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [leadTypeFilter, setLeadTypeFilter] = useState(initialLeadType);
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [financeFilter, setFinanceFilter] = useState('all');
  const [qualificationFilter, setQualificationFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [location.search]);

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
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const [statusModalStudent, setStatusModalStudent] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        setDeletingId(id);
        await axios.delete(`${API_URL}/${id}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleUpdatePreferenceStatus = async (studentId, prefField, newStatus) => {
    try {
      await axios.post(`${API_URL}/${studentId}`, {
        _method: 'PUT',
        [prefField]: newStatus
      });
      // Update local state
      setViewingStudent(prev => prev ? ({ ...prev, [prefField]: newStatus }) : prev);
      setStatusModalStudent(prev => prev ? ({ ...prev, [prefField]: newStatus }) : prev);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, [prefField]: newStatus } : s));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  const handleExtraFieldChangeLocal = (studentId, field, value) => {
    setViewingStudent(prev => prev && prev.id === studentId ? ({ ...prev, [field]: value }) : prev);
    setStatusModalStudent(prev => prev && prev.id === studentId ? ({ ...prev, [field]: value }) : prev);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, [field]: value } : s));
  };

  const renderExtraCasCoeFields = (student, prefIndex) => {
    const statusField = `pref_${prefIndex}_status`;
    const status = student[statusField];
    if (status !== 'CAS' && status !== 'COE') return null;

    const casCoeField = `pref_${prefIndex}_cas_coe_number`;
    const issueDateField = `pref_${prefIndex}_issue_date`;
    const visaStatusField = `pref_${prefIndex}_visa_status`;

    return (
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{status} Number</label>
          <input 
            type="text" 
            placeholder={`Enter ${status} number...`}
            value={student[casCoeField] || ''}
            onChange={(e) => handleExtraFieldChangeLocal(student.id, casCoeField, e.target.value)}
            onBlur={(e) => handleUpdatePreferenceStatus(student.id, casCoeField, e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Issue Date</label>
          <input 
            type="date"
            value={student[issueDateField] || ''}
            onChange={(e) => {
              handleExtraFieldChangeLocal(student.id, issueDateField, e.target.value);
              handleUpdatePreferenceStatus(student.id, issueDateField, e.target.value);
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Visa Status</label>
          <select
            value={student[visaStatusField] || 'Not Started'}
            onChange={(e) => {
              handleExtraFieldChangeLocal(student.id, visaStatusField, e.target.value);
              handleUpdatePreferenceStatus(student.id, visaStatusField, e.target.value);
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff', fontSize: '0.85rem' }}
          >
            <option value="Not Started">Not Started</option>
            <option value="Visa Applied">Visa Applied</option>
            <option value="Biometrics Done">Biometrics Done</option>
            <option value="Visa Approved">Visa Approved</option>
            <option value="Visa Rejected">Visa Rejected</option>
          </select>
        </div>
      </div>
    );
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

  const getPrefBadge = (college, status) => {
    if (!college) return null;
    const stat = status || 'Pending';
    const isSuccess = stat === 'CAS' || stat === 'COE';
    const isError = stat === 'Rejected';
    const isPending = stat === 'Pending';
    const color = isSuccess ? '#047857' : (isError ? '#b91c1c' : (isPending ? '#475569' : '#1d4ed8'));
    const bg = isSuccess ? '#d1fae5' : (isError ? '#fee2e2' : (isPending ? '#f1f5f9' : '#dbeafe'));
    return (
      <span style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem', 
        padding: '0.25rem 0.5rem', borderRadius: '4px', 
        background: bg, color: color, fontSize: '0.75rem', fontWeight: 600,
        whiteSpace: 'nowrap'
      }}>
        {college} <span style={{ opacity: 0.5 }}>&bull;</span> {stat}
      </span>
    );
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.program.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = leadTypeFilter === 'all' || (student.lead_type && student.lead_type.toLowerCase() === leadTypeFilter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (student.status && student.status.toLowerCase() === statusFilter.toLowerCase());
    
    const matchesCountry = countryFilter === 'all' || (student.preferred_country && student.preferred_country.toLowerCase() === countryFilter.toLowerCase());
    
    const matchesFinance = financeFilter === 'all' || (student.finance_source && student.finance_source.toLowerCase() === financeFilter.toLowerCase());
    
    const matchesQualification = qualificationFilter === 'all' || (student.highest_qualification && student.highest_qualification.toLowerCase() === qualificationFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesStatus && matchesCountry && matchesFinance && matchesQualification;
  });

  const availableCountries = [...new Set(students.map(s => s.preferred_country).filter(Boolean))].sort();
  const availableFinanceSources = [...new Set(students.map(s => s.finance_source).filter(Boolean))].sort();
  const availableQualifications = [...new Set(students.map(s => s.highest_qualification).filter(Boolean))].sort();

  return (
    <div className="card" style={{ minHeight: '600px' }}>
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <div className="search-container" style={{ minWidth: '200px' }}>
            <Search size={18} className="search-icon" color="var(--text-muted)" />
            <input 
              type="text" 
              className="search-input"
              placeholder={isApplicationsPage ? "Search applications..." : "Search students..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            value={leadTypeFilter} 
            onChange={(e) => setLeadTypeFilter(e.target.value)}
            style={{ padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.875rem' }}
          >
            <option value="all">All Lead Types</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
            <option value="approved">Approved</option>
            <option value="dead">Dead</option>
          </select>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.875rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="graduated">Graduated</option>
            <option value="inactive">Inactive</option>
          </select>

          <select 
            value={countryFilter} 
            onChange={(e) => setCountryFilter(e.target.value)}
            style={{ padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.875rem' }}
          >
            <option value="all">All Countries</option>
            {availableCountries.map(country => (
              <option key={country} value={country.toLowerCase()}>{country}</option>
            ))}
          </select>

          <select 
            value={financeFilter} 
            onChange={(e) => setFinanceFilter(e.target.value)}
            style={{ padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.875rem' }}
          >
            <option value="all">All Finance</option>
            {availableFinanceSources.map(finance => (
              <option key={finance} value={finance.toLowerCase()}>{finance}</option>
            ))}
          </select>

          <select 
            value={qualificationFilter} 
            onChange={(e) => setQualificationFilter(e.target.value)}
            style={{ padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.875rem' }}
          >
            <option value="all">All Qualifications</option>
            {availableQualifications.map(qual => (
              <option key={qual} value={qual.toLowerCase()}>{qual}</option>
            ))}
          </select>
        </div>
        

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
                <td style={{ textAlign: 'right', position: 'sticky', right: 0, background: 'white', zIndex: 1, boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>
                  <button className="action-btn" title="Update University Status" onClick={() => setStatusModalStudent(student)}>
                    <GraduationCap size={16} />
                  </button>
                  <button className="action-btn" title="Edit Student" onClick={() => handleOpenModal(student)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn delete" title="Delete Student" onClick={() => handleDelete(student.id)} disabled={deletingId === student.id}>
                    {deletingId === student.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <StudentFormModal 
          student={editingStudent} 
          isEditing={!!editingStudent}
          onClose={handleCloseModal} 
          onSuccess={() => {
            fetchStudents();
          }} 
        />
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
                  <FileText size={18} /> Study Preferences & Tracking
                </h3>
                
                {/* Preference 1 */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', padding: '1.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Preference 1</h4>
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Country</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{viewingStudent.preferred_country || '-'}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>College</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{viewingStudent.preferred_college || '-'}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Course</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{viewingStudent.preferred_course || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>Application Status</span>
                      <select 
                        value={viewingStudent.pref_1_status || 'Pending'} 
                        onChange={(e) => handleUpdatePreferenceStatus(viewingStudent.id, 'pref_1_status', e.target.value)}
                        style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#f8fafc', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Form submitted to university">Form submitted to university</option>
                        <option value="Rejected">Rejected</option>
                        <option value="CAS">CAS</option>
                        <option value="COE">COE</option>
                      </select>
                    </div>
                  </div>
                  {renderExtraCasCoeFields(viewingStudent, 1)}
                </div>

                {/* Preference 2 */}
                {(viewingStudent.preferred_country_2 || viewingStudent.preferred_college_2 || viewingStudent.preferred_course_2) && (
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Preference 2</h4>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Country</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{viewingStudent.preferred_country_2 || '-'}</span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>College</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{viewingStudent.preferred_college_2 || '-'}</span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Course</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{viewingStudent.preferred_course_2 || '-'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>Application Status</span>
                        <select 
                          value={viewingStudent.pref_2_status || 'Pending'} 
                          onChange={(e) => handleUpdatePreferenceStatus(viewingStudent.id, 'pref_2_status', e.target.value)}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#f8fafc', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Form submitted to university">Form submitted to university</option>
                          <option value="Rejected">Rejected</option>
                          <option value="CAS">CAS</option>
                          <option value="COE">COE</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preference 3 */}
                {(viewingStudent.preferred_country_3 || viewingStudent.preferred_college_3 || viewingStudent.preferred_course_3) && (
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Preference 3</h4>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Country</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{viewingStudent.preferred_country_3 || '-'}</span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>College</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{viewingStudent.preferred_college_3 || '-'}</span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Course</span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{viewingStudent.preferred_course_3 || '-'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>Application Status</span>
                        <select 
                          value={viewingStudent.pref_3_status || 'Pending'} 
                          onChange={(e) => handleUpdatePreferenceStatus(viewingStudent.id, 'pref_3_status', e.target.value)}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#f8fafc', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Form submitted to university">Form submitted to university</option>
                          <option value="Rejected">Rejected</option>
                          <option value="CAS">CAS</option>
                          <option value="COE">COE</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
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

              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} /> Uploaded Documents
                </h3>
                {viewingStudent.documents && viewingStudent.documents.length > 0 ? (
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
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', borderRadius: '12px', border: '1px dashed var(--border-color)', background: '#f8fafc', color: 'var(--text-muted)' }}>
                    No documents have been uploaded for this student yet.
                  </div>
                )}
              </div>

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

      {/* University Status Modal */}
      {statusModalStudent && (
        <div className="modal-overlay fadeIn" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content slideUp" style={{ maxWidth: '500px', width: '100%', padding: '2rem', borderRadius: '12px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Update University Status
              </h2>
              <button className="icon-btn" onClick={() => setStatusModalStudent(null)}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
              Manage application statuses for <strong>{statusModalStudent.name}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {statusModalStudent.preferred_college ? (
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>1. {statusModalStudent.preferred_college}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{statusModalStudent.preferred_course} ({statusModalStudent.preferred_country})</div>
                  <select 
                    value={statusModalStudent.pref_1_status || 'Pending'} 
                    onChange={(e) => handleUpdatePreferenceStatus(statusModalStudent.id, 'pref_1_status', e.target.value)}
                    style={{ padding: '0.5rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Form submitted to university">Form submitted to university</option>
                    <option value="Rejected">Rejected</option>
                    <option value="CAS">CAS</option>
                    <option value="COE">COE</option>
                  </select>
                  {renderExtraCasCoeFields(statusModalStudent, 1)}
                </div>
              ) : <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No university applications listed.</div>}

              {statusModalStudent.preferred_college_2 && (
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>2. {statusModalStudent.preferred_college_2}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{statusModalStudent.preferred_course_2} ({statusModalStudent.preferred_country_2})</div>
                  <select 
                    value={statusModalStudent.pref_2_status || 'Pending'} 
                    onChange={(e) => handleUpdatePreferenceStatus(statusModalStudent.id, 'pref_2_status', e.target.value)}
                    style={{ padding: '0.5rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Form submitted to university">Form submitted to university</option>
                    <option value="Rejected">Rejected</option>
                    <option value="CAS">CAS</option>
                    <option value="COE">COE</option>
                  </select>
                  {renderExtraCasCoeFields(statusModalStudent, 2)}
                </div>
              )}

              {statusModalStudent.preferred_college_3 && (
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>3. {statusModalStudent.preferred_college_3}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{statusModalStudent.preferred_course_3} ({statusModalStudent.preferred_country_3})</div>
                  <select 
                    value={statusModalStudent.pref_3_status || 'Pending'} 
                    onChange={(e) => handleUpdatePreferenceStatus(statusModalStudent.id, 'pref_3_status', e.target.value)}
                    style={{ padding: '0.5rem', width: '100%', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Form submitted to university">Form submitted to university</option>
                    <option value="Rejected">Rejected</option>
                    <option value="CAS">CAS</option>
                    <option value="COE">COE</option>
                  </select>
                  {renderExtraCasCoeFields(statusModalStudent, 3)}
                </div>
              )}
            </div>
            
            <div className="form-actions" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="primary-btn" onClick={() => setStatusModalStudent(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
