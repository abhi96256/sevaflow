import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  IndianRupee, 
  Activity, 
  Search, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Megaphone,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  MessageSquare,
  Server
} from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [clinics, setClinics] = useState([]);
  const [stats, setStats] = useState({ totalClinics: 0, totalPatients: 0, totalPrescriptions: 0, revenueEstimate: 0 });
  const [loading, setLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Mock revenue data for chart
  const revenueData = [
    { name: 'Jan', rev: 4000, clinics: 12 },
    { name: 'Feb', rev: 7000, clinics: 15 },
    { name: 'Mar', rev: 12000, clinics: 18 },
    { name: 'Apr', rev: 25000, clinics: 24 },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clinicsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/clinics'),
        axios.get('http://localhost:5000/api/clinics/stats')
      ]);
      setClinics(clinicsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if(!broadcastMessage) return;
    
    try {
      await axios.post('http://localhost:5000/api/announcements', {
        title: 'System Update',
        message: broadcastMessage,
        priority: 'High',
        isGlobal: true
      });
      alert(`Broadcast Sent to all ${clinics.length} clinics successfully!`);
      setBroadcastMessage('');
    } catch (err) {
      alert('Failed to send broadcast');
    }
  };

  return (
    <div className="sa-dashboard animate-in">
      <div className="sa-welcome-header">
        <div className="text-content">
          <h1>System Overview</h1>
          <p>Real-time analytics and global control for SevaFlow SAS Network.</p>
        </div>
        <div className="sa-header-actions">
          <button className="sa-btn-outline"><Plus size={16} /> New Deployment</button>
          <button className="sa-btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="sa-stats-grid">
        <div className="sa-card-stat grad-1">
          <div className="sa-card-inner">
            <div className="sa-card-icon"><Building2 /></div>
            <div className="sa-card-info">
              <span>Global Clinics</span>
              <h3>{stats.totalClinics}</h3>
              <div className="sa-stat-badge positive">
                <TrendingUp size={12} /> +12.5%
              </div>
            </div>
          </div>
          <div className="card-decoration"></div>
        </div>

        <div className="sa-card-stat grad-2">
          <div className="sa-card-inner">
            <div className="sa-card-icon"><IndianRupee /></div>
            <div className="sa-card-info">
              <span>Total Network Revenue</span>
              <h3>₹{stats.revenueEstimate.toLocaleString()}</h3>
              <div className="sa-stat-badge positive">
                <ArrowUpRight size={12} /> ₹42K today
              </div>
            </div>
          </div>
          <div className="card-decoration"></div>
        </div>

        <div className="sa-card-stat grad-3">
          <div className="sa-card-inner">
            <div className="sa-card-icon"><Users /></div>
            <div className="sa-card-info">
              <span>Active Patients</span>
              <h3>{stats.totalPatients.toLocaleString()}</h3>
              <div className="sa-stat-badge">
                <Activity size={12} /> Live Now
              </div>
            </div>
          </div>
          <div className="card-decoration"></div>
        </div>

        <div className="sa-card-stat grad-4">
          <div className="sa-card-inner">
            <div className="sa-card-icon"><Server /></div>
            <div className="sa-card-info">
              <span>Server Integrity</span>
              <h3>99.9%</h3>
              <div className="sa-stat-badge positive">
                <CheckCircle2 size={12} /> Healthy
              </div>
            </div>
          </div>
          <div className="card-decoration"></div>
        </div>
      </div>

      <div className="sa-main-grid">
        {/* Revenue Chart */}
        <div className="sa-chart-panel sa-glass">
          <div className="panel-header">
            <h3>Revenue Growth</h3>
            <select>
              <option>Last 6 Months</option>
              <option>Yearly</option>
            </select>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="rev" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Broadcast Center */}
        <div className="sa-broadcast-panel sa-glass">
          <div className="panel-header">
            <h3><Megaphone size={18} /> Global Broadcast</h3>
            <span>Send alerts to all Clinics</span>
          </div>
          <textarea 
            placeholder="Important update: System maintenance scheduled for tonight at 2 AM..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
          ></textarea>
          <button className="sa-btn-primary" onClick={handleBroadcast}>
            Push Announcement
          </button>
        </div>
      </div>

      <div className="sa-secondary-grid">
        {/* Registered Clinics List */}
        <div className="sa-table-panel sa-glass">
          <div className="panel-header">
            <h3>Recent Onboardings</h3>
            <button className="sa-link">View All Clinics</button>
          </div>
          <div className="sa-table-scroll">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Clinic</th>
                  <th>Plan</th>
                  <th>Patients</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="sa-clinic-cell">
                        <strong>{c.name}</strong>
                        <span>{c.ownerName}</span>
                      </div>
                    </td>
                    <td><span className="plan-badge">{c.subscriptionPlan || 'Pro'}</span></td>
                    <td>{c.patients || 0}</td>
                    <td>₹{(c.revenue || 5000).toLocaleString()}</td>
                    <td><span className="dot-active"></span> Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Hub */}
        <div className="sa-support-panel sa-glass">
          <div className="panel-header">
            <h3><MessageSquare size={18} /> Support Tickets</h3>
            <span className="count-badge">2 New</span>
          </div>
          <div className="ticket-list">
            <div className="ticket-item">
              <div className="ticket-info">
                <strong>Issue with AI Rx decoding</strong>
                <span>Dr. Sharma • Seva Clinics</span>
              </div>
              <span className="priority high">High</span>
            </div>
            <div className="ticket-item">
              <div className="ticket-info">
                <strong>Request for multi-doc billing</strong>
                <span>Dr. Verma • Heart Center</span>
              </div>
              <span className="priority low">Normal</span>
            </div>
          </div>
          <button className="sa-btn-outline">Open Support Portal</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
