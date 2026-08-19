import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, BookOpen, Search, Loader2, Wallet, GraduationCap, Building2, Calendar, AlignLeft, CheckCircle, FileText, Activity } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/courses';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  
  const defaultForm = { 
    name: '', university: '', level: 'Undergrad', description: '', status: 'Active',
    duration: '', intake_months: '', fee: '', application_fee: '', currency: '₹',
    min_gpa_percentage: '', english_req: ''
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URL);
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData(course);
    } else {
      setEditingCourse(null);
      setFormData(defaultForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await axios.put(`${API_URL}/${editingCourse.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      fetchCourses();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <span className="stat-badge positive">Active</span>;
      case 'Inactive': return <span className="stat-badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>Inactive</span>;
      default: return <span className="stat-badge">{status}</span>;
    }
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card" style={{ minHeight: '600px' }}>
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Course
        </button>
      </div>
      
      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
          <thead>
            <tr>
              <th>Course Name</th>
              <th>University</th>
              <th>Level</th>
              <th>Duration</th>
              <th>Intakes</th>
              <th>Tuition Fee</th>
              <th>App Fee</th>
              <th>Min GPA</th>
              <th>English Req</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', position: 'sticky', right: 0, background: 'white', zIndex: 1 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                    <Loader2 size={40} className="spinner" style={{ color: 'var(--primary-main)' }} />
                    <span>Loading course data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                  No courses found.
                </td>
              </tr>
            ) : (
              filteredCourses.map(course => (
                <tr key={course.id}>
                  <td 
                    style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'var(--primary-main)' }}
                    onClick={() => setViewingCourse(course)}
                  >
                  <div className="stat-icon yellow" style={{ width: 32, height: 32, padding: 0, flexShrink: 0 }}>
                    <BookOpen size={16} />
                  </div>
                  <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.name}</span>
                </td>
                <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.university}</td>
                <td>{course.level}</td>
                <td>{course.duration || '-'}</td>
                <td>{course.intake_months || '-'}</td>
                <td>{course.currency}{course.fee || '-'}</td>
                <td>{course.currency}{course.application_fee || '-'}</td>
                <td>{course.min_gpa_percentage || '-'}</td>
                <td>{course.english_req || '-'}</td>
                <td>{getStatusBadge(course.status)}</td>
                <td style={{ textAlign: 'right', position: 'sticky', right: 0, background: 'white', zIndex: 1, boxShadow: '-2px 0 5px rgba(0,0,0,0.05)' }}>
                  <button className="action-btn" onClick={() => handleOpenModal(course)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(course.id)}>
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
              <div className="profile-cover" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', height: '100px' }}></div>
              <button className="profile-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
              <div className="profile-avatar-wrapper" style={{ bottom: '-24px', left: '1.5rem', width: '48px', height: '48px' }}>
                <BookOpen size={24} color="var(--primary-main)" />
              </div>
            </div>

            <div className="profile-body" style={{ padding: '2rem 1.5rem 1.5rem 1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                  {editingCourse ? 'Edit Course Details' : 'Create New Course'}
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
                  {editingCourse ? 'Update the information for this academic program.' : 'Enter the details below to add a new academic program to the catalog.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                
                {/* Section: Overview */}
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={16} /> Course Overview
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Course Name</label>
                      <input required type="text" name="name" className="form-input" value={formData.name || ''} onChange={handleInputChange} placeholder="e.g. MSc Computer Science" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>University</label>
                      <input required type="text" name="university" className="form-input" value={formData.university || ''} onChange={handleInputChange} placeholder="e.g. Oxford University" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Academic Level</label>
                      <select name="level" className="form-select" value={formData.level || 'Undergrad'} onChange={handleInputChange}>
                        <option value="Undergrad">Undergraduate</option>
                        <option value="Masters">Masters</option>
                        <option value="PhD">PhD</option>
                        <option value="Certificate">Certificate</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</label>
                      <select name="status" className="form-select" value={formData.status || 'Active'} onChange={handleInputChange}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Course Description</label>
                    <textarea name="description" className="form-input" value={formData.description || ''} onChange={handleInputChange} placeholder="Brief overview of the course curriculum and goals..." style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
                  </div>
                </div>

                {/* Section: Duration & Finance */}
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wallet size={16} /> Duration & Finance
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Duration</label>
                      <input required type="text" name="duration" className="form-input" value={formData.duration || ''} onChange={handleInputChange} placeholder="e.g. 2 Years" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Intake Months</label>
                      <input type="text" name="intake_months" className="form-input" value={formData.intake_months || ''} onChange={handleInputChange} placeholder="e.g. Sep, Jan, May" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Currency</label>
                      <select name="currency" className="form-select" value={formData.currency || '₹'} onChange={handleInputChange}>
                        <option value="₹">INR (₹)</option>
                        <option value="$">USD ($)</option>
                        <option value="£">GBP (£)</option>
                        <option value="€">EUR (€)</option>
                        <option value="A$">AUD (A$)</option>
                        <option value="C$">CAD (C$)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Tuition Fee / Year</label>
                      <input required type="text" name="fee" className="form-input" value={formData.fee || ''} onChange={handleInputChange} placeholder="e.g. 5,00,000" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Application Fee</label>
                      <input type="text" name="application_fee" className="form-input" value={formData.application_fee || ''} onChange={handleInputChange} placeholder="e.g. 5,000" />
                    </div>
                  </div>
                </div>

                {/* Section: Eligibility */}
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> Eligibility Criteria
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Min GPA / Percentage</label>
                      <input type="text" name="min_gpa_percentage" className="form-input" value={formData.min_gpa_percentage || ''} onChange={handleInputChange} placeholder="e.g. 60% or 3.0 GPA" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>English Proficiency</label>
                      <input type="text" name="english_req" className="form-input" value={formData.english_req || ''} onChange={handleInputChange} placeholder="e.g. IELTS 6.5 (No band < 6.0)" />
                    </div>
                  </div>
                </div>

                <div className="form-actions" style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="secondary-btn" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="primary-btn" style={{ backgroundColor: 'var(--primary-main)', color: 'white', padding: '0.75rem 1.5rem' }}>
                    {editingCourse ? 'Save Changes' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* View Course Modal */}
      {viewingCourse && (
        <div className="modal-overlay fadeIn">
          <div className="modal-content slideUp" style={{ padding: 0, overflow: 'hidden', maxWidth: '800px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            {/* Modal Header */}
            <div className="profile-header">
              <div className="profile-cover" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', height: '120px' }}></div>
              <button className="profile-close-btn" onClick={() => setViewingCourse(null)}>
                <X size={20} />
              </button>
              <div className="profile-avatar-wrapper" style={{ bottom: '-30px', left: '2rem', width: '80px', height: '80px', border: '4px solid white', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                <BookOpen size={40} color="var(--accent-yellow)" />
              </div>
            </div>

            <div className="profile-body" style={{ padding: '3rem 2rem 2rem 2rem', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--primary-dark)' }}>{viewingCourse.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Building2 size={16} /> {viewingCourse.university}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><GraduationCap size={16} /> {viewingCourse.level}</span>
                  </div>
                </div>
                {getStatusBadge(viewingCourse.status)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Duration & Intakes */}
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} /> Timeline
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Duration</span>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{viewingCourse.duration || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Intake Months</span>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{viewingCourse.intake_months || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Finance */}
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wallet size={16} /> Financial Requirements
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tuition Fee</span>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent-green)' }}>
                        {viewingCourse.currency}{viewingCourse.fee || '-'} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem' }}>/ yr</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Application Fee</span>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{viewingCourse.currency}{viewingCourse.application_fee || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Eligibility Section */}
              <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> Eligibility & Requirements
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Academic Requirement</span>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{viewingCourse.min_gpa_percentage || 'Not specified'}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>English Proficiency</span>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{viewingCourse.english_req || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlignLeft size={16} /> Description
                </h3>
                <p style={{ color: 'var(--text-main)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {viewingCourse.description || 'No description provided for this course.'}
                </p>
              </div>
            </div>

            <div className="form-actions" style={{ padding: '1rem 2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', backgroundColor: '#fff' }}>
              <button className="secondary-btn" onClick={() => { setViewingCourse(null); handleOpenModal(viewingCourse); }}>
                <Edit2 size={16} style={{ marginRight: '0.5rem' }} /> Edit Course
              </button>
              <button className="primary-btn" onClick={() => setViewingCourse(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
