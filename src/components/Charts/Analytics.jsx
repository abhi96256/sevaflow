import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Activity, Zap, Brain, Target, ShieldCheck, Clock, Download, Filter, MoreHorizontal, Bell } from 'lucide-react';
import './Analytics.css';

const data = [
  { name: 'Mon', revenue: 4200, patients: 24, growth: 12 },
  { name: 'Tue', revenue: 3800, patients: 18, growth: 15 },
  { name: 'Wed', revenue: 6500, patients: 32, growth: 25 },
  { name: 'Thu', revenue: 4100, patients: 15, growth: 10 },
  { name: 'Fri', revenue: 5900, patients: 28, growth: 30 },
  { name: 'Sat', revenue: 3200, patients: 12, growth: 5 },
  { name: 'Sun', revenue: 4800, patients: 20, growth: 18 },
];

const diseaseData = [
  { name: 'Flu', count: 45, color: '#006aff' },
  { name: 'Diabetes', count: 32, color: '#6366f1' },
  { name: 'Hypertension', count: 28, color: '#8b5cf6' },
  { name: 'Back Pain', count: 18, color: '#ec4899' },
  { name: 'Allergy', count: 24, color: '#f43f5e' },
];

const healthScoreData = [
  { name: 'Score', value: 94, fill: '#006aff' },
  { name: 'Remainder', value: 6, fill: 'rgba(255,255,255,0.05)' }
];

const recentActivity = [
  { id: 1, type: 'appointment', user: 'Rahul Verma', time: '2 mins ago', status: 'Confirmed', amount: '₹500' },
  { id: 2, type: 'billing', user: 'Priya Singh', time: '15 mins ago', status: 'Paid', amount: '₹1,200' },
  { id: 3, type: 'patient', user: 'New Registration', time: '1 hour ago', status: 'Active', amount: '-' },
  { id: 4, type: 'billing', user: 'Amit Kumar', time: '3 hours ago', status: 'Pending', amount: '₹850' },
];

const Analytics = ({ language }) => {
  const [timeRange, setTimeRange] = useState('Weekly');

  const stats = [
    { title: 'Total Revenue', value: '₹48,250', trend: '+12.5%', icon: <DollarSign size={24} />, up: true },
    { title: 'Total Patients', value: '1,284', trend: '+8.2%', icon: <Users size={24} />, up: true },
    { title: 'Avg. Consultation', value: '18m', trend: '-2.4%', icon: <Activity size={24} />, up: false },
    { title: 'Appointments', value: '142', trend: '+15%', icon: <Calendar size={24} />, up: true },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip glass-panel" style={{ padding: '12px', border: '1px solid var(--border)' }}>
          <p className="label" style={{ fontWeight: 'bold', marginBottom: '8px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '0.9rem' }}>
              {entry.name}: <span style={{ fontWeight: 800 }}>{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <div className="header-left">
          <h2>{language === 'hi' ? 'विश्लेषण डैशबोर्ड' : 'Intelligence Analytics'}</h2>
          <p>{language === 'hi' ? 'आपके क्लिनिक के प्रदर्शन की रीयल-टाइम जानकारी' : 'Real-time insights and performance metrics for your clinic'}</p>
        </div>
        
        <div className="analytics-actions">
          <div className="analytics-filters">
            {['Daily', 'Weekly', 'Monthly', 'Yearly'].map((range) => (
              <button 
                key={range}
                className={`filter-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="export-btn glass-panel">
            <Download size={18} />
            {language === 'hi' ? 'रिपोर्ट डाउनलोड करें' : 'Export Report'}
          </button>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card glass-panel">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h4>{stat.title}</h4>
              <div className="value">{stat.value}</div>
            </div>
            <div className={`stat-trend ${stat.up ? 'up' : 'down'}`}>
              {stat.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {stat.trend} {language === 'hi' ? 'पिछले से' : 'vs last period'}
            </div>
          </div>
        ))}
      </div>

      <div className="main-charts">
        <div className="chart-box glass-panel">
          <h3>
            {language === 'hi' ? 'राजस्व और मरीज़ विश्लेषण' : 'Revenue & Patient Flow'}
            <div className="chart-actions">
               <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
               <MoreHorizontal size={18} />
            </div>
          </h3>
          <div className="chart-wrapper" style={{ height: '320px', minWidth: 0, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006aff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#006aff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-sub)" fontSize={12} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="var(--text-sub)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue"
                  stroke="#006aff" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="patients" 
                  name="Patients"
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPatients)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-box glass-panel health-score-box">
          <div className="health-header">
            <h3>{language === 'hi' ? 'स्वास्थ्य स्कोर' : 'Clinic Health Score'}</h3>
            <span className="badge">AI Powered</span>
          </div>
          <div className="score-container" style={{ height: '240px', position: 'relative', minWidth: 0, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthScoreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {healthScoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="score-text">
              <span className="percentage">94%</span>
              <span className="label">Excellent</span>
            </div>
          </div>
          <div className="score-details">
             <div className="detail-item">
               <ShieldCheck size={14} /> 
               <span>Patient Safety: 100%</span>
             </div>
             <div className="detail-item">
               <Zap size={14} /> 
               <span>Efficiency: 88%</span>
             </div>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="activity-section glass-panel">
          <div className="section-header">
            <h3>{language === 'hi' ? 'हालिया गतिविधि' : 'Recent Activity'}</h3>
            <button className="view-all">View All</button>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon-wrap ${activity.type}`}>
                  {activity.type === 'appointment' ? <Calendar size={18} /> : 
                   activity.type === 'billing' ? <DollarSign size={18} /> : <Users size={18} />}
                </div>
                <div className="activity-info">
                  <div className="row">
                    <span className="user-name">{activity.user}</span>
                    <span className="amount">{activity.amount}</span>
                  </div>
                  <div className="row sub">
                    <span className="time"><Clock size={12} /> {activity.time}</span>
                    <span className={`status ${activity.status.toLowerCase()}`}>{activity.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="demographics-section glass-panel">
          <h3>
            {language === 'hi' ? 'रोग प्रवृत्ति' : 'Disease Demographics'}
            <Activity size={18} style={{ color: 'var(--primary)' }} />
          </h3>
          <div className="chart-wrapper" style={{ height: '300px', minWidth: 0, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-sub)" fontSize={12} width={100} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20}>
                  {diseaseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="insights-row">
        <div className="insight-card glass-panel">
          <div className="insight-icon" style={{ color: '#006aff' }}>
            <Brain size={24} />
          </div>
          <div className="insight-info">
            <h5>AI Health Score</h5>
            <p>Your clinic efficiency is at 94%. We recommend optimizing Wednesday morning slots.</p>
            <span className="action-tag">Efficiency Tip</span>
          </div>
        </div>

        <div className="insight-card glass-panel">
          <div className="insight-icon" style={{ color: '#8b5cf6' }}>
            <Target size={24} />
          </div>
          <div className="insight-info">
            <h5>Growth Target</h5>
            <p>You're 12% ahead of your target. Predicted growth by month end is +24%.</p>
            <span className="action-tag">Milestone Near</span>
          </div>
        </div>

        <div className="insight-card glass-panel">
          <div className="insight-icon" style={{ color: '#10b981' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="insight-info">
            <h5>Patient Retention</h5>
            <p>Retention rate increased by 5% this week. Follow-up automated nudges are performing well.</p>
            <span className="action-tag">Trust Score: High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
