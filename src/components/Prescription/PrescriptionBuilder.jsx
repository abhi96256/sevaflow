import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Save, MessageSquare, Zap, History, User, Check, Edit2, FileText, Mic, Activity, Thermometer, Droplets, Heart, Calendar, Beaker, PenTool, ChevronDown, Search, ArrowRight, Copy, Edit, FlaskConical } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './PrescriptionBuilder.css';

const API_URL = `${API_BASE_URL}/api/prescriptions`;

const PrescriptionBuilder = ({ language }) => {
  const [medicines, setMedicines] = useState([
    { id: 1, name: 'Paracetamol 500mg', dosage: '1-0-1', timing: 'After Food', duration: '3 Days', isEditing: false }
  ]);
  const [diagnosis, setDiagnosis] = useState('');
  const [patientId, setPatientId] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [vitals, setVitals] = useState({ bp: '', pr: '', temp: '', spo2: '' });
  const [labTests, setLabTests] = useState([]);
  const [followUp, setFollowUp] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchAllPatients();

    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-box-wrapper')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patients`);
      setAllPatients(res.data);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(API_URL);
      setSavedPrescriptions(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const templates = [
    { name: 'Viral Fever', diagnosis: 'Viral Fever', meds: [{ id: 1, name: 'Paracetamol 650mg', dosage: '1-1-1', timing: 'After Food', duration: '5 Days' }] },
    { name: 'Common Cold', diagnosis: 'Common Cold', meds: [{ id: 5, name: 'Levocetirizine 5mg', dosage: '0-0-1', timing: 'Bedtime', duration: '5 Days' }] },
    { name: 'Gastritis / Acidity', diagnosis: 'Gastritis', meds: [{ id: 8, name: 'Pantoprazole 40mg', dosage: '1-0-0', timing: 'Empty Stomach', duration: '10 Days' }] },
    { name: 'Dry Cough', diagnosis: 'Dry Cough', meds: [{ id: 11, name: 'Cough Syrup', dosage: '2 tsp', timing: 'TDS', duration: '5 Days' }] },
    { name: 'General Weakness', diagnosis: 'Weakness', meds: [{ id: 14, name: 'Multivitamin', dosage: '0-1-0', timing: 'After Food', duration: '30 Days' }] }
  ];

  const applyTemplate = (template) => {
    const medsWithIds = template.meds.map(m => ({ ...m, id: Date.now() + Math.random(), isEditing: false }));
    setMedicines(medsWithIds);
    setDiagnosis(template.diagnosis);
  };

  const commonLabs = ['CBC', 'HbA1c', 'Lipid Profile', 'Thyroid Profile', 'Urine Routine'];

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => setDiagnosis(prev => prev + (prev ? ' ' : '') + e.results[0][0].transcript);
    recognition.start();
  };

  const handlePatientSearch = (query) => {
    setPatientName(query);
    const filtered = allPatients.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || (p.phone && p.phone.includes(query)));
    setSearchResults(filtered);
    setShowDropdown(true);
  };

  const selectPatient = (p) => {
    setPatientId(p.id);
    setPatientName(p.name);
    setShowDropdown(false);
  };

  const handleSave = async () => {
    if (!patientName) return alert('Please select a patient.');
    setIsSaving(true);
    try {
      const data = { patientId, patientName, diagnosis, medicines: medicines.filter(m => m.name).map(({ isEditing, ...rest }) => rest), vitals, labTests, followUp, createdAt: new Date().toISOString() };
      await axios.post(API_URL, data);
      alert('Prescription Saved!');
      resetForm();
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert('Error saving prescription.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setMedicines([{ id: Date.now(), name: '', dosage: '', timing: '', duration: '', isEditing: true }]);
    setDiagnosis('');
    setPatientName('');
    setPatientId(null);
    setLabTests([]);
    setFollowUp('');
  };

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now(), name: '', dosage: '', timing: '', duration: '', isEditing: true }]);
  };

  const removeMed = (id) => setMedicines(medicines.filter(m => m.id !== id));
  const toggleLab = (lab) => setLabTests(prev => prev.includes(lab) ? prev.filter(l => l !== lab) : [...prev, lab]);

  return (
    <div className="prescription-wrapper">
      <header className="builder-header">
        <div className="title-group">
          <h2>{language === 'hi' ? 'स्मार्ट प्रिस्क्रिप्शन' : 'Smart Prescription'}</h2>
          <p className="subtitle">Create and manage patient prescriptions with AI backup</p>
        </div>
        <div className="builder-actions">
          <button className="secondary-btn" onClick={handleSave}>
            <FileText size={18} />
            <span>Save Draft</span>
          </button>
          <button className="primary-btn" onClick={() => window.print()}>
            <Printer size={18} />
            <span>Print Rx</span>
          </button>
        </div>
      </header>

      <div className="builder-grid">
        <div className="main-section">
          {/* Patient Selection */}
          <div className="custom-card patient-search-card">
            <div className="search-box-wrapper">
              <Search size={24} className="input-icon" />
              <input 
                type="text" 
                placeholder="Click to select or search patient..." 
                value={patientName}
                onChange={(e) => handlePatientSearch(e.target.value)}
                onFocus={() => setShowDropdown(true)}
              />
              <ChevronDown size={20} className="dropdown-icon" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
              {showDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--outline)', borderRadius: '12px', zIndex: 100, marginTop: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                  {searchResults.map(p => (
                    <div key={p.id} onClick={() => selectPatient(p)} style={{ padding: '12px 20px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{p.phone} | {p.age} Yrs</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Medications Card */}
          <div className="custom-card">
            <div className="section-header">
              <div className="flex-row">
                <Activity size={24} color="var(--primary)" />
                <h3>Medications</h3>
              </div>
              <button className="add-text-btn" onClick={addMedicine}>
                <Plus size={18} /> Add Medicine
              </button>
            </div>
            <div className="med-container">
              {medicines.map((med) => (
                <div key={med.id} className="med-row-bento">
                  <div className="med-info-group">
                    {med.isEditing ? (
                      <input 
                        className="med-name" 
                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--outline)', outline: 'none' }}
                        value={med.name}
                        placeholder="Medicine Name..."
                        onChange={(e) => setMedicines(medicines.map(m => m.id === med.id ? { ...m, name: e.target.value } : m))}
                      />
                    ) : (
                      <>
                        <span className="med-name">{med.name || 'Untitled Medicine'}</span>
                        <span className="med-type">Tablets</span>
                      </>
                    )}
                  </div>
                  <div className="med-stat-group">
                    <p className="stat-label">Dosage</p>
                    {med.isEditing ? (
                      <input 
                        style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none' }}
                        value={med.dosage}
                        placeholder="1-0-1"
                        onChange={(e) => setMedicines(medicines.map(m => m.id === med.id ? { ...m, dosage: e.target.value } : m))}
                      />
                    ) : <p className="stat-value">{med.dosage || 'N/A'}</p>}
                  </div>
                  <div className="med-stat-group">
                    <p className="stat-label">Instructions</p>
                    {med.isEditing ? (
                      <input 
                        style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none' }}
                        value={med.timing}
                        placeholder="After Food"
                        onChange={(e) => setMedicines(medicines.map(m => m.id === med.id ? { ...m, timing: e.target.value } : m))}
                      />
                    ) : <p className="stat-value">{med.timing || 'N/A'}</p>}
                  </div>
                  <div className="med-stat-group">
                    <p className="stat-label">Duration</p>
                    {med.isEditing ? (
                      <input 
                        style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none' }}
                        value={med.duration}
                        placeholder="3 Days"
                        onChange={(e) => setMedicines(medicines.map(m => m.id === med.id ? { ...m, duration: e.target.value } : m))}
                      />
                    ) : <p className="stat-value">{med.duration || 'N/A'}</p>}
                  </div>
                  <div className="med-row-actions">
                    <button className="action-btn-sm edit" onClick={() => setMedicines(medicines.map(m => m.id === med.id ? { ...m, isEditing: !m.isEditing } : m))}>
                      {med.isEditing ? <Check size={18} /> : <Edit size={18} />}
                    </button>
                    <button className="action-btn-sm delete" onClick={() => removeMed(med.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes / Diagnosis */}
          <div className="custom-card">
            <div className="section-header notes-header">
              <div className="flex-row">
                <Edit2 size={24} color="var(--primary)" />
                <h3>Notes / Diagnosis</h3>
              </div>
              <button className={`voice-btn ${isListening ? 'active' : ''}`} onClick={handleVoiceInput}>
                <Mic size={18} /> Voice Rx
              </button>
            </div>
            <textarea 
              className="notes-textarea"
              placeholder="Enter diagnosis notes here... or use voice command"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          {/* Labs & Follow-up */}
          <div className="labs-followup-container">
            <div className="custom-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <FlaskConical size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Requested Lab Tests</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {commonLabs.map(lab => (
                  <button 
                    key={lab} 
                    className={`lab-tag-bento ${labTests.includes(lab) ? 'active' : ''}`}
                    onClick={() => toggleLab(lab)}
                  >
                    {lab} +
                  </button>
                ))}
              </div>
            </div>
            <div className="custom-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Calendar size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Follow-up Date</h3>
              </div>
              <input type="date" className="followup-input-bento" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {['7 Days', '15 Days', '1 Month'].map(d => (
                  <button key={d} style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 700, border: '1px solid var(--outline)', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>{d}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-panels">
          {/* Quick Templates */}
          <div className="custom-card">
            <div className="sidebar-header">
              <Zap size={20} fill="var(--primary)" color="var(--primary)" />
              <h3>Quick Templates</h3>
            </div>
            <div style={{ padding: '8px' }}>
              {templates.map(t => (
                <button key={t.name} className="template-item-bento" onClick={() => applyTemplate(t)}>
                  <span>{t.name}</span>
                  <ArrowRight size={18} className="arrow" />
                </button>
              ))}
            </div>
          </div>

          {/* Digital Signature */}
          <div className="custom-card signature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <PenTool size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Digital Signature</h3>
            </div>
            <div className="signature-area">
              <span className="signature-name">Dr. Sharma</span>
              <div className="signature-line"></div>
              <span className="signature-text">Authorized Electronic Signature</span>
            </div>
          </div>

          {/* Recent History */}
          <div className="custom-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <History size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Recent History</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {savedPrescriptions.slice(0, 5).map(p => (
                <div key={p.id} className="history-item-bento">
                  <div className="h-identity">
                    <div className="h-avatar">{p.patientName.charAt(0)}</div>
                    <div>
                      <div className="h-name-row">{p.patientName}</div>
                      <div className="h-date-row">{new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <button className="h-copy-btn">
                    <Copy size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionBuilder;
