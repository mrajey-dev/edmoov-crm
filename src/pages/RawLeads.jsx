import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, FileText, User, Users, Mail, Phone, Tag, Save, X, CheckCircle, AlertCircle, Edit2, Trash2, Activity, Loader2, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import AdminFilterBar from '../components/AdminFilterBar';

export default function RawLeads() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'import'
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'Select Lead'
  });
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [movingLeadId, setMovingLeadId] = useState(null);
  
  const fileInputRef = useRef(null);

  const sources = [
    'Website',
    'Colleges',
    'Seminar',
    'Bulk Data',
    'Social Media',
    'Other'
  ];
  const statuses = ['Hot Lead', 'Warm Lead', 'Cold Lead', 'Dead Lead'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedAdminId]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const url = selectedAdminId ? `http://127.0.0.1:8000/api/raw-leads?user_id=${selectedAdminId}` : 'http://127.0.0.1:8000/api/raw-leads';
      const res = await axios.get(url);
      setLeads(Array.isArray(res.data) ? res.data.reverse() : []);
    } catch (err) {
      console.error('Error fetching raw leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/raw-leads/${editingId}`, formData);
      } else {
        await axios.post('http://127.0.0.1:8000/api/raw-leads', {
          ...formData,
          dateAdded: new Date().toLocaleDateString()
        });
      }
      
      await fetchLeads(); // Refresh leads
      
      // Reset form
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', source: '', status: 'Select Lead' });
      
      // Show success
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving lead:', err);
      setErrorMsg('Failed to save lead. Is backend running?');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleEdit = (lead) => {
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || '',
      status: lead.status || 'Select Lead'
    });
    setEditingId(lead.id);
    setActiveTab('manual');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/raw-leads/${id}`);
        setLeads(leads.filter(l => l.id !== id));
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(id)) {
          newSelected.delete(id);
          setSelectedLeads(newSelected);
        }
      } catch (err) {
        console.error('Error deleting lead:', err);
        setErrorMsg('Failed to delete lead.');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelect = (id) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedLeads.size} leads?`)) {
      try {
        await axios.post('http://127.0.0.1:8000/api/raw-leads/bulk-delete', { ids: Array.from(selectedLeads) });
        setSelectedLeads(new Set());
        await fetchLeads();
      } catch (err) {
        console.error('Error bulk deleting:', err);
        setErrorMsg('Failed to delete selected leads.');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    if (newStatus === 'Select Lead') return;
    
    const leadToMove = leads.find(l => l.id === leadId);
    if (!leadToMove) return;

    try {
      setMovingLeadId(leadId);
      
      const statusMap = {
        'Hot Lead': 'hot',
        'Warm Lead': 'warm',
        'Cold Lead': 'cold',
        'Dead Lead': 'dead'
      };
      
      const notesArray = leadToMove.notes ? [{
        id: Date.now().toString(),
        text: leadToMove.notes,
        author: 'Admin',
        time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
      }] : [];
      
      const payload = {
        name: leadToMove.name || 'Unknown',
        email: leadToMove.email || '',
        phone: leadToMove.phone || 'N/A',
        location: leadToMove.source || '',
        type: statusMap[newStatus] || 'cold',
        status: 'New',
        notes: notesArray
      };

      await axios.post('http://127.0.0.1:8000/api/leads', payload);
      await axios.delete(`http://127.0.0.1:8000/api/raw-leads/${leadId}`);
      
      // Remove from table
      setLeads(leads.filter(l => l.id !== leadId));
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error moving lead to management:', err);
      setErrorMsg('Failed to move lead to Management. Is backend running?');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setMovingLeadId(null);
    }
  };

  const handleNoteChange = async (leadId, newNote) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/raw-leads/${leadId}`, { notes: newNote });
      setLeads(leads.map(l => l.id === leadId ? { ...l, notes: newNote } : l));
    } catch (err) {
      console.error('Error updating note:', err);
      setErrorMsg('Failed to update note.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const processFile = (file) => {
    if (!file) return;

    setErrorMsg('');
    setIsSuccess(false);
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (data.length < 2) {
          setErrorMsg('The uploaded file appears to be empty or missing data rows.');
          return;
        }

        // Assuming row 0 is header
        const headers = data[0].map(h => typeof h === 'string' ? h.toLowerCase() : '');
        
        const nameIdx = headers.findIndex(h => h.includes('name'));
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('contact'));
        const sourceIdx = headers.findIndex(h => h.includes('source'));

        const parsedLeads = [];
        
        // Start from row 1 to skip header
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;
          
          parsedLeads.push({
            id: Date.now() + i,
            name: nameIdx !== -1 && row[nameIdx] != null ? String(row[nameIdx]) : '',
            email: emailIdx !== -1 && row[emailIdx] != null ? String(row[emailIdx]) : '',
            phone: phoneIdx !== -1 && row[phoneIdx] != null ? String(row[phoneIdx]) : '',
            source: sourceIdx !== -1 && row[sourceIdx] != null ? String(row[sourceIdx]) : 'Bulk Data',
            status: 'Select Lead',
            dateAdded: new Date().toLocaleDateString()
          });
        }
        
        try {
          await Promise.all(parsedLeads.map(lead => axios.post('http://127.0.0.1:8000/api/raw-leads', lead)));
          await fetchLeads();
          
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 3000);
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (err) {
          console.error('Error saving imported leads:', err);
          setErrorMsg('Failed to save some imported leads to the database.');
          setTimeout(() => setErrorMsg(''), 4000);
        }
        
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (err) {
        console.error(err);
        setErrorMsg('Error parsing Excel file. Please ensure it is a valid .xlsx or .xls file.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) || 
                          (lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) || 
                          (lead.phone?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesSource = filterSource ? lead.source === filterSource : true;
    return matchesSearch && matchesSource;
  });

  return (
    <div>
      {isSuperAdmin && (
        <AdminFilterBar
          selectedAdminId={selectedAdminId}
          onChange={setSelectedAdminId}
        />
      )}
      <div className="card" style={{ minHeight: '600px' }}>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Add Raw Leads</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column - Input Actions */}
        <div>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => setActiveTab('manual')}
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'manual' ? '2px solid var(--primary-main)' : '2px solid transparent',
                color: activeTab === 'manual' ? 'var(--primary-main)' : 'var(--text-muted)',
                fontWeight: activeTab === 'manual' ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Plus size={16} /> Manually
            </button>
            <button 
              onClick={() => setActiveTab('import')}
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === 'import' ? '2px solid var(--primary-main)' : '2px solid transparent',
                color: activeTab === 'import' ? 'var(--primary-main)' : 'var(--text-muted)',
                fontWeight: activeTab === 'import' ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Upload size={16} /> Excel Import
            </button>
          </div>

          {isSuccess && (
            <div style={{ padding: '0.75rem', backgroundColor: '#dcfce3', color: '#166534', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <CheckCircle size={16} /> Leads successfully added!
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  <User size={14} /> Full Name <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-input" 
                  placeholder="e.g. Jane Doe" 
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Mail size={14} /> Email Address <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-input" 
                  placeholder="e.g. jane@example.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={14} /> Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="form-input" 
                  placeholder="e.g. +1 234 567 8900" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Tag size={14} /> Source <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>(Optional)</span>
                </label>
                <select 
                  name="source" 
                  className="form-select" 
                  value={formData.source}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                >
                  <option value="">Select a source...</option>
                  {sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>



              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="primary-btn" style={{ flex: 1, justifyContent: 'center' }}>
                  <Save size={16} /> {editingId ? 'Update Lead' : 'Save Lead'}
                </button>
                {editingId && (
                  <button type="button" className="secondary-btn" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', source: '', status: 'Cold Lead' }); }} style={{ flex: 1, justifyContent: 'center', backgroundColor: '#f1f5f9', border: '1px solid var(--border-color)' }}>
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div 
                style={{ 
                  border: isDragOver ? '2px dashed var(--primary-main)' : '2px dashed var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '2.5rem 1.5rem', 
                  textAlign: 'center',
                  backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)',
                  cursor: isImporting ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => !isImporting && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onMouseOver={(e) => { if(!isImporting && !isDragOver) e.currentTarget.style.borderColor = 'var(--primary-main)'; }}
                onMouseOut={(e) => { if(!isImporting && !isDragOver) e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                {isImporting ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Loader2 size={40} className="spinner" style={{ color: 'var(--primary-main)' }} />
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Importing Leads...</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Please wait while we process your file</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileText size={40} color="var(--primary-main)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Upload Excel File</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Click to browse or drag and drop</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Supports .xlsx, .xls, .csv</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls, .csv" 
                  style={{ display: 'none' }} 
                  disabled={isImporting}
                />
                  </>
                )}
              </div>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                <strong>Tip:</strong> Ensure your Excel file has a header row. We will try to automatically match columns named <code>Name</code>, <code>Email</code>, <code>Phone</code>, and <code>Source</code>.
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Table */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Recently Added Leads</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                {filteredLeads.length}
              </span>
              {selectedLeads.size > 0 && (
                <button 
                  className="action-btn delete" 
                  onClick={handleBulkDelete}
                  title="Delete Selected"
                  style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                >
                  <Trash2 size={14} /> Delete Selected ({selectedLeads.size})
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search leads..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '0.4rem 0.5rem 0.4rem 1.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem', outline: 'none', width: '200px' }}
                />
              </div>
              
              <select 
                value={filterSource} 
                onChange={(e) => setFilterSource(e.target.value)}
                style={{ padding: '0.4rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem', outline: 'none' }}
              >
                <option value="">All Sources</option>
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3rem', color: 'var(--text-muted)' }}>
                <Loader2 size={48} className="spinner" style={{ color: 'var(--primary-main)', marginBottom: '1rem' }} />
                <p style={{ margin: 0 }}>Loading raw leads...</p>
              </div>
            ) : leads.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3rem', color: 'var(--text-muted)' }}>
                <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p style={{ margin: 0, textAlign: 'center' }}>No leads added yet.<br/>Add manually or upload an Excel sheet.</p>
              </div>
            ) : (
              <table className="data-table" style={{ width: '100%', margin: 0 }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Source</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th>Status</th>
                    {isSuperAdmin && <th>Owner</th>}
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} style={{ backgroundColor: selectedLeads.has(lead.id) ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => handleSelect(lead.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ fontWeight: 500 }}>{lead.name || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {lead.email && <span style={{ fontSize: '0.875rem' }}><Mail size={12} style={{ display: 'inline', marginRight: '4px' }}/>{lead.email}</span>}
                          {lead.phone && <span style={{ fontSize: '0.875rem' }}><Phone size={12} style={{ display: 'inline', marginRight: '4px' }}/>{lead.phone}</span>}
                          {!lead.email && !lead.phone && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                        </div>
                      </td>
                      <td>
                        <span style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {lead.source || '-'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{lead.dateAdded}</td>
                      <td>
                        <input 
                          type="text" 
                          defaultValue={lead.notes || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (lead.notes || '')) {
                              handleNoteChange(lead.id, e.target.value);
                            }
                          }}
                          style={{ width: '100%', minWidth: '120px', padding: '0.25rem 0.5rem', fontSize: '0.875rem', borderRadius: '4px', border: '1px solid transparent', background: 'transparent', outline: 'none' }}
                          onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = 'var(--border-color)'; }}
                          onMouseOver={(e) => { if(document.activeElement !== e.target) e.target.style.borderColor = 'var(--border-color)'; }}
                          onMouseOut={(e) => { if(document.activeElement !== e.target) e.target.style.borderColor = 'transparent'; }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <select 
                            value={lead.status || 'Select Lead'}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            style={{ fontSize: '0.75rem', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                            disabled={movingLeadId === lead.id}
                          >
                            <option value="Select Lead">Select Status...</option>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {movingLeadId === lead.id && <Loader2 size={14} className="spin" color="var(--primary-main)" />}
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td>
                          <span style={{ fontSize: '0.75rem', color: '#4f46e5', background: '#eef2ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            @{lead.user?.username || 'admin'}
                          </span>
                        </td>
                      )}
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleEdit(lead)} style={{ background: 'none', border: 'none', color: 'var(--primary-main)', cursor: 'pointer', marginRight: '0.5rem' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  </div>
  );
}
