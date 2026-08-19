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
  PieChart, Pie, Cell, Legend
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
    lead_trend_data: defaultLeadTrendData,
    recent_leads: [],
    lead_distribution: defaultLeadDistribution,
    spark_data: {
      universities: defaultSparkData,
      applications: defaultSparkData,
      students: defaultSparkData,
      leads: defaultSparkData
    }
  });
  const [isLoading, setIsLoading] = React.useState(true);

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
      <div className="stats-row">
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
              <div key={index} className="legend-item">
                <div className="legend-label">
                  <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </div>
                <span className="legend-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Active Universities / Jobs */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-wrap">
              <span className="card-title">Top Universities</span>
              <span className="card-subtitle">24 <span>Institutions</span></span>
            </div>
            <div className="card-actions">
              <button className="icon-btn-small"><ArrowLeft size={16} /></button>
              <button className="icon-btn-small"><ArrowRight size={16} /></button>
            </div>
          </div>
          <div className="list-container">
            <div className="list-item">
              <div className="list-icon" style={{ color: '#f97316' }}><Briefcase size={20} /></div>
              <div className="list-content">
                <div className="list-title">Harvard University</div>
                <div className="list-desc">USA</div>
              </div>
            </div>
            <div className="list-item">
              <div className="list-icon" style={{ color: '#22c55e' }}><Briefcase size={20} /></div>
              <div className="list-content">
                <div className="list-title">Oxford University</div>
                <div className="list-desc">UK</div>
              </div>
            </div>
            <div className="list-item">
              <div className="list-icon" style={{ color: '#3b82f6' }}><Briefcase size={20} /></div>
              <div className="list-content">
                <div className="list-title">University of Toronto</div>
                <div className="list-desc">Canada</div>
              </div>
            </div>
            <div className="list-item">
              <div className="list-icon" style={{ color: '#64748b' }}><Briefcase size={20} /></div>
              <div className="list-content">
                <div className="list-title">University of Melbourne</div>
                <div className="list-desc">Australia</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-wrap">
              <span className="card-title">Top Courses</span>
              <span className="card-subtitle">15 <span>Programs</span></span>
            </div>
            <div className="card-actions">
              <button className="icon-btn-small"><ArrowLeft size={16} /></button>
              <button className="icon-btn-small"><ArrowRight size={16} /></button>
            </div>
          </div>
          <div className="list-container">
            <div className="list-item">
              <div className="list-icon" style={{ color: '#f97316' }}><BookOpen size={20} /></div>
              <div className="list-content">
                <div className="list-title">MBA</div>
                <div className="list-desc">Business Administration</div>
              </div>
            </div>
            <div className="list-item">
              <div className="list-icon" style={{ color: '#3b82f6' }}><BookOpen size={20} /></div>
              <div className="list-content">
                <div className="list-title">MSc Computer Science</div>
                <div className="list-desc">Technology & Engineering</div>
              </div>
            </div>
            <div className="list-item">
              <div className="list-icon" style={{ color: '#22c55e' }}><BookOpen size={20} /></div>
              <div className="list-content">
                <div className="list-title">Data Science</div>
                <div className="list-desc">Analytics</div>
              </div>
            </div>
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
