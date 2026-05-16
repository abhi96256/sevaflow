import React from 'react';
import { Video, Mic, PhoneOff, User, CreditCard } from 'lucide-react';
import './TeleMedicine.css';

const TeleMedicine = ({ language }) => {
  return (
    <div className="tele-wrapper">
      <div className="tele-grid">
        <div className="video-area glass-panel">
          <div className="remote-user">
            <div className="patient-tag">Patient: Suman Devi</div>
            <div className="call-duration">04:22</div>
          </div>
          <div className="self-view glass-panel">
            <div className="doc-avatar">DS</div>
          </div>
          <div className="call-controls">
            <button className="ctrl-btn"><Mic size={20} /></button>
            <button className="ctrl-btn hangup"><PhoneOff size={20} /></button>
            <button className="ctrl-btn"><Video size={20} /></button>
          </div>
        </div>

        <div className="tele-sidebar glass-panel">
          <div className="patient-card">
            <User size={40} />
            <div>
              <h4>Suman Devi</h4>
              <p>Diabetes Type 2 • 52 yrs</p>
            </div>
          </div>
          <div className="payment-status">
            <div className="status-label">Consultation Fee</div>
            <div className="status-badge paid">
              <CreditCard size={14} /> PAID (₹500)
            </div>
          </div>
          <button className="start-presc-btn">Start Prescription</button>
        </div>
      </div>
    </div>
  );
};

export default TeleMedicine;
