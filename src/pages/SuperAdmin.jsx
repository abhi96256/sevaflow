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
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './SuperAdmin.css';

const SuperAdmin = () => {
  const [clinics, setClinics] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalClinics: 0, totalPatients: 0, totalPrescriptions: 0, revenueEstimate: 0 });
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClinic, setNewClinic] = useState({ name: '', ownerName: '', email: '', phone: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clinicsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/clinics`),
        axios.get(`${API_BASE_URL}/api/clinics/stats`)
      ]);
      setClinics(clinicsRes.data);
      setGlobalStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Clinics', value: globalStats.totalClinics, icon: <Building2 />, color: '#4F46E5', trend: '+12%' },
    { label: 'Total Patients', value: globalStats.totalPatients, icon: <Users />, color: '#10B981', trend: '+8%' },
    { label: 'SaaS Revenue', value: `₹${globalStats.revenueEstimate.toLocaleString()}`, icon: <IndianRupee />, color: '#F59E0B', trend: '+15%' },
    { label: 'Total Rx', value: globalStats.totalPrescriptions, icon: <Activity />, color: '#EF4444', trend: 'Live' },
  ];

  const handleAddClinic = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/clinics', newClinic);
      setShowAddModal(false);
      setNewClinic({ name: '', ownerName: '', email: '', phone: '' });
      fetchData(); // Refresh list
    } catch (err) {
      alert('Error creating clinic: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="super-admin-container">
      <div className="admin-header">
        <div className="title-section">
          <h1>Super Admin <span className="badge">Control Center</span></h1>
          <p>Managing the "Hlo SAS" Healthcare Ecosystem</p>
        </div>
        <div className="header-actions">
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Onboard New Clinic
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card glass-morph">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-value-group">
                <span className="stat-value">{stat.value}</span>
                <span className={`stat-trend ${stat.trend.includes('+') ? 'up' : 'live'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="admin-content-grid">
        <div className="clinics-table-section glass-morph">
          <div className="section-header">
            <h3>Registered Clinics</h3>
            <div className="table-filters">
              <div className="search-bar-admin">
                <Search size={18} />
                <input type="text" placeholder="Search clinics or owners..." />
              </div>
              <button className="filter-btn"><Filter size={18} /></button>
            </div>
          </div>

          <table className="clinics-table">
            <thead>
              <tr>
                <th>Clinic Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Total Patients</th>
                <th>Revenue</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map(clinic => (
                <tr key={clinic.id}>
                  <td>
                    <div className="clinic-cell">
                      <div className="clinic-avatar">{clinic.name.charAt(0)}</div>
                      <div className="clinic-name-info">
                        <strong>{clinic.name}</strong>
                        <span>ID: #CL-{clinic.id}024</span>
                      </div>
                    </div>
                  </td>
                  <td>{clinic.ownerName}</td>
                  <td>
                    <span className={`status-tag ${clinic.status.toLowerCase()}`}>
                      {clinic.status === 'Active' ? <CheckCircle2 size={12} /> : clinic.status === 'Pending' ? <Activity size={12} /> : <XCircle size={12} />}
                      {clinic.status}
                    </span>
                  </td>
                  <td>{clinic.patients || 0}</td>
                  <td><strong>₹{(clinic.revenue || 0).toLocaleString()}</strong></td>
                  <td>{new Date(clinic.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="icon-btn-admin"><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-sidebar">
          <div className="system-health glass-morph">
            <h3>System Health</h3>
            <div className="health-item">
              <span>API Gateway</span>
              <span className="health-dot online"></span>
            </div>
            <div className="health-item">
              <span>MySQL Database</span>
              <span className="health-dot online"></span>
            </div>
            <div className="health-item">
              <span>Gemini AI Engine</span>
              <span className="health-dot online"></span>
            </div>
          </div>

          <div className="recent-activity glass-morph">
            <h3>Recent Logins</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="act-icon"><ShieldCheck size={16} /></div>
                <div className="act-info">
                  <strong>Dr. Sharma logged in</strong>
                  <span>Seva Clinics • 2 mins ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="act-icon"><TrendingUp size={16} /></div>
                <div className="act-info">
                  <strong>New Subscription</strong>
                  <span>Wellness Pathlab • 1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Clinic Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal glass-morph animate-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Onboard New Clinic</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddClinic}>
              <div className="form-group">
                <label>Clinic Name</label>
                <input 
                  type="text" 
                  placeholder="Enter Clinic Name" 
                  value={newClinic.name}
                  onChange={e => setNewClinic({...newClinic, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Owner / Lead Doctor</label>
                <input 
                  type="text" 
                  placeholder="Dr. Name" 
                  value={newClinic.ownerName}
                  onChange={e => setNewClinic({...newClinic, ownerName: e.target.value})}
                  required 
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="clinic@example.com" 
                    value={newClinic.email}
                    onChange={e => setNewClinic({...newClinic, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91..." 
                    value={newClinic.phone}
                    onChange={e => setNewClinic({...newClinic, phone: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn-admin">Confirm Onboarding</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
