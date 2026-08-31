import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Calendar, BookOpen, X, MessageSquare, Plus, Edit2, Trash2, Check, GraduationCap, Loader2 } from 'lucide-react';
import axios from 'axios';
import StudentFormModal from '../components/StudentFormModal';

const API_URL = 'http://127.0.0.1:8000/api/leads';

const COLUMNS = {
  hot: { title: 'Hot Leads', color: '#ff4500' },
  warm: { title: 'Warm Leads', color: '#facc15' },
  cold: { title: 'Cold Leads', color: '#3b82f6' },
  dead: { title: 'Dead Leads', color: '#64748b' },
  approved: { title: 'Applicant', color: '#10b981' }
};

function SortableItem({ item, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={() => {
        // Only trigger click if not actively dragging
        if (!isDragging) {
          onClick(item);
        }
      }}
      className={`kanban-card ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="lead-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="lead-name" style={{ flex: 1 }}>{item.name}</span>
        {item.column === 'approved' && (
          <button 
             className="primary-btn" 
             onClick={(e) => { 
                e.stopPropagation(); 
                if (item.student) {
                    window.location.href = `/students?search=${encodeURIComponent(item.email || item.name)}`; 
                } else {
                    onClick(item);
                }
             }} 
             style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '4px', background: item.student ? '#3b82f6' : '#f59e0b', color: 'white' }}
          >
             {item.student ? 'View Profile' : 'Add Details'}
          </button>
        )}
        <span className="lead-meta"><MoreHorizontal size={14}/></span>
      </div>
      <div className="lead-program">
        <BookOpen size={14} /> {item.program}
      </div>
      <div className="lead-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={`https://i.pravatar.cc/150?u=${item.avatar}`} alt="Avatar" className="lead-avatar" />
        </div>
        <div className="lead-date" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Calendar size={12} /> {item.date}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ columnId, items, onCardClick }) {
  const { setNodeRef } = useDroppable({
    id: columnId,
  });

  return (
    <div className="kanban-column" ref={setNodeRef}>
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          <div className="kanban-dot" style={{ backgroundColor: COLUMNS[columnId].color }}></div>
          {COLUMNS[columnId].title}
        </div>
        <span className="kanban-count">{items.length}</span>
      </div>
      
      <div className="kanban-column-content">
        <SortableContext 
          id={columnId}
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map(item => (
            <SortableItem key={item.id} item={item} onClick={onCardClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function FollowUp() {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(API_URL);
      const fetchedItems = response.data.map(lead => ({
        ...lead,
        id: lead.id.toString(),
        column: lead.type,
        program: lead.location, // UI uses program
        avatar: (lead.id % 7) + 1, // pseudo random avatar
        date: new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        notes: typeof lead.notes === 'string' ? JSON.parse(lead.notes) : (lead.notes || [])
      }));
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };
  const [activeId, setActiveId] = useState(null);
  
  // Modal State
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [savingNoteId, setSavingNoteId] = useState(null);
  
  const [convertingLead, setConvertingLead] = useState(null);
  const [dragOriginalColumn, setDragOriginalColumn] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    const item = items.find(i => i.id === event.active.id);
    if (item) setDragOriginalColumn(item.column);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setItems((prevItems) => {
      const activeIndex = prevItems.findIndex(t => t.id === activeId);
      const overIndex = prevItems.findIndex(t => t.id === overId);

      if (activeIndex === -1) return prevItems;

      let overColumn = Object.keys(COLUMNS).includes(overId) 
        ? overId 
        : (overIndex !== -1 ? prevItems[overIndex].column : null);

      if (!overColumn) overColumn = over.data?.current?.sortable?.containerId;
      
      if (overColumn && prevItems[activeIndex].column !== overColumn) {
         const updatedItems = [...prevItems];
         updatedItems[activeIndex] = { ...updatedItems[activeIndex], column: overColumn, type: overColumn };
         return updatedItems;
      }
      return prevItems;
    });
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    let newColumn = Object.keys(COLUMNS).includes(overId) 
        ? overId 
        : over.data?.current?.sortable?.containerId;

    setItems((prevItems) => {
      const activeIndex = prevItems.findIndex(t => t.id === activeId);
      const overIndex = prevItems.findIndex(t => t.id === overId);
      
      if (activeIndex === -1) return prevItems;

      if (!newColumn && overIndex !== -1) {
          newColumn = prevItems[overIndex].column;
      }

      const updatedItems = [...prevItems];
      if (newColumn && updatedItems[activeIndex].column !== newColumn) {
          updatedItems[activeIndex] = { ...updatedItems[activeIndex], column: newColumn, type: newColumn };
      }

      if (activeIndex !== -1 && overIndex !== -1 && updatedItems[activeIndex].column === updatedItems[overIndex].column && activeIndex !== overIndex) {
         return arrayMove(updatedItems, activeIndex, overIndex);
      }
      return updatedItems;
    });

    if (newColumn && activeId) {
      if (newColumn === 'approved') {
        const lead = items.find(i => i.id === activeId);
        if (lead && !lead.student) {
            setConvertingLead(lead);
            return;
        }
      }
      try {
        await axios.put(`${API_URL}/${activeId}`, { type: newColumn });
      } catch (err) {
        console.error('Failed to update lead status:', err);
      }
    }
  };

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  const handleCancelConvert = () => {
    if (!convertingLead) return;
    setItems((prevItems) => prevItems.map(item => 
      item.id === convertingLead.id ? { ...item, column: dragOriginalColumn, type: dragOriginalColumn } : item
    ));
    setConvertingLead(null);
  };

  const handleAddLater = async () => {
    if (!convertingLead) return;
    try {
      await axios.put(`${API_URL}/${convertingLead.id}`, { type: 'approved' });
      setItems((prevItems) => prevItems.map(item => 
        item.id === convertingLead.id ? { ...item, column: 'approved', type: 'approved' } : item
      ));
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
    setConvertingLead(null);
  };

  const handleConvertSuccess = async (studentData) => {
    try {
       await axios.put(`${API_URL}/${convertingLead.id}`, { type: 'approved' });
       setItems((prevItems) => prevItems.map(item => 
          item.id === convertingLead.id ? { ...item, type: 'approved', column: 'approved', student: studentData } : item
       ));
       setConvertingLead(null);
    } catch (err) {
       console.error("Failed to convert lead to student", err);
    }
  };

  const handleCardClick = (item) => {
    setSelectedLead(item);
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setNewNote('');
    setEditingNoteId(null);
    setEditNoteText('');
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedLead) return;
    try {
      await axios.put(`${API_URL}/${selectedLead.id}`, { type: newStatus });
      setItems((prevItems) => prevItems.map(item => 
        item.id === selectedLead.id ? { ...item, column: newStatus, type: newStatus } : item
      ));
      setSelectedLead((prev) => ({ ...prev, column: newStatus, type: newStatus }));
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });

    const noteObj = {
      id: Date.now().toString(),
      text: newNote.trim(),
      author: 'Admin',
      time: timestamp
    };

    const updatedNotes = [...(selectedLead.notes || []), noteObj];

    try {
      setIsSubmittingNote(true);
      await axios.put(`${API_URL}/${selectedLead.id}`, { notes: updatedNotes });
      const updatedItems = items.map(item => {
        if (item.id === selectedLead.id) {
          setSelectedLead({ ...item, notes: updatedNotes });
          return { ...item, notes: updatedNotes };
        }
        return item;
      });
      setItems(updatedItems);
      setNewNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const updatedNotes = selectedLead.notes.filter(n => n.id !== noteId);
    try {
      setDeletingNoteId(noteId);
      await axios.put(`${API_URL}/${selectedLead.id}`, { notes: updatedNotes });
      const updatedItems = items.map(item => {
        if (item.id === selectedLead.id) {
          setSelectedLead({ ...item, notes: updatedNotes });
          return { ...item, notes: updatedNotes };
        }
        return item;
      });
      setItems(updatedItems);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to completely delete this lead record?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setItems(items.filter(item => item.id !== id));
        setSelectedLead(null);
      } catch (err) {
        console.error('Failed to delete lead:', err);
        alert('Failed to delete lead.');
      }
    }
  };

  const startEditingNote = (note) => {
    setEditingNoteId(note.id);
    setEditNoteText(note.text);
  };

  const handleSaveEdit = async (noteId) => {
    if (!editNoteText.trim()) return;
    const updatedNotes = selectedLead.notes.map(n => 
      n.id === noteId ? { ...n, text: editNoteText.trim() } : n
    );
    try {
      setSavingNoteId(noteId);
      await axios.put(`${API_URL}/${selectedLead.id}`, { notes: updatedNotes });
      const updatedItems = items.map(item => {
        if (item.id === selectedLead.id) {
          setSelectedLead({ ...item, notes: updatedNotes });
          return { ...item, notes: updatedNotes };
        }
        return item;
      });
      setItems(updatedItems);
      setEditingNoteId(null);
      setEditNoteText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNoteId(null);
    }
  };

  return (
    <div style={{ padding: '0 0' }}>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {Object.keys(COLUMNS).map(columnId => (
            <KanbanColumn 
              key={columnId} 
              columnId={columnId} 
              items={items.filter(item => item.column === columnId)} 
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
             <div className="kanban-card" style={{ cursor: 'grabbing', opacity: 0.8, transform: 'scale(1.05)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="lead-header">
                <span className="lead-name">{activeItem.name}</span>
                <span className="lead-meta"><MoreHorizontal size={14}/></span>
              </div>
              <div className="lead-program">
                <BookOpen size={14} /> {activeItem.program}
              </div>
              <div className="lead-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={`https://i.pravatar.cc/150?u=${activeItem.avatar}`} alt="Avatar" className="lead-avatar" />
                </div>
                <div className="lead-date" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} /> {activeItem.date}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Lead Profile & Notes Modal */}
      {selectedLead && (
        <div className="modal-overlay fadeIn" onClick={handleCloseModal}>
          <div className="modal-content slideUp" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            
            {/* Modal Header */}
            <div className="profile-header">
              <div className="profile-cover"></div>
              <button className="profile-close-btn" onClick={handleCloseModal}>
                <X size={20} />
              </button>
              <div className="profile-avatar-wrapper">
                <img src={`https://i.pravatar.cc/150?u=${selectedLead.avatar}`} alt="Avatar" className="profile-avatar-img" />
              </div>
            </div>

            <div className="profile-body">
              <div className="profile-title-row">
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{selectedLead.name}</h2>
                  <p style={{ color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={16}/> {selectedLead.program}
                  </p>
                </div>
                <select 
                  value={selectedLead.column} 
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="form-select"
                  style={{ 
                    width: 'auto', 
                    backgroundColor: COLUMNS[selectedLead.column].color + '15', 
                    color: COLUMNS[selectedLead.column].color,
                    border: `1px solid ${COLUMNS[selectedLead.column].color}40`,
                    fontWeight: 600
                  }}
                >
                  {Object.entries(COLUMNS).map(([key, col]) => (
                    <option key={key} value={key}>{col.title}</option>
                  ))}
                </select>
              </div>

              {/* Student Data Grid */}
              <div className="student-data-grid" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email Address</span>
                  <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{selectedLead.email}</p>
                </div>
                <div>
                  <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Phone Number</span>
                  <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{selectedLead.phone}</p>
                </div>
                <div>
                  <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current Location</span>
                  <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{selectedLead.location}</p>
                </div>
                <div>
                  <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Application Date</span>
                  <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{selectedLead.date}, 2026</p>
                </div>
              </div>

              {!selectedLead.student && selectedLead.column === 'approved' && (
                <div style={{ marginTop: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <button 
                    className="primary-btn" 
                    onClick={() => {
                       setConvertingLead(selectedLead);
                       setSelectedLead(null);
                    }}
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                  >
                    <GraduationCap size={18} /> Complete Student Details
                  </button>
                </div>
              )}

              {selectedLead.student && (
                <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: '#f8fafc', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={16} /> Registered Student Details
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Highest Qualification</span>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{selectedLead.student.highest_qualification || '-'}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Grades (%)</span>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{selectedLead.student.grades_percentage || '-'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Pref. Country</span>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{selectedLead.student.preferred_country || '-'}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Pref. College</span>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedLead.student.preferred_college}>{selectedLead.student.preferred_college || '-'}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Pref. Course</span>
                      <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{selectedLead.student.preferred_course || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="modal-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <MessageSquare size={18} color="var(--primary-main)"/>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Lead Notes</h3>
              </div>

              {/* Timeline */}
              <div className="notes-container">
                {selectedLead.notes && selectedLead.notes.length > 0 ? (
                  selectedLead.notes.map((note) => (
                    <div key={note.id} className="note-item">
                      <div className="note-header">
                        <div>
                          <span className="note-author">{note.author}</span>
                          <span className="note-time" style={{ marginLeft: '0.5rem' }}>{note.time}</span>
                        </div>
                        {editingNoteId !== note.id && (
                          <div className="note-actions">
                            <button className="note-action-btn" onClick={() => startEditingNote(note)}><Edit2 size={14} /></button>
                            <button className="note-action-btn delete" onClick={() => handleDeleteNote(note.id)} disabled={deletingNoteId === note.id}>
                              {deletingNoteId === note.id ? <Loader2 className="spin" size={14} /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {editingNoteId === note.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editNoteText}
                            onChange={(e) => setEditNoteText(e.target.value)}
                            style={{ flex: 1, padding: '0.5rem' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <button className="primary-btn" onClick={() => handleSaveEdit(note.id)} disabled={savingNoteId === note.id} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {savingNoteId === note.id ? <Loader2 className="spin" size={14} /> : 'Save'}
                          </button>
                          <button className="secondary-btn" onClick={() => setEditingNoteId(null)} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                        </div>
                        </div>
                      ) : (
                        <p className="note-text">{note.text}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                    No notes recorded for this lead yet.
                  </div>
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Type a new note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{ flex: 1, backgroundColor: '#f8fafc' }}
                />
                <button type="submit" className="primary-btn" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={!newNote.trim() || isSubmittingNote}>
                  {isSubmittingNote ? <><Loader2 className="spin" size={16} /> Posting...</> : <><MessageSquare size={16} /> Post Note</>}
                </button>
              </form>

              {/* Delete Lead Button */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => handleDeleteLead(selectedLead.id)} 
                  style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#fca5a5'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                >
                  <Trash2 size={16} /> Delete Lead Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Applicant Modal */}
      {convertingLead && (
        <StudentFormModal 
          student={convertingLead} 
          onClose={handleCancelConvert} 
          onSuccess={handleConvertSuccess}
          onAddLater={handleAddLater}
        />
      )}
    </div>
  );
}
