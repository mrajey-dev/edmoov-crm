import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GraduationCap,
  FileText,
  Settings,
  Bell,
  Calendar,
  BookOpen,
  MessageSquare,
  UserCircle,
  LogOut,
  Key,
  User as UserIcon,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import RawLeads from './pages/RawLeads';
import Universities from './pages/Universities';
import Courses from './pages/Courses';
import FollowUp from './pages/FollowUp';
import Services from './pages/Services';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PasswordReset from './pages/PasswordReset';
import AdminManagement from './pages/AdminManagement';
import { downloadPageAsPDF } from './utils/pdfExport';
import axios from 'axios';

// Set axios default header if token exists
const token = localStorage.getItem('auth_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('edmoov_admin_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 18) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return { subtitle: getGreeting(), title: currentUser?.name || (isSuperAdmin ? 'Super Admin' : 'Admin') };
      case '/raw-leads': return { subtitle: 'Overview', title: 'Raw Leads' };
      case '/students': return { subtitle: 'Overview', title: 'Applicants' };
      case '/universities': return { subtitle: 'Overview', title: 'Universities' };
      case '/applications': return { subtitle: 'Overview', title: 'Approved Applications' };
      case '/courses': return { subtitle: 'Overview', title: 'Courses' };
      case '/follow-up': return { subtitle: 'Overview', title: 'Lead Management' };
      case '/services': return { subtitle: 'Overview', title: 'Services' };
      case '/profile': return { subtitle: 'Account', title: 'My Profile' };
      case '/password-reset': return { subtitle: 'Security', title: 'Password Reset' };
      case '/admins': return { subtitle: 'System Control', title: 'Admin Management' };
      default: return { subtitle: 'Overview', title: 'Dashboard' };
    }
  };

  const pageTitle = getPageTitle();

  const handleLogin = (user) => {
    localStorage.setItem('edmoov_admin_auth', 'true');
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  if (location.pathname === '/login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <div className="app-container">
        {/* STICKY NAV SECTION */}
        <nav className="nav-bar sticky-nav">
          <div
            className="brand"
            onClick={() => navigate('/')}
            style={{ background: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'transform 0.2s ease' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 15 H75 V30 H45 V45 H70 V60 H45 V75 H75 V90 H25 Z" fill="#ff4500" />
              <path d="M10 70 Q 40 -10 90 20 Q 50 10 10 70 Z" fill="#facc15" />
              <path d="M40 50 Q 70 25 95 35 Q 70 40 40 50 Z" fill="#3b82f6" />
            </svg>
          </div>

          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink to="/raw-leads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <UserCircle size={16} /> Raw lead
            </NavLink>
            <NavLink to="/follow-up" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <MessageSquare size={16} /> Lead Management
            </NavLink>
            <NavLink to="/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={16} /> Applicants
            </NavLink>
            <NavLink to="/universities" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Briefcase size={16} /> Universities
            </NavLink>
            <NavLink to="/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BookOpen size={16} /> Courses
            </NavLink>
            <NavLink to="/services" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={16} /> Services
            </NavLink>
          </div>

          <div className="user-controls">
            <button className="icon-btn">
              <Settings size={18} />
            </button>
            <button className="icon-btn">
              <Bell size={18} />
            </button>
            <div style={{ position: 'relative' }}>
              <div
                className="user-profile"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <UserCircle size={36} color="white" style={{ opacity: 0.8 }} />
                <div className="user-info" style={{ marginLeft: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span className="user-name" style={{ color: 'white', fontWeight: 600 }}>
                    {currentUser?.name || 'Admin'}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: isSuperAdmin ? '#f59e0b' : '#3b82f6',
                    color: 'white',
                    fontWeight: 700,
                    marginLeft: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
                <ChevronDown size={16} color="white" style={{ marginLeft: '0.5rem', opacity: 0.7 }} />
              </div>

              {isProfileOpen && (
                <>
                  <div
                    className="dropdown-overlay"
                    onClick={() => setIsProfileOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                  />
                  <div className="profile-dropdown slideUp fadeIn">
                    <div style={{ padding: '0.65rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                        {currentUser?.name || 'Admin'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        @{currentUser?.username || 'admin'} • {isSuperAdmin ? 'Super Admin' : 'Regular Admin'}
                      </div>
                    </div>
                    {isSuperAdmin && (
                      <button
                        className="dropdown-item"
                        onClick={() => { setIsProfileOpen(false); navigate('/admins'); }}
                      >
                        <ShieldCheck size={16} /> Admins
                      </button>
                    )}
                    <button
                      className="dropdown-item"
                      onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}
                    >
                      <UserIcon size={16} /> My Profile
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => { setIsProfileOpen(false); navigate('/password-reset'); }}
                    >
                      <Key size={16} /> Password Reset
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item text-danger"
                      onClick={async () => {
                        setIsProfileOpen(false);
                        try {
                          await axios.post('http://127.0.0.1:8000/api/logout');
                        } catch (e) {
                          console.error('Logout error', e);
                        }
                        localStorage.removeItem('edmoov_admin_auth');
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user');
                        delete axios.defaults.headers.common['Authorization'];
                        setCurrentUser(null);
                        setIsAuthenticated(false);
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        <header className={`top-header ${location.pathname === '/' ? 'dashboard-header' : ''}`}>
          <div className="welcome-section">
            <div className="welcome-text">
              <h2>{pageTitle.subtitle}</h2>
              <h1>{pageTitle.title}</h1>
            </div>
            <div className="welcome-actions">
              <button
                className="primary-btn no-print"
                onClick={async () => {
                  setIsExporting(true);
                  await downloadPageAsPDF(`edmoov-${pageTitle.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
                  setIsExporting(false);
                }}
                disabled={isExporting}
              >
                {isExporting ? 'Generating...' : 'Export Data'}
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT SECTION */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/raw-leads" element={<RawLeads />} />
            <Route path="/students" element={<Students />} />
            <Route path="/applications" element={<Students isApplicationsPage={true} />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/follow-up" element={<FollowUp />} />
            <Route path="/services" element={<Services />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/admins" element={isSuperAdmin ? <AdminManagement /> : <Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default App;
