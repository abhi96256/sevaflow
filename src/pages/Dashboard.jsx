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
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';

const Dashboard = ({ language = 'en' }) => {
  const [greeting, setGreeting] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [totalPatients, setTotalPatients] = useState(1284);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appRes, folRes] = await Promise.all([
        fetch('http://localhost:5000/api/patients/appointments'),
        fetch('http://localhost:5000/api/prescriptions/followups')
      ]);
      const appData = await appRes.json();
      const folData = await folRes.json();
      setAppointments(appData);
      setFollowups(folData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
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
              <button className="btn-primary-dashboard">
                <CalendarDays size={18} /> View Schedule
              </button>
              <button className="btn-secondary-dashboard">Generate EOD Report</button>
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
            <h4>1,284</h4>
            <span className="trend up">+12% <TrendingUp size={14} /></span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="top-row">
            <div className="mini-icon" style={{ background: '#ECFDF5', color: '#059669' }}><DollarSign size={18} /></div>
            <span className="title">Earnings</span>
          </div>
          <div className="value-row">
            <h4>₹85,400</h4>
            <span className="trend up">+8% <TrendingUp size={14} /></span>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="top-row">
            <div className="mini-icon" style={{ background: '#FFF7ED', color: '#D97706' }}><Activity size={18} /></div>
            <span className="title">Active Cases</span>
          </div>
          <div className="value-row">
            <h4>14</h4>
            <span className="trend down">-5% <TrendingDown size={14} /></span>
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
            <button className="btn-text-primary" style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</button>
          </div>
          <div className="feed-content">
            <div className="empty-state-dashboard">
              <div className="empty-icon-circle">
                <Calendar size={32} />
              </div>
              <h4>No appointments for today</h4>
              <p>Your schedule for this evening is currently clear. You can manually add walk-in patients here.</p>
              <button className="btn-secondary-dashboard" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                Add Walk-in Patient
              </button>
            </div>
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
              <button className="btn-ai-apply">Apply Suggestion</button>
            </div>
            <div className="task-list-dashboard">
              <h4>Today's Follow-up Tasks</h4>
              <div className="task-item-bento" style={{ opacity: 0.6, justifyContent: 'center', borderStyle: 'dashed' }}>
                No follow-ups for today
              </div>
              <h4>Suggested Actions</h4>
              <div className="task-item-bento">
                <div className="task-check"><Check size={14} /></div>
                <span>Stock up on Paracetamol (Low inventory)</span>
              </div>
              <div className="task-item-bento">
                <div className="task-check"><Check size={14} /></div>
                <span>Update GST filings for April</span>
              </div>
            </div>
          </div>

          {/* Assistance Card */}
          <div className="support-card-dark">
            <div className="support-glow"></div>
            <h4>Need Assistance?</h4>
            <p>Our medical intelligence team is available 24/7 for technical support.</p>
            <button className="btn-support-dash">
              Contact Support <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fab-new-consult" title="New Consultation">
        <Plus size={32} />
      </button>
    </motion.div>
  );
};

export default Dashboard;
