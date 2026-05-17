import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Phone, User, Calendar, History, Save, Sparkles, Filter, ListFilter, LayoutGrid, MoreVertical, Edit, Info, TrendingUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './PatientManager.css';

const PatientManager = ({ language }) => {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ totalPatients: 0, pendingRecords: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    history: ''
  });

  useEffect(() => {
    fetchPatients();
    fetchStats();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patients/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/patients`, newPatient);
      setNewPatient({ name: '', age: '', gender: 'Male', phone: '', history: '' });
      setShowAddForm(false);
      fetchPatients();
      fetchStats();
    } catch (err) {
      alert('Error adding patient');
    }
  };

  const getNewPatientsCount = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return patients.filter(p => {
      if (!p.createdAt) return false;
      const createdDate = new Date(p.createdAt);
      return createdDate >= startOfMonth;
    }).length;
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  // Helper to determine status for UI demo
  const getStatus = (patient, index) => {
    if (index === 1) return 'critical';
    if (index === 2) return 'new';
    return 'regular';
  };

  const getInitialsColor = (status) => {
    if (status === 'critical') return 'critical';
    if (status === 'new') return 'new';
    return 'regular';
  };

  return (
    <motion.div 
      className="patient-manager-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="manager-header">
        <div className="title-group">
          <h1>{language === 'hi' ? 'मरीज प्रबंधन' : 'Patient Management'}</h1>
          <div className="subtitle">
            <Sparkles size={18} color="#006970" /> 
            <span>Manage and review patient clinical records with precision</span>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="add-patient-btn" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <UserPlus size={20} /> 
          <span>{showAddForm ? 'Close Form' : 'Add New Patient'}</span>
        </motion.button>
      </header>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="add-patient-form bento-card"
            style={{ marginBottom: '24px' }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Register New Patient</h3>
            <form onSubmit={handleAddPatient}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Full Name</label>
                  <input 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    type="text" required value={newPatient.name}
                    onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                    placeholder="Patient Name"
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Age</label>
                  <input 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    type="number" value={newPatient.age}
                    onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                    placeholder="Yrs"
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Gender</label>
                  <select 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Phone</label>
                  <input 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    type="text" value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    placeholder="Mobile Number"
                  />
                </div>
              </div>
              <button type="submit" className="add-patient-btn" style={{ width: '100%', justifyContent: 'center' }}>
                <Save size={18} /> Save Record
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="bento-section">
        <div className="list-toolbar">
          <div className="search-filter-wrapper">
            <Filter size={18} className="filter-icon" />
            <input 
              type="text" 
              placeholder="Filter by patient name, ID, or mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="toolbar-actions">
            <button className="action-btn">
              <ListFilter size={18} />
              <span>Recent</span>
            </button>
            <button className="action-btn">
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        <motion.div 
          className="patient-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredPatients.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#666' }}>
              No patients found.
            </div>
          ) : (
            <>
              {filteredPatients.map((p, index) => {
                const status = getStatus(p, index);
                return (
                  <motion.div key={p.id || index} variants={itemVariants} className="bento-card">
                    <div className="card-header">
                      <div className="p-identity">
                        <div className={`p-avatar-large ${getInitialsColor(status)}`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="p-info">
                          <h3>{p.name}</h3>
                          <div className="badge-row">
                            <span className={`status-badge ${status}`}>
                              {status.toUpperCase()}
                            </span>
                            <span className="p-id">ID: #SF-{Math.floor(1000 + Math.random() * 9000)}</span>
                          </div>
                        </div>
                      </div>
                      <button className="edit-btn-icon" style={{ background: 'transparent' }}>
                        <MoreVertical size={18} />
                      </button>
                    </div>
                    
                    <div className="card-details">
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>{p.age || '??'} Yrs • {p.gender}</span>
                      </div>
                      <div className="detail-item">
                        <Phone size={16} />
                        <span>{p.phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button className="view-record-btn">View Record</button>
                      <button className="edit-btn-icon">
                        <Edit size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {/* Asymmetric Bento Card for Stats */}
              <motion.div variants={itemVariants} className="bento-card stats-card-wide">
                <div className="stats-info">
                  <div className="stats-tag">
                    <Info size={16} />
                    <span>QUICK STATS</span>
                  </div>
                  <h4>Patient demographics growth this month</h4>
                  <p>You've added {getNewPatientsCount()} new patients since May 1st. AI suggests reviewing recent clinical histories for potential anomalies.</p>
                  
                  <div className="stats-numbers">
                    <div className="stat-number-item">
                      <p>{stats.totalPatients}</p>
                      <p>Total Patients</p>
                    </div>
                    <div className="stat-number-item">
                      <p>{stats.pendingRecords}</p>
                      <p>Pending Records</p>
                    </div>
                  </div>
                </div>
                <div className="stats-visual">
                  <TrendingUp size={64} color="var(--primary)" />
                </div>
              </motion.div>
            </>
          )}
        </motion.div>

        <div className="load-more-footer">
          <button className="load-more-btn">
            <span>Load 12 more records</span>
            <ChevronDown size={20} />
          </button>
        </div>
      </section>
    </motion.div>
  );
};

export default PatientManager;
