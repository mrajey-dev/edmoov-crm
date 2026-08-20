import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Briefcase,
  FileText,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  BookOpen,
  CheckCircle,
  ChevronDown,
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const API_URL = 'http://127.0.0.1:8000/api/dashboard/stats';

// Static fallback data for initial render to prevent crashes before load
const defaultLeadTrendData = [
  { name: 'Jan', leads: 0 },
  { name: 'Feb', leads: 0 },
  { name: 'Mar', leads: 0 },
  { name: 'Apr', leads: 0 },
  { name: 'May', leads: 0 },
  { name: 'Jun', leads: 0 },
];

const defaultSparkData = [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];

const defaultLeadDistribution = [
  { name: 'Loading Leads', value: 100, color: '#e2e8f0' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({
    total_students: 0,
    active_applications: 0,
    partner_universities: 0,
    courses_offered: 0,
    total_leads: 0,
    success_rate: 0,
    total_revenue: 0,
    lead_trend_data: defaultLeadTrendData,
    recent_leads: [],
    lead_distribution: defaultLeadDistribution,
    revenue_by_lead_type: [],
    spark_data: {
      universities: defaultSparkData,
      applications: defaultSparkData,
      students: defaultSparkData,
      leads: defaultSparkData
    }
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const [enrollmentPeriod, setEnrollmentPeriod] = React.useState('1m');

  const [enrollmentData, setEnrollmentData] = React.useState({
    current_enrollments: 0,
    previous_enrollments: 0,
    growth: 0,
    chart_data: []
  });

  const [isEnrollmentLoading, setIsEnrollmentLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(API_URL);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  React.useEffect(() => {
    const fetchEnrollments = async () => {
      setIsEnrollmentLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/dashboard/enrollments?period=${enrollmentPeriod}`);
        setEnrollmentData(response.data);
      } catch (error) {
        console.error('Failed to fetch enrollment data:', error);
      } finally {
        setIsEnrollmentLoading(false);
      }
    };
    fetchEnrollments();
  }, [enrollmentPeriod]);

  const renderGrowth = (value) => {
    if (value === undefined || value === null) return <Loader2 size={12} className="spinner" />;
    const isPositive = value >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? '#10b981' : '#ef4444';
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color, fontWeight: 600 }}>
        <Icon size={14} /> {isPositive ? '+' : ''}{value}%
      </span>
    );
  };

  return (
    <div className="dashboard-wrapper">
      {/* Stats Row */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Card 1: Dark Green (Students) */}
        <div className="stat-card-modern dark-green" onClick={() => navigate('/students')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <BookOpen size={24} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-card-title">Total Students</div>
          <div className="stat-card-body">
            <div className="stat-value">
              {isLoading ? <Loader2 className="spinner" size={32} /> : stats.total_students}
            </div>
            <div className="stat-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {renderGrowth(stats.growth?.students)} <span style={{ color: 'var(--text-muted)' }}>vs Last Month</span>
            </div>
          </div>
        </div>

        {/* Card 2: White (Applications) */}
        <div className="stat-card-modern" onClick={() => navigate('/applications')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <Users size={24} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-card-title">Approved Applications</div>
          <div className="stat-card-body">
            <div className="stat-value">
              {isLoading ? <Loader2 className="spinner" size={32} /> : stats.active_applications}
            </div>
            <div className="stat-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {renderGrowth(stats.growth?.applications)} <span style={{ color: 'var(--text-muted)' }}>vs Last Month</span>
            </div>
          </div>
        </div>

        {/* Card 3: White (Courses) */}
        <div className="stat-card-modern" onClick={() => navigate('/courses')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <FileText size={24} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-card-title">Total Courses</div>
          <div className="stat-card-body">
            <div className="stat-value">
              {isLoading ? <Loader2 className="spinner" size={32} /> : stats.courses_offered}
            </div>
            <div className="stat-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {renderGrowth(stats.growth?.courses)} <span style={{ color: 'var(--text-muted)' }}>vs Last Month</span>
            </div>
          </div>
        </div>

        {/* Card 4: White (Leads) */}
        <div className="stat-card-modern" onClick={() => navigate('/follow-up')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <CheckCircle size={24} strokeWidth={2} />
            </div>
          </div>
          <div className="stat-card-title">Total Leads</div>
          <div className="stat-card-body">
            <div className="stat-value">
              {isLoading ? <Loader2 className="spinner" size={32} /> : stats.total_leads}
            </div>
            <div className="stat-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {renderGrowth(stats.growth?.leads)} <span style={{ color: 'var(--text-muted)' }}>vs Last Month</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Student Enrollments Interactive Section */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Student Enrollments</h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>New students registered</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
              {['1m', '3m', '6m', '1y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setEnrollmentPeriod(period)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: enrollmentPeriod === period ? '#fff' : 'transparent',
                    boxShadow: enrollmentPeriod === period ? 'var(--shadow-sm)' : 'none',
                    color: enrollmentPeriod === period ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: enrollmentPeriod === period ? 600 : 500,
                    transition: 'all 0.2s ease',
                    fontSize: '0.875rem'
                  }}
                >
                  {period.toUpperCase()}
                </button>
              ))}
            </div>
            
            <div style={{ textAlign: 'right', minWidth: '150px' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
               {isEnrollmentLoading ? <Loader2 className="spinner" size={32} /> : `${enrollmentData.current_enrollments.toLocaleString()}`}
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
               {isEnrollmentLoading ? null : renderGrowth(enrollmentData.growth)}
               <span style={{ color: 'var(--text-muted)' }}>
                 vs previous {enrollmentPeriod === '1m' ? 'month' : enrollmentPeriod === '3m' ? '3 months' : enrollmentPeriod === '6m' ? '6 months' : 'year'}
               </span>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ height: '300px', width: '100%', position: 'relative' }}>
             {isEnrollmentLoading ? (
               <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
                 <Loader2 className="spinner" size={40} color="var(--primary-main)" />
               </div>
             ) : null}
             <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrollmentData.chart_data}>
                    <defs>
                      <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-main)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary-main)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPrevEnrollments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)', padding: '12px' }}
                      itemStyle={{ fontWeight: 600 }}
                      formatter={(value, name) => [
                        `${value.toLocaleString()}`, 
                        name === 'enrollments' ? 'Current Period' : 'Previous Period'
                      ]}
                      labelStyle={{ color: 'var(--text-muted)', marginBottom: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="previous_enrollments" 
                      stroke="#cbd5e1" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={1} 
                      fill="url(#colorPrevEnrollments)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="enrollments" 
                      stroke="var(--primary-main)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorEnrollments)" 
                    />
                  </AreaChart>
             </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Recent Leads */}
        <div className="chart-card">
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 className="chart-title">Recent Leads</h3>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Latest additions to the CRM</span>
            </div>
            <button
              onClick={() => navigate('/follow-up')}
              className="primary-btn"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '6px' }}
            >
              View All
            </button>
          </div>
          <div className="chart-wrapper" style={{ overflowY: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 0' }}>Name</th>
                  <th style={{ padding: '0.75rem 0' }}>Status</th>
                  <th style={{ padding: '0.75rem 0' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_leads?.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 500, color: 'var(--text-main)' }}>{lead.name}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span className="stat-sub-badge" style={{ textTransform: 'capitalize', backgroundColor: 'var(--bg-secondary)' }}>
                        {lead.type}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {!stats.recent_leads?.length && !isLoading && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No leads found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie Chart: Lead Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Lead Distribution</h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current CRM pipeline health</span>
          </div>
          <div className="chart-wrapper pie" style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.lead_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.lead_distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      onClick={() => navigate(`/students?lead_type=${entry.name.split(' ')[0].toLowerCase()}`)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="custom-legend">
            {stats.lead_distribution.map((item, index) => (
              <div
                key={index}
                className="legend-item"
                style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => navigate(`/students?lead_type=${item.name.split(' ')[0].toLowerCase()}`)}
              >
                <div className="legend-label" style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                  {item.name} <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem', fontSize: '0.75rem' }}>({item.value})</span>
                </div>
                <span className="legend-value" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                  ₹{item.revenue?.toLocaleString() || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-title-wrap">
              <span className="card-title">Top Universities</span>
              <span className="card-subtitle">{stats.top_universities?.length || 0} <span>Institutions</span></span>
            </div>
            <div className="card-actions">
              <button className="icon-btn-small"><ArrowLeft size={16} /></button>
              <button className="icon-btn-small"><ArrowRight size={16} /></button>
            </div>
          </div>
          <div className="list-container">
            {stats.top_universities && stats.top_universities.map((uni, index) => (
              <div className="list-item" key={index}>
                <div className="list-icon" style={{ color: ['#f97316', '#22c55e', '#3b82f6', '#64748b', '#8b5cf6'][index % 5] }}><Briefcase size={20} /></div>
                <div className="list-content" style={{ flex: 1 }}>
                  <div className="list-title">{uni.name}</div>
                  <div className="list-desc">{uni.country}</div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>
                  {uni.count} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>Leads</span>
                </div>
              </div>
            ))}
            {(!stats.top_universities || stats.top_universities.length === 0) && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data available</div>
            )}
          </div>
        </div>

        {/* Top Courses */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-wrap">
              <span className="card-title">Top Courses</span>
              <span className="card-subtitle">{stats.top_courses?.length || 0} <span>Programs</span></span>
            </div>
            <div className="card-actions">
              <button className="icon-btn-small"><ArrowLeft size={16} /></button>
              <button className="icon-btn-small"><ArrowRight size={16} /></button>
            </div>
          </div>
          <div className="list-container">
            {stats.top_courses && stats.top_courses.map((course, index) => (
              <div className="list-item" key={index}>
                <div className="list-icon" style={{ color: ['#8b5cf6', '#ef4444', '#14b8a6', '#f59e0b', '#3b82f6'][index % 5] }}><BookOpen size={20} /></div>
                <div className="list-content" style={{ flex: 1 }}>
                  <div className="list-title">{course.name}</div>
                  <div className="list-desc">{course.university}</div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>
                  {course.count} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>Leads</span>
                </div>
              </div>
            ))}
            {(!stats.top_courses || stats.top_courses.length === 0) && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data available</div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Employment Status -> Application Status */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <span className="card-title">Application Status</span>
              <MoreHorizontal size={20} color="#64748b" />
            </div>
            <div className="progress-container">
              <div className="progress-header">
                <span>Total Applicants</span>
                <strong>{isLoading ? <Loader2 className="spinner" size={16} /> : stats.total_students}</strong>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-segment" style={{ width: '40%', backgroundColor: '#3b82f6' }}></div>
                <div className="progress-segment" style={{ width: '30%', backgroundColor: '#60a5fa' }}></div>
                <div className="progress-segment" style={{ width: '20%', backgroundColor: '#facc15' }}></div>
                <div className="progress-segment" style={{ width: '10%', backgroundColor: '#ff4500' }}></div>
              </div>
              <div className="legend-list">
                <div className="legend-item">
                  <div className="legend-label">
                    <div className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></div>
                    Accepted
                  </div>
                  <span className="legend-value">1243</span>
                </div>
                <div className="legend-item">
                  <div className="legend-label">
                    <div className="legend-dot" style={{ backgroundColor: '#60a5fa' }}></div>
                    In Review
                  </div>
                  <span className="legend-value">932</span>
                </div>
                <div className="legend-item">
                  <div className="legend-label">
                    <div className="legend-dot" style={{ backgroundColor: '#facc15' }}></div>
                    Submitted
                  </div>
                  <span className="legend-value">621</span>
                </div>
                <div className="legend-item">
                  <div className="legend-label">
                    <div className="legend-dot" style={{ backgroundColor: '#ff4500' }}></div>
                    Rejected
                  </div>
                  <span className="legend-value">313</span>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
