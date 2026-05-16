import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Phone,
  Trash2,
  Edit2,
  ExternalLink,
  X,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './ManageClinics.css';

const ManageClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClinic, setNewClinic] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    subscriptionPlan: 'Pro',
    doctorPassword: '',
    staffPassword: ''
  });
  const [selectedForCreds, setSelectedForCreds] = useState(null);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/clinics`);
      setClinics(res.data);
    } catch (err) {
      console.error('Error fetching clinics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClinic = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/clinics`, newClinic);
      setShowAddModal(false);
      setNewClinic({ name: '', ownerName: '', email: '', phone: '', subscriptionPlan: 'Pro', doctorPassword: '', staffPassword: '' });
      fetchClinics();
    } catch (err) {
      alert('Failed to add clinic: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredClinics = clinics.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="manage-clinics-page">
      <div className="page-header">
        <div className="header-text">
          <h2>Clinic Directory</h2>
          <p>You have {clinics.length} active healthcare partners</p>
        </div>
        <div className="header-actions">
          <div className="search-box-sa">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or doctor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="sa-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add New Partner
          </button>
        </div>
      </div>

      <div className="clinics-grid">
        {loading ? (
          <div className="sa-loader">Loading partners...</div>
        ) : filteredClinics.map(clinic => (
          <div key={clinic.id} className="clinic-card-sa sa-glass">
            <div className="card-top">
              <div className="clinic-info-group">
                <div className="clinic-initials">{clinic.name.charAt(0)}</div>
                <div className="text">
                  <h3>{clinic.name}</h3>
                  <span>{clinic.ownerName}</span>
                </div>
              </div>
              <div className="status-badge-sa active">
                <CheckCircle2 size={12} /> {clinic.status || 'Active'}
              </div>
            </div>

            <div className="card-middle">
              <div className="contact-item">
                <Mail size={14} /> {clinic.email}
              </div>
              <div className="contact-item">
                <Phone size={14} /> {clinic.phone || '+91-XXXXXXXXXX'}
              </div>
            </div>

            <div className="card-stats-mini">
              <div className="mini-stat">
                <strong>{clinic.patients || 0}</strong>
                <span>Patients</span>
              </div>
              <div className="mini-stat">
                <strong>{clinic.subscriptionPlan || 'Pro'}</strong>
                <span>Plan</span>
              </div>
              <div className="mini-stat">
                <strong>₹{(clinic.revenue || 5000).toLocaleString()}</strong>
                <span>Earned</span>
              </div>
            </div>

            <div className="card-footer-sa">
              <button className="footer-btn" onClick={() => setSelectedForCreds(clinic)}>
                <ShieldCheck size={16} /> Credentials
              </button>
              <button className="footer-btn"><Edit2 size={16} /> Edit</button>
              <button className="footer-btn delete"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Clinic Modal */}
      {showAddModal && (
        <div className="sa-modal-overlay animate-in">
          <div className="sa-modal-content sa-glass">
            <div className="sa-modal-header">
              <h3>Onboard New Partner Clinic</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            <form onSubmit={handleAddClinic}>
              <div className="sa-form-grid">
                <div className="sa-input-group">
                  <label>Clinic Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apollo Wellness" 
                    value={newClinic.name}
                    onChange={e => setNewClinic({...newClinic, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="sa-input-group">
                  <label>Owner/Doctor Name</label>
                  <input 
                    type="text" 
                    placeholder="Dr. Rajesh Kumar" 
                    value={newClinic.ownerName}
                    onChange={e => setNewClinic({...newClinic, ownerName: e.target.value})}
                    required 
                  />
                </div>
                <div className="sa-input-group">
                  <label>Official Email</label>
                  <input 
                    type="email" 
                    placeholder="contact@clinic.com" 
                    value={newClinic.email}
                    onChange={e => setNewClinic({...newClinic, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="sa-input-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+91 XXXXX XXXXX" 
                    value={newClinic.phone}
                    onChange={e => setNewClinic({...newClinic, phone: e.target.value})}
                    required 
                  />
                </div>
                <div className="sa-input-group full-width">
                  <label>Subscription Plan</label>
                  <select 
                    value={newClinic.subscriptionPlan}
                    onChange={e => setNewClinic({...newClinic, subscriptionPlan: e.target.value})}
                  >
                    <option value="Basic">Basic (₹1,999/mo)</option>
                    <option value="Pro">Professional (₹4,999/mo)</option>
                    <option value="Enterprise">Enterprise (₹9,999/mo)</option>
                  </select>
                </div>
                <div className="sa-input-group">
                  <label>Doctor Password</label>
                  <input 
                    type="password" 
                    placeholder="Create doctor login" 
                    value={newClinic.doctorPassword}
                    onChange={e => setNewClinic({...newClinic, doctorPassword: e.target.value})}
                    required 
                  />
                </div>
                <div className="sa-input-group">
                  <label>Staff Password</label>
                  <input 
                    type="password" 
                    placeholder="Create staff login" 
                    value={newClinic.staffPassword}
                    onChange={e => setNewClinic({...newClinic, staffPassword: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="sa-btn-primary">Create Clinic Space</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credential Modal */}
      {selectedForCreds && (
        <div className="sa-modal-overlay animate-in">
          <div className="sa-modal-content sa-glass cred-modal">
            <div className="sa-modal-header">
              <h3>Access Credentials</h3>
              <button className="close-btn" onClick={() => setSelectedForCreds(null)}><X /></button>
            </div>
            <div className="cred-details">
              <p>Share these credentials with <strong>{selectedForCreds.name}</strong> securely.</p>
              
              <div className="cred-item">
                <label>Login Identifier / Email</label>
                <div className="cred-value">
                  <code>{selectedForCreds.email}</code>
                </div>
              </div>

              <div className="cred-row">
                <div className="cred-item">
                  <label>Doctor Password</label>
                  <div className="cred-value">
                    <code>{selectedForCreds.doctorPassword}</code>
                  </div>
                </div>
                <div className="cred-item">
                  <label>Staff Password</label>
                  <div className="cred-value">
                    <code>{selectedForCreds.staffPassword}</code>
                  </div>
                </div>
              </div>

              <div className="cred-warning">
                <ShieldCheck size={16} />
                <span>Encrypted on server. Never share over public chat.</span>
              </div>
            </div>
            <div className="sa-modal-footer">
              <button className="sa-btn-primary" onClick={() => setSelectedForCreds(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClinics;
