import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Plus, CheckCircle2, ChevronRight, Search, Activity, UserPlus, Phone } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './Appointments.css';

const Appointments = ({ language }) => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('queue'); // 'queue' | 'calendar'
  
  // New Appointment Form State
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;
  });
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const url = viewMode === 'queue' ? `${API_BASE_URL}/api/appointments/today` : `${API_BASE_URL}/api/appointments`;
      const res = await axios.get(url);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return alert('Please select a patient!');

    try {
      await axios.post(`${API_BASE_URL}/api/appointments`, {
        patientId: selectedPatientId,
        appointmentDate: formDate,
        appointmentTime: formTime,
        reason: reason,
        status: 'Waiting'
      });
      setShowForm(false);
      resetForm();
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule appointment');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${id}`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setSelectedPatientId(null);
    setSelectedPatientName('');
    setSearchQuery('');
    setReason('');
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.phone && p.phone.includes(searchQuery))
  );

  return (
    <div className="appointments-wrapper">
      <header className="page-header">
        <div className="title-section">
          <h2>OPD Appointments</h2>
          <p>Manage today's patient queue and upcoming bookings</p>
        </div>
        <div className="actions-section">
          <div className="view-toggle">
            <button 
              className={viewMode === 'queue' ? 'active' : ''} 
              onClick={() => { setViewMode('queue'); setTimeout(fetchAppointments, 0); }}
            >
              Today's Queue
            </button>
            <button 
              className={viewMode === 'calendar' ? 'active' : ''} 
              onClick={() => { setViewMode('calendar'); setTimeout(fetchAppointments, 0); }}
            >
              All Bookings
            </button>
          </div>
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Schedule Patient
          </button>
        </div>
      </header>

      {/* Stats row for today's queue */}
      {viewMode === 'queue' && (
        <div className="opd-stats">
          <div className="stat-card">
            <div className="stat-icon waiting"><Clock /></div>
            <div className="stat-info">
              <h3>{appointments.filter(a => a.status === 'Waiting').length}</h3>
              <p>Waiting</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active"><Activity /></div>
            <div className="stat-info">
              <h3>{appointments.filter(a => a.status === 'In Consultation').length}</h3>
              <p>In Cabin</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon done"><CheckCircle2 /></div>
            <div className="stat-info">
              <h3>{appointments.filter(a => a.status === 'Done').length}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card total">
            <div className="stat-icon"><Users /></div>
            <div className="stat-info">
              <h3>{appointments.length}</h3>
              <p>Total Today</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="content-card">
        {loading ? (
          <div className="loading-state">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <CalendarIcon size={48} color="#cbd5e1" />
            <h3>No appointments found</h3>
            <p>Schedule a new patient to see them here.</p>
          </div>
        ) : (
          <div className="appointment-list">
            {appointments.map((apt, index) => (
              <div key={apt.id} className={`appointment-item status-${apt.status.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className="apt-token">
                  <span>#{index + 1}</span>
                </div>
                <div className="apt-patient">
                  <div className="avatar">{apt.patient?.name?.charAt(0) || '?'}</div>
                  <div>
                    <h4>{apt.patient?.name || 'Unknown Patient'}</h4>
                    <p className="meta">{apt.patient?.age} Yrs • {apt.patient?.gender} • {apt.patient?.phone}</p>
                  </div>
                </div>
                <div className="apt-details">
                  <div className="detail-pill">
                    <CalendarIcon size={14} /> {apt.appointmentDate}
                  </div>
                  <div className="detail-pill">
                    <Clock size={14} /> {apt.appointmentTime}
                  </div>
                  <p className="reason">{apt.reason || 'General Checkup'}</p>
                </div>
                <div className="apt-actions">
                  <div className="status-badge">{apt.status}</div>
                  
                  {viewMode === 'queue' && (
                    <div className="action-buttons">
                      {apt.status === 'Waiting' && (
                        <button className="status-btn active-btn" onClick={() => updateStatus(apt.id, 'In Consultation')}>
                          Call Next
                        </button>
                      )}
                      {apt.status === 'In Consultation' && (
                        <button className="status-btn done-btn" onClick={() => updateStatus(apt.id, 'Done')}>
                          Mark Done
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="scheduling-modal">
            <div className="modal-header">
              <h3>Schedule Appointment</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="modal-form">
              <div className="form-group">
                <label>Find Patient</label>
                <div className="patient-search-input">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by name or phone..." 
                    value={selectedPatientName || searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedPatientName('');
                      setSelectedPatientId(null);
                    }}
                  />
                </div>
                {!selectedPatientId && searchQuery.length > 0 && (
                  <div className="search-dropdown">
                    {filteredPatients.map(p => (
                      <div key={p.id} className="dropdown-item" onClick={() => {
                        setSelectedPatientId(p.id);
                        setSelectedPatientName(p.name);
                        setSearchQuery('');
                      }}>
                        {p.name} - {p.phone}
                      </div>
                    ))}
                    {filteredPatients.length === 0 && <div className="dropdown-item empty">No patient found</div>}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <select required value={formTime} onChange={(e) => setFormTime(e.target.value)}>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="07:00 PM">07:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Chief Complaint / Reason</label>
                <input type="text" placeholder="e.g. Fever and cold" value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>

              <button type="submit" className="submit-btn" disabled={!selectedPatientId}>
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
