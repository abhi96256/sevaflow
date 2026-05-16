import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Trash2,
  Bell
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './Broadcast.css';

const priorityOptions = ['Low', 'Normal', 'High', 'Urgent'];

const priorityConfig = {
  Low:    { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  icon: <Info size={14} /> },
  Normal: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)',  icon: <Bell size={14} /> },
  High:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   icon: <AlertTriangle size={14} /> },
  Urgent: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    icon: <AlertTriangle size={14} /> },
};

const Broadcast = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/announcements/global`);
      setHistory(res.data);
    } catch (err) {
      console.error('Could not load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await axios.post(`${API_BASE_URL}/api/announcements`, {
        title,
        message,
        priority,
        isGlobal: true,
      });
      setTitle('');
      setMessage('');
      setPriority('Normal');
      fetchHistory();
    } catch (err) {
      alert('Failed to send broadcast: ' + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="broadcast-page">
      <div className="bc-page-header">
        <div>
          <h2><Megaphone size={24} className="inline-icon" /> Global Broadcast Center</h2>
          <p>Send real-time announcements to all registered clinics on your platform.</p>
        </div>
      </div>

      <div className="bc-grid">
        {/* Compose Panel */}
        <div className="bc-compose sa-glass">
          <h3>Compose Announcement</h3>
          <form onSubmit={handleSend}>
            <div className="bc-form-group">
              <label>Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. Scheduled Maintenance Tonight"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="bc-form-group">
              <label>Message</label>
              <textarea
                rows={5}
                placeholder="Write your message to all clinics here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="bc-form-group">
              <label>Priority Level</label>
              <div className="priority-selector">
                {priorityOptions.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-btn ${priority === p ? 'selected' : ''}`}
                    style={priority === p ? { background: priorityConfig[p].bg, color: priorityConfig[p].color, borderColor: priorityConfig[p].color } : {}}
                    onClick={() => setPriority(p)}
                  >
                    {priorityConfig[p].icon} {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="bc-preview" style={{ borderColor: priorityConfig[priority].color }}>
              <div className="bc-preview-header" style={{ color: priorityConfig[priority].color }}>
                {priorityConfig[priority].icon}
                <span>Preview: How clinics will see this</span>
              </div>
              <div className="announce-banner-preview">
                <Megaphone size={16} />
                <div>
                  <strong>Admin Update: </strong>
                  <span>{message || 'Your message will appear here...'}</span>
                </div>
              </div>
            </div>

            <button type="submit" className="bc-send-btn" disabled={sending}>
              {sending ? (
                <><span className="bc-spinner"></span> Sending...</>
              ) : (
                <><Send size={18} /> Broadcast to All Clinics</>
              )}
            </button>
          </form>
        </div>

        {/* History Panel */}
        <div className="bc-history sa-glass">
          <h3><Clock size={18} /> Broadcast History</h3>
          {loadingHistory ? (
            <div className="bc-loading">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="bc-empty">No broadcasts sent yet. Compose your first message!</div>
          ) : (
            <div className="bc-history-list">
              {history.map(ann => {
                const cfg = priorityConfig[ann.priority] || priorityConfig['Normal'];
                return (
                  <div key={ann.id} className="bc-history-item" style={{ borderLeft: `3px solid ${cfg.color}` }}>
                    <div className="bc-hist-header">
                      <span className="bc-priority-tag" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.icon} {ann.priority}
                      </span>
                      <span className="bc-hist-date">
                        <Clock size={12} /> {new Date(ann.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h4>{ann.title}</h4>
                    <p>{ann.message}</p>
                    <div className="bc-hist-footer">
                      <span><CheckCircle2 size={12} color="#10b981" /> Delivered to all clinics</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Broadcast;
