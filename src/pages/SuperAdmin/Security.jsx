import React from 'react';
import { ShieldCheck, Lock, Eye, Terminal, Activity, FileWarning } from 'lucide-react';
import './Security.css';

const systemLogs = [
  { id: 1, event: 'New Clinic Onboarded', user: 'System', time: '2 mins ago', status: 'Success' },
  { id: 2, event: 'Database Backup', user: 'Auto-Cron', time: '1 hour ago', status: 'Success' },
  { id: 3, event: 'Failed Login Attempt', user: 'Unknown IP', time: '3 hours ago', status: 'Warning' },
  { id: 4, event: 'API Key Rotated', user: 'Admin', time: '5 hours ago', status: 'Success' },
  { id: 5, event: 'System Maintenance', user: 'System', time: '1 day ago', status: 'Success' },
];

const Security = () => {
  return (
    <div className="security-page">
      <div className="sec-header">
        <h2><ShieldCheck size={24} color="#ef4444" /> Security & System Logs</h2>
        <p>Monitor system health, access logs, and security events.</p>
      </div>

      <div className="sec-grid">
        <div className="sec-card sa-glass">
          <div className="sec-icon-box red"><Lock size={20} /></div>
          <div className="sec-info">
            <span>Security Status</span>
            <h4>System Protected</h4>
            <div className="sec-badge green">All Systems Nominal</div>
          </div>
        </div>
        <div className="sec-card sa-glass">
          <div className="sec-icon-box blue"><Eye size={20} /></div>
          <div className="sec-info">
            <span>Last Audit</span>
            <h4>Today, 10:30 AM</h4>
            <div className="sec-badge blue">0 Threats Found</div>
          </div>
        </div>
        <div className="sec-card sa-glass">
          <div className="sec-icon-box purple"><Terminal size={20} /></div>
          <div className="sec-info">
            <span>Uptime</span>
            <h4>99.98%</h4>
            <div className="sec-badge purple">Live for 42 days</div>
          </div>
        </div>
      </div>

      <div className="logs-panel sa-glass">
        <div className="panel-header">
          <h3><Activity size={18} /> System Audit Logs</h3>
          <button className="sa-btn-outline" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Download Logs</button>
        </div>
        <div className="logs-list">
          {systemLogs.map(log => (
            <div key={log.id} className="log-item">
              <div className="log-icon">
                {log.status === 'Success' ? <Activity size={14} color="#10b981" /> : <FileWarning size={14} color="#f59e0b" />}
              </div>
              <div className="log-content">
                <strong>{log.event}</strong>
                <span>by {log.user}</span>
              </div>
              <div className="log-meta">
                <span className={`log-status ${log.status.toLowerCase()}`}>{log.status}</span>
                <span className="log-time">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Security;
