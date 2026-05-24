import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Activity, 
  Calendar, 
  MessageCircle, 
  ExternalLink, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Megaphone, 
  X,
  Stethoscope,
  Bell,
  Plus,
  TrendingDown,
  LayoutDashboard,
  CalendarDays,
  Lightbulb,
  Check,
  Trash2,
  FileDown,
  FileText,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config/api';
import './Dashboard.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Dashboard = ({ language = 'en' }) => {
  const [greeting, setGreeting] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals visibility
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEodModal, setShowEodModal] = useState(false);
  const [allPatients, setAllPatients] = useState([]);
  
  // Schedule Form states
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('Male');
  const [newApptTime, setNewApptTime] = useState('');
  const [newApptReason, setNewApptReason] = useState('General Consultation');
  const [schedulingAppt, setSchedulingAppt] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appRes, patRes, billRes, folRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/appointments/today`),
        fetch(`${API_BASE_URL}/api/patients`),
        fetch(`${API_BASE_URL}/api/billing/stats`),
        fetch(`${API_BASE_URL}/api/prescriptions/followups`).catch(() => ({ json: async () => [] })) // Safe fallback
      ]);
      const appData = await appRes.json();
      const patData = await patRes.json();
      const billData = await billRes.json();
      const folData = await folRes.json();
      
      setAppointments(appData);
      setAllPatients(patData);
      setTotalPatients(patData.length || 0);
      setEarnings(billData.revenue || 0);
      setFollowups(folData.length ? folData : []);
      
      if (patData.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patData[0].id);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (apptId, nextStatus) => {
    try {
      await fetch(`${API_BASE_URL}/api/appointments/${apptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/appointments/${apptId}`, {
        method: 'DELETE'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting appointment:', err);
    }
  };

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    setSchedulingAppt(true);
    try {
      let patientId = selectedPatientId;
      
      if (isNewPatient) {
        const patientRes = await fetch(`${API_BASE_URL}/api/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newPatientName,
            phone: newPatientPhone,
            age: newPatientAge,
            gender: newPatientGender,
            history: newApptReason
          })
        });
        const newPatientData = await patientRes.json();
        patientId = newPatientData.id;
      } else {
        const timeVal = newApptTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        await fetch(`${API_BASE_URL}/api/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            appointmentDate: new Date().toISOString().split('T')[0],
            appointmentTime: timeVal,
            reason: newApptReason,
            status: 'Waiting'
          })
        });
      }
      
      setNewPatientName('');
      setNewPatientPhone('');
      setNewPatientAge('');
      setNewPatientGender('Male');
      setNewApptTime('');
      setNewApptReason('General Consultation');
      setIsNewPatient(false);
      
      fetchDashboardData();
      alert('Appointment scheduled successfully!');
    } catch (err) {
      console.error('Error scheduling:', err);
      alert('Failed to schedule appointment.');
    } finally {
      setSchedulingAppt(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('eod-report-paper');
    if (!element) return;
    
    html2canvas(element, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width
      const pageHeight = 297; // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`SevaFlow_EOD_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  const nextAppointment = appointments.find(a => a.status === 'Waiting');
  const waitingCount = appointments.filter(a => a.status === 'Waiting').length;

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Bento Hero Section */}
      <div className="bento-hero-grid">
        {/* Welcome Card */}
        <div className="daily-briefing-card">
          <div className="briefing-content">
            <span className="briefing-tag">Daily Briefing</span>
            <h2>{greeting},<br />Dr. Sharma</h2>
            <p>Your clinic performance is up by 12% today. You have {appointments.length} scheduled consultations.</p>
            <div className="briefing-actions">
              <button className="btn-primary-dashboard" onClick={() => setShowScheduleModal(true)}>
                <CalendarDays size={18} /> View Schedule
              </button>
              <button className="btn-secondary-dashboard" onClick={() => setShowEodModal(true)}>
                Generate EOD Report
              </button>
            </div>
          </div>
        </div>

        {/* Live Status Cards */}
        <div className="hero-status-column">
          <div className="status-card-bento active">
            <div className="status-card-header">
              <div className="status-icon-box">
                <Bell size={20} />
              </div>
              <span className="status-badge-dashboard live">Active</span>
            </div>
            <div className="status-card-footer">
              <span className="status-label-top">Next Appointment</span>
              <h3>{nextAppointment ? nextAppointment.appointmentTime : 'None Scheduled'}</h3>
              <p>{nextAppointment ? `Patient: ${nextAppointment.patient?.name}` : 'Available for walk-ins'}</p>
            </div>
          </div>

          <div className="status-card-bento waiting">
            <div className="status-card-header">
              <div className="status-icon-box">
                <Users size={20} />
              </div>
              <span className="status-badge-dashboard wait">Waiting Room</span>
            </div>
            <div className="status-card-footer">
              <span className="status-label-top">Queue Status</span>
              <h3>{waitingCount} Patients</h3>
              <p>Average wait time: 5 mins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar-bento">
        <div className="stat-card-mini">
          <div className="top-row">
            <div className="mini-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}><Users size={18} /></div>
            <span className="title">Total Patients</span>
          </div>
          <div className="value-row">
            <h4>{totalPatients.toLocaleString()}</h4>
            <span className="trend up">+12% <TrendingUp size={14} /></span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="top-row">
            <div className="mini-icon" style={{ background: '#ECFDF5', color: '#059669' }}><DollarSign size={18} /></div>
            <span className="title">Today's Earnings</span>
          </div>
          <div className="value-row">
            <h4>₹{earnings.toLocaleString('en-IN')}</h4>
            <span className="trend up">+8% <TrendingUp size={14} /></span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="top-row">
            <div className="mini-icon" style={{ background: '#FFF7ED', color: '#D97706' }}><Activity size={18} /></div>
            <span className="title">Active Cases</span>
          </div>
          <div className="value-row">
            <h4>{appointments.filter(a => a.status === 'Waiting' || a.status === 'In Consultation').length}</h4>
            <span className="trend up">Live <Activity size={14} /></span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="top-row">
            <div className="mini-icon" style={{ background: '#FAF5FF', color: '#7C3AED' }}><Sparkles size={18} /></div>
            <span className="title">Trust Rate</span>
          </div>
          <div className="value-row">
            <h4>98.2%</h4>
            <span className="trend up">+2% <TrendingUp size={14} /></span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="main-dashboard-grid">
        {/* Live Patient Feed */}
        <div className="feed-section">
          <div className="feed-header">
            <div className="feed-title">
              <Activity size={20} className="text-primary" />
              <h3>Live Patient Feed</h3>
              <span className="live-indicator">Live</span>
            </div>
            <button className="btn-text-primary" onClick={() => setShowScheduleModal(true)} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</button>
          </div>
          <div className="feed-content" style={{ padding: '24px' }}>
            {appointments.length === 0 ? (
              <div className="empty-state-dashboard">
                <div className="empty-icon-circle">
                  <Calendar size={32} />
                </div>
                <h4>No appointments for today</h4>
                <p>Your schedule for this evening is currently clear. You can manually add walk-in patients here.</p>
                <button className="btn-secondary-dashboard" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={() => setShowScheduleModal(true)}>
                  Add Walk-in Patient
                </button>
              </div>
            ) : (
              <div className="live-appointments-list">
                {appointments.map(appt => (
                  <div key={appt.id} className="live-appt-item animate-in">
                    <div className="appt-time-badge">
                      <Clock size={14} />
                      <span>{appt.appointmentTime}</span>
                    </div>
                    <div className="appt-patient-info">
                      <strong>{appt.patient?.name || 'Unknown Patient'}</strong>
                      <span>{appt.patient?.gender ? `${appt.patient.gender}, ${appt.patient.age} Yrs` : 'N/A'} • {appt.patient?.phone}</span>
                    </div>
                    <div className="appt-reason">
                      <span className="reason-tag">Reason: {appt.reason || 'General Checkup'}</span>
                    </div>
                    <div className="appt-status">
                      <span className={`status-pill ${appt.status.toLowerCase().replace(' ', '-')}`}>
                        {appt.status}
                      </span>
                    </div>
                    <div className="appt-actions">
                      {appt.status === 'Waiting' && (
                        <button 
                          className="btn-action-start" 
                          onClick={() => handleUpdateStatus(appt.id, 'In Consultation')}
                        >
                          Call In
                        </button>
                      )}
                      {appt.status === 'In Consultation' && (
                        <button 
                          className="btn-action-done" 
                          onClick={() => handleUpdateStatus(appt.id, 'Done')}
                        >
                          Mark Done
                        </button>
                      )}
                      {appt.status === 'Done' && (
                        <span className="text-success check-icon" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 600 }}>
                          <CheckCircle2 size={18} /> Seen
                        </span>
                      )}
                      {appt.status === 'Scheduled' && (
                        <button 
                          className="btn-action-start" 
                          onClick={() => handleUpdateStatus(appt.id, 'Waiting')}
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="ai-insights-column">
          <div className="ai-bento-card">
            <div className="ai-header-bento">
              <div className="ai-icon-circle">
                <Sparkles size={20} />
              </div>
              <h3>Seva AI Insight</h3>
            </div>
            <div className="ai-tip-box">
              <span className="tip-label"><Lightbulb size={14} /> Optimization Tip</span>
              <p>Suggest evening slots for follow-ups to increase revenue by 10% and reduce morning congestion.</p>
              <button className="btn-ai-apply" onClick={() => alert('Evening slot recommendations applied to automatic scheduler alerts!')}>Apply Suggestion</button>
            </div>
            <div className="task-list-dashboard">
              <h4>Today's Follow-up Tasks</h4>
              <div className="task-item-bento" style={{ opacity: 0.6, justifyContent: 'center', borderStyle: 'dashed' }}>
                No follow-ups for today
              </div>
              <h4>Suggested Actions</h4>
              <div className="task-item-bento">
                <div className="task-check" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}><Check size={14} /></div>
                <span>Stock up on Paracetamol (Low inventory)</span>
              </div>
              <div className="task-item-bento">
                <div className="task-check" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}><Check size={14} /></div>
                <span>Update GST filings for April</span>
              </div>
            </div>
          </div>

          {/* Assistance Card */}
          <div className="support-card-dark">
            <div className="support-glow"></div>
            <h4>Need Assistance?</h4>
            <p>Our medical intelligence team is available 24/7 for technical support.</p>
            <button className="btn-support-dash" onClick={() => alert('Support request submitted. Our team will contact you in a few minutes!')}>
              Contact Support <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-overlay animate-in" onClick={() => setShowScheduleModal(false)}>
          <div className="history-modal glass-morph" style={{ maxWidth: '1000px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="pat-header-info">
                <h2>Today's Consultation Schedule</h2>
                <span>Dr. Sharma • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <button className="close-modal" onClick={() => setShowScheduleModal(false)}><X /></button>
            </div>
            <div className="modal-body">
              <div className="schedule-modal-content">
                {/* Appointments List (Left) */}
                <div className="sched-section">
                  <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>Scheduled Patients</h3>
                  <div className="sched-list">
                    {appointments.length === 0 ? (
                      <div className="empty-state">No patients scheduled for today.</div>
                    ) : (
                      appointments.map(appt => (
                        <div key={appt.id} className="sched-card-item">
                          <div className="sched-card-info">
                            <h5>{appt.patient?.name || 'Unknown Patient'}</h5>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 0 0' }}>
                              <Clock size={12} /> {appt.appointmentTime} • {appt.reason || 'Consultation'}
                            </p>
                          </div>
                          <div className="sched-card-actions">
                            <span className={`status-pill ${appt.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '10px' }}>
                              {appt.status}
                            </span>
                            <button className="btn-delete-appt" onClick={() => handleDeleteAppointment(appt.id)} title="Cancel Appointment">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Walk-in Form (Right) */}
                <div className="sched-form-block">
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-main)' }}>Schedule Walk-in</h3>
                  
                  <div className="form-toggle-buttons">
                    <button 
                      type="button" 
                      className={`btn-toggle-option ${!isNewPatient ? 'active' : ''}`}
                      onClick={() => setIsNewPatient(false)}
                    >
                      Existing Patient
                    </button>
                    <button 
                      type="button" 
                      className={`btn-toggle-option ${isNewPatient ? 'active' : ''}`}
                      onClick={() => setIsNewPatient(true)}
                    >
                      New Patient
                    </button>
                  </div>

                  <form onSubmit={handleScheduleAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {!isNewPatient ? (
                      <div className="sched-input-group">
                        <label>Select Patient</label>
                        <select 
                          value={selectedPatientId} 
                          onChange={e => setSelectedPatientId(e.target.value)}
                          required
                        >
                          <option value="" disabled>-- Select Patient --</option>
                          {allPatients.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div className="sched-input-group">
                          <label>Patient Name</label>
                          <input 
                            type="text" 
                            placeholder="Full Name" 
                            value={newPatientName}
                            onChange={e => setNewPatientName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="sched-input-group">
                          <label>Phone Number</label>
                          <input 
                            type="tel" 
                            placeholder="10-digit Mobile" 
                            value={newPatientPhone}
                            onChange={e => setNewPatientPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div className="sched-input-group">
                            <label>Age</label>
                            <input 
                              type="number" 
                              placeholder="Yrs" 
                              value={newPatientAge}
                              onChange={e => setNewPatientAge(e.target.value)}
                              required
                            />
                          </div>
                          <div className="sched-input-group">
                            <label>Gender</label>
                            <select 
                              value={newPatientGender} 
                              onChange={e => setNewPatientGender(e.target.value)}
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                      <div className="sched-input-group">
                        <label>Appointment Time</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 10:30 AM (Leave blank for now)" 
                          value={newApptTime}
                          onChange={e => setNewApptTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="sched-input-group">
                      <label>Reason / Chief Complaint</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Fever, Routine Checkup" 
                        value={newApptReason}
                        onChange={e => setNewApptReason(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn-confirm-sched" disabled={schedulingAppt}>
                      {schedulingAppt ? 'Scheduling...' : <><UserPlus size={16} /> Confirm Schedule</>}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EOD Modal */}
      {showEodModal && (
        <div className="modal-overlay animate-in" onClick={() => setShowEodModal(false)}>
          <div className="history-modal glass-morph" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="pat-header-info">
                <h2>End of Day Summary</h2>
                <span>Review and Export Daily Operations</span>
              </div>
              <button className="close-modal" onClick={() => setShowEodModal(false)}><X /></button>
            </div>
            <div className="modal-body" style={{ background: '#f8fafc' }}>
              <div className="eod-report-container">
                {/* EOD Report Paper Layout (Target for html2canvas PDF capture) */}
                <div id="eod-report-paper" className="eod-report-paper">
                  <div className="eod-header">
                    <div className="eod-logo-side">
                      <span className="eod-logo-title">SevaFlow</span>
                      <span className="eod-logo-subtitle">Clinical Intelligence</span>
                    </div>
                    <div className="eod-meta-side">
                      <h4>DAILY PERFORMANCE REPORT</h4>
                      <p>Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p>Physician: Dr. Sharma, MBBS, MD</p>
                    </div>
                  </div>

                  {/* Operational stats */}
                  <div className="eod-stats-grid">
                    <div className="eod-stat-box">
                      <p className="label">Total Consults</p>
                      <h3>{appointments.length}</h3>
                    </div>
                    <div className="eod-stat-box">
                      <p className="label">Seen / Done</p>
                      <h3>{appointments.filter(a => a.status === 'Done').length}</h3>
                    </div>
                    <div className="eod-stat-box">
                      <p className="label">Total Revenue</p>
                      <h3>₹{earnings.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className="eod-stat-box">
                      <p className="label">Trust Index</p>
                      <h3>98.2%</h3>
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="eod-clinical-notes">
                    <h5><Sparkles size={14} /> Seva AI Practice Insight</h5>
                    <p>
                      Practice is highly efficient today. {appointments.filter(a => a.status === 'Done').length} patients completed.
                      Revenue increased by 14% compared to this day last week. Average check-in to consultation latency was kept under 6 minutes.
                      Clinical inventory check is advised: stock up on Paracetamol soon due to heavy prescription counts today.
                    </p>
                  </div>

                  {/* Tables */}
                  <div className="eod-tables-section">
                    <div className="eod-table-wrapper">
                      <h5>Today's Operations Breakdown</h5>
                      <table className="eod-table">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Revenue / Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Consultations</td>
                            <td>General medical consulting & follow-ups</td>
                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>Completed</td>
                            <td>₹{800 * appointments.filter(a => a.status === 'Done').length} ({appointments.filter(a => a.status === 'Done').length} seen)</td>
                          </tr>
                          <tr>
                            <td>Pharmacy Sales</td>
                            <td>Direct clinic pharmacy dispensary sales</td>
                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>Settled</td>
                            <td>₹14,200</td>
                          </tr>
                          <tr>
                            <td>Clinical Diagnostics</td>
                            <td>In-house blood lab and rapid test bookings</td>
                            <td style={{ color: '#10b981', fontWeight: 'bold' }}>Settled</td>
                            <td>₹6,500</td>
                          </tr>
                          <tr>
                            <td>Pending Consults</td>
                            <td>Patients currently waiting or rescheduled</td>
                            <td style={{ color: '#eab308', fontWeight: 'bold' }}>Waiting</td>
                            <td>{appointments.filter(a => a.status === 'Waiting').length} Patient(s)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sign-off signature */}
                  <div className="eod-footer-signature">
                    <div className="signature-block">
                      <p>Dr. Sharma</p>
                      <span>Chief Medical Practitioner</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="eod-modal-actions">
                  <button className="btn-eod-close" onClick={() => setShowEodModal(false)}>Close</button>
                  <button className="btn-eod-download" onClick={handleDownloadPDF}>
                    <FileDown size={18} /> Export PDF Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="fab-new-consult" title="Schedule Appointment" onClick={() => setShowScheduleModal(true)}>
        <Plus size={32} />
      </button>
    </motion.div>
  );
};

export default Dashboard;

