import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Save, MessageSquare, Zap, History, User, Check, Edit2, FileText, Mic, Activity, Thermometer, Droplets, Heart, Calendar, Beaker, PenTool, ChevronDown, Search, ArrowRight, Copy, Edit, FlaskConical, X } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './PrescriptionBuilder.css';

const API_URL = `${API_BASE_URL}/api/prescriptions`;

const DOSAGE_OPTIONS = ['1-0-0', '0-1-0', '0-0-1', '1-0-1', '1-1-1', '1-1-1-1', 'S.O.S', 'Stat'];
const TIMING_OPTIONS = ['After Food', 'Before Food', 'Empty Stomach', 'With Food', 'Bedtime', 'Morning'];
const DURATION_OPTIONS = ['1 Day', '3 Days', '5 Days', '7 Days', '10 Days', '15 Days', '1 Month', '2 Months', '3 Months'];

const ALL_LAB_TESTS = [
  'CBC (Complete Blood Count)', 'HbA1c (Glycated Hb)', 'Lipid Profile', 'Thyroid Profile (T3, T4, TSH)', 'Urine Routine',
  'KFT (Kidney Function Test)', 'LFT (Liver Function Test)', 'FBS (Fasting Blood Sugar)', 'PPBS (Post Prandial Blood Sugar)',
  'RBS (Random Blood Sugar)', 'Vitamin D3 (25-Hydroxy)', 'Vitamin B12', 'Serum Creatinine', 'Uric Acid',
  'Hemoglobin (Hb)', 'Platelet Count', 'ESR (Erythrocyte Sedimentation Rate)', 'RA Factor', 'CRP (C-Reactive Protein)',
  'ASO Titre', 'Serum Bilirubin (Total & Direct)', 'SGOT / AST', 'SGPT / ALT', 'Serum Alkaline Phosphatase',
  'Blood Urea', 'Iron Profile', 'Serum Calcium', 'Serum Electrolytes (Na+, K+, Cl-)', 'PSA (Prostate Specific)',
  'Widal Test (Typhoid)', 'Dengue NS1 Antigen', 'Dengue Serology (IgG/IgM)', 'Malaria Antigen', 'VDRL',
  'HIV 1 & 2', 'HBsAg (Hepatitis B)', 'HCV (Hepatitis C)', 'Urine Pregnancy Test (UPT)', 'Stool Routine',
  'Semen Analysis', 'ECG (12-Lead)', 'Chest X-Ray (PA View)', 'USG Whole Abdomen', 'USG Pelvis',
  'Treadmill Test (TMT)', 'Echocardiography (2D Echo)', 'Spirometry (PFT)', 'MRI Brain', 'CT Scan Brain',
  'Bone Mineral Density (BMD)'
];

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

  const [labOptions, setLabOptions] = useState([
    'CBC', 'HbA1c', 'Lipid Profile', 'Thyroid Profile', 'Urine Routine'
  ]);
  const [showAddLabInput, setShowAddLabInput] = useState(false);
  const [newLabSearch, setNewLabSearch] = useState('');
  const [labSuggestions, setLabSuggestions] = useState([]);

  const handleLabSearchChange = (val) => {
    setNewLabSearch(val);
    if (val.trim()) {
      const filtered = ALL_LAB_TESTS.filter(t => 
        t.toLowerCase().includes(val.toLowerCase()) && 
        !labOptions.includes(t)
      );
      setLabSuggestions(filtered);
    } else {
      const remaining = ALL_LAB_TESTS.filter(t => !labOptions.includes(t));
      setLabSuggestions(remaining);
    }
  };

  const showAllSuggestions = () => {
    const remaining = ALL_LAB_TESTS.filter(t => !labOptions.includes(t));
    setLabSuggestions(remaining);
  };

  const handleAddLabTest = (testName) => {
    const nameToAdd = (testName || newLabSearch).trim();
    if (!nameToAdd) return;
    
    if (!labOptions.includes(nameToAdd)) {
      setLabOptions([...labOptions, nameToAdd]);
    }
    
    if (!labTests.includes(nameToAdd)) {
      setLabTests([...labTests, nameToAdd]);
    }
    
    setNewLabSearch('');
    setLabSuggestions([]);
    setShowAddLabInput(false);
  };

  const handleFollowUpPreset = (preset) => {
    const today = new Date();
    if (preset === '7 Days') {
      today.setDate(today.getDate() + 7);
    } else if (preset === '15 Days') {
      today.setDate(today.getDate() + 15);
    } else if (preset === '1 Month') {
      today.setMonth(today.getMonth() + 1);
    }
    
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setFollowUp(`${yyyy}-${mm}-${dd}`);
  };

  const isPresetActive = (preset) => {
    if (!followUp) return false;
    const today = new Date();
    if (preset === '7 Days') {
      today.setDate(today.getDate() + 7);
    } else if (preset === '15 Days') {
      today.setDate(today.getDate() + 15);
    } else if (preset === '1 Month') {
      today.setMonth(today.getMonth() + 1);
    }
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return followUp === `${yyyy}-${mm}-${dd}`;
  };

  // Custom templates features
  const [templates, setTemplates] = useState([]);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    diagnosis: '',
    meds: [{ id: Date.now(), name: '', dosage: '', timing: '', duration: '' }]
  });

  useEffect(() => {
    fetchHistory();
    fetchAllPatients();
    loadTemplates();

    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-box-wrapper')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTemplates = () => {
    const defaultTemplates = [
      { name: 'Viral Fever', diagnosis: 'Viral Fever', meds: [{ id: 1, name: 'Paracetamol 650mg', dosage: '1-1-1', timing: 'After Food', duration: '5 Days' }] },
      { name: 'Common Cold', diagnosis: 'Common Cold', meds: [{ id: 5, name: 'Levocetirizine 5mg', dosage: '0-0-1', timing: 'Bedtime', duration: '5 Days' }] },
      { name: 'Gastritis / Acidity', diagnosis: 'Gastritis', meds: [{ id: 8, name: 'Pantoprazole 40mg', dosage: '1-0-0', timing: 'Empty Stomach', duration: '10 Days' }] },
      { name: 'Dry Cough', diagnosis: 'Dry Cough', meds: [{ id: 11, name: 'Cough Syrup', dosage: '2 tsp', timing: 'TDS', duration: '5 Days' }] },
      { name: 'General Weakness', diagnosis: 'Weakness', meds: [{ id: 14, name: 'Multivitamin', dosage: '0-1-0', timing: 'After Food', duration: '30 Days' }] }
    ];

    const stored = localStorage.getItem('prescription_templates');
    if (stored) {
      setTemplates(JSON.parse(stored));
    } else {
      setTemplates(defaultTemplates);
      localStorage.setItem('prescription_templates', JSON.stringify(defaultTemplates));
    }
  };

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

  const applyTemplate = (template) => {
    const medsWithIds = template.meds.map(m => ({ ...m, id: Date.now() + Math.random(), isEditing: false }));
    setMedicines(medsWithIds);
    setDiagnosis(template.diagnosis);
  };

  const addTemplateMed = () => {
    setNewTemplate({
      ...newTemplate,
      meds: [...newTemplate.meds, { id: Date.now() + Math.random(), name: '', dosage: '', timing: '', duration: '' }]
    });
  };

  const removeTemplateMed = (id) => {
    setNewTemplate({
      ...newTemplate,
      meds: newTemplate.meds.filter(m => m.id !== id)
    });
  };

  const handleTemplateMedChange = (id, field, value) => {
    setNewTemplate({
      ...newTemplate,
      meds: newTemplate.meds.map(m => m.id === id ? { ...m, [field]: value } : m)
    });
  };

  const saveTemplate = () => {
    if (!newTemplate.name || !newTemplate.diagnosis) {
      alert('Please enter Template Name and Diagnosis.');
      return;
    }
    const filteredMeds = newTemplate.meds.filter(m => m.name.trim() !== '');
    if (filteredMeds.length === 0) {
      alert('Please add at least one medicine.');
      return;
    }

    const updated = [...templates, {
      name: newTemplate.name,
      diagnosis: newTemplate.diagnosis,
      meds: filteredMeds
    }];

    setTemplates(updated);
    localStorage.setItem('prescription_templates', JSON.stringify(updated));
    setShowAddTemplate(false);
    setNewTemplate({
      name: '',
      diagnosis: '',
      meds: [{ id: Date.now(), name: '', dosage: '', timing: '', duration: '' }]
    });
  };

  const deleteTemplate = (e, indexToDelete) => {
    e.stopPropagation();
    if (window.confirm('Delete this template?')) {
      const updated = templates.filter((_, index) => index !== indexToDelete);
      setTemplates(updated);
      localStorage.setItem('prescription_templates', JSON.stringify(updated));
    }
  };


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
      
      // AUTO-BILL INTEGRATION
      const selectedPatient = allPatients.find(p => p.id === patientId);
      const patientPhone = selectedPatient ? selectedPatient.phone : '';
      
      const billItems = [
        { id: 'consult', desc: 'General Consultation', sub: 'Regular Check-up Fee', price: 500, type: 'service' }
      ];
      
      medicines.filter(m => m.name).forEach((med, index) => {
        billItems.push({
          id: `med-${Date.now()}-${index}`,
          desc: med.name,
          sub: `${med.dosage || 'N/A'} | ${med.timing || 'N/A'} | ${med.duration || 'N/A'}`,
          price: 150,
          type: 'med'
        });
      });
      
      const pendingBill = {
        patientName,
        patientPhone: patientPhone || '9876543210',
        items: billItems
      };
      
      localStorage.setItem('pending_bill', JSON.stringify(pendingBill));
      
      alert('Prescription Saved & Transferred to Billing!');
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
                      <select 
                        style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', outline: 'none' }}
                        value={med.dosage}
                        onChange={(e) => setMedicines(medicines.map(m => m.id === med.id ? { ...m, dosage: e.target.value } : m))}
                      >
                        <option value="" style={{ color: '#333' }}>-- Dosage --</option>
                        {DOSAGE_OPTIONS.map(opt => <option key={opt} value={opt} style={{ color: '#333' }}>{opt}</option>)}
                      </select>
                    ) : <p className="stat-value">{med.dosage || 'N/A'}</p>}
                  </div>
                  <div className="med-stat-group">
                    <p className="stat-label">Instructions</p>
                    {med.isEditing ? (
                      <select 
                        style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', outline: 'none' }}
                        value={med.timing}
                        onChange={(e) => setMedicines(medicines.map(m => m.id === med.id ? { ...m, timing: e.target.value } : m))}
                      >
                        <option value="" style={{ color: '#333' }}>-- Timing --</option>
                        {TIMING_OPTIONS.map(opt => <option key={opt} value={opt} style={{ color: '#333' }}>{opt}</option>)}
                      </select>
                    ) : <p className="stat-value">{med.timing || 'N/A'}</p>}
                  </div>
                  <div className="med-stat-group">
                    <p className="stat-label">Duration</p>
                    {med.isEditing ? (
                      <select 
                        style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', outline: 'none' }}
                        value={med.duration}
                        onChange={(e) => setMedicines(medicines.map(m => m.id === med.id ? { ...m, duration: e.target.value } : m))}
                      >
                        <option value="" style={{ color: '#333' }}>-- Duration --</option>
                        {DURATION_OPTIONS.map(opt => <option key={opt} value={opt} style={{ color: '#333' }}>{opt}</option>)}
                      </select>
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {labOptions.map(lab => (
                  <button 
                    key={lab} 
                    className={`lab-tag-bento ${labTests.includes(lab) ? 'active' : ''}`}
                    onClick={() => toggleLab(lab)}
                  >
                    {lab} {labTests.includes(lab) ? '✓' : '+'}
                  </button>
                ))}

                {/* Add Custom Lab Test Block */}
                {!showAddLabInput ? (
                  <button 
                    onClick={() => setShowAddLabInput(true)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: '1px dashed var(--primary)',
                      borderRadius: '20px',
                      background: 'rgba(0, 128, 128, 0.04)',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      height: '34px'
                    }}
                  >
                    <Plus size={14} /> Add Test
                  </button>
                ) : (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                    <input 
                      type="text"
                      placeholder="Search or type test..."
                      value={newLabSearch}
                      onChange={(e) => handleLabSearchChange(e.target.value)}
                      onFocus={showAllSuggestions}
                      onClick={showAllSuggestions}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddLabTest();
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: '1px solid var(--outline)',
                        borderRadius: '20px',
                        outline: 'none',
                        width: '180px',
                        background: '#ffffff',
                        height: '34px'
                      }}
                      autoFocus
                    />
                    <button 
                      onClick={() => handleAddLabTest()}
                      style={{
                        background: 'var(--primary)',
                        border: 'none',
                        color: 'white',
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '20px',
                        cursor: 'pointer',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Add
                    </button>
                    <button 
                      onClick={() => {
                        setShowAddLabInput(false);
                        setNewLabSearch('');
                        setLabSuggestions([]);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={16} />
                    </button>

                    {/* Suggestions Dropdown */}
                    {labSuggestions.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        right: 0,
                        background: '#ffffff',
                        border: '1px solid var(--outline)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        zIndex: 99999,
                        marginBottom: '8px'
                      }} className="custom-scrollbar">
                        {labSuggestions.map((s, idx) => (
                          <div 
                            key={s + idx}
                            onClick={() => handleAddLabTest(s)}
                            style={{
                              padding: '10px 14px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#1e293b',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              textAlign: 'left'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="custom-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Calendar size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Follow-up Date</h3>
              </div>
              <input type="date" className="followup-input-bento" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {['7 Days', '15 Days', '1 Month'].map(d => {
                  const active = isPresetActive(d);
                  return (
                    <button 
                      key={d} 
                      onClick={() => handleFollowUpPreset(d)}
                      style={{ 
                        flex: 1, 
                        padding: '8px', 
                        fontSize: '12px', 
                        fontWeight: 700, 
                        border: active ? '1px solid var(--primary)' : '1px solid var(--outline)', 
                        borderRadius: '8px', 
                        background: active ? 'rgba(0, 128, 128, 0.08)' : 'white', 
                        color: active ? 'var(--primary)' : '#1e293b',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: active ? '0 2px 8px rgba(0, 128, 128, 0.15)' : 'none'
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-panels">
          {/* Quick Templates */}
          <div className="custom-card">
            <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} fill="var(--primary)" color="var(--primary)" />
                <h3>Quick Templates</h3>
              </div>
            </div>
            <div style={{ padding: '8px' }}>
              {templates.map((t, idx) => (
                <div key={t.name + idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                  <button className="template-item-bento" style={{ flex: 1, margin: 0 }} onClick={() => applyTemplate(t)}>
                    <span>{t.name}</span>
                    <ArrowRight size={18} className="arrow" />
                  </button>
                  <button 
                    title="Delete Template"
                    onClick={(e) => deleteTemplate(e, idx)}
                    style={{ background: 'transparent', border: 'none', color: '#ff4d4f', padding: '8px', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div style={{ marginTop: '12px', padding: '0 8px' }}>
                <button 
                  onClick={() => setShowAddTemplate(true)}
                  style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)', border: '1px dashed var(--primary)', borderRadius: '8px', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.3s' }}
                >
                  <Plus size={16} />
                  <span>Create Template</span>
                </button>
              </div>

              {showAddTemplate && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.4)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 99999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px'
                }}>
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '650px',
                    padding: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    textAlign: 'left'
                  }} className="custom-scrollbar">
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', backgroundColor: 'rgba(0, 128, 128, 0.1)', borderRadius: '12px', color: '#008080', display: 'flex' }}>
                          <Zap size={24} fill="#008080" />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Create Smart Template</h3>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Save custom prescriptions for one-click access later</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowAddTemplate(false)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', display: 'flex', transition: 'all 0.2s', borderRadius: '50%' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#1e293b'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Inputs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.5px' }}>Template Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Viral Fever Treatment" 
                          value={newTemplate.name}
                          onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                          style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#f8fafc', fontWeight: '600', color: '#1e293b' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.5px' }}>Diagnosis / Complaint</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Acute Migraine" 
                          value={newTemplate.diagnosis}
                          onChange={e => setNewTemplate({ ...newTemplate, diagnosis: e.target.value })}
                          style={{ width: '100%', padding: '12px 16px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: '#f8fafc', fontWeight: '600', color: '#1e293b' }}
                        />
                      </div>
                    </div>

                    {/* Medicines List */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>Medications List</label>
                        <button 
                          onClick={addTemplateMed}
                          style={{ background: 'rgba(0, 128, 128, 0.08)', border: 'none', color: '#008080', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s' }}
                        >
                          <Plus size={14} /> Add Medicine
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }} className="custom-scrollbar">
                        {newTemplate.meds.map((med, index) => (
                          <div key={med.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', background: '#f8fafc', position: 'relative' }}>
                            {newTemplate.meds.length > 1 && (
                              <button 
                                onClick={() => removeTemplateMed(med.id)}
                                style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '50%' }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            
                            <div style={{ width: '85%' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Medicine Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g., Paracetamol 650mg" 
                                value={med.name}
                                onChange={e => handleTemplateMedChange(med.id, 'name', e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#ffffff', fontWeight: '600', color: '#1e293b' }}
                              />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Dosage</label>
                                <select 
                                  value={med.dosage}
                                  onChange={e => handleTemplateMedChange(med.id, 'dosage', e.target.value)}
                                  style={{ width: '100%', padding: '10px 12px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#ffffff', fontWeight: '600', color: '#1e293b', cursor: 'pointer', height: '42px' }}
                                >
                                  <option value="">-- Dosage --</option>
                                  {DOSAGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Timing</label>
                                <select 
                                  value={med.timing}
                                  onChange={e => handleTemplateMedChange(med.id, 'timing', e.target.value)}
                                  style={{ width: '100%', padding: '10px 12px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#ffffff', fontWeight: '600', color: '#1e293b', cursor: 'pointer', height: '42px' }}
                                >
                                  <option value="">-- Timing --</option>
                                  {TIMING_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Duration</label>
                                <select 
                                  value={med.duration}
                                  onChange={e => handleTemplateMedChange(med.id, 'duration', e.target.value)}
                                  style={{ width: '100%', padding: '10px 12px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#ffffff', fontWeight: '600', color: '#1e293b', cursor: 'pointer', height: '42px' }}
                                >
                                  <option value="">-- Duration --</option>
                                  {DURATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                      <button 
                        onClick={saveTemplate}
                        style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '800', color: 'white', background: '#008080', border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0, 128, 128, 0.2)', transition: 'all 0.2s', textAlign: 'center' }}
                      >
                        Save Template
                      </button>
                      <button 
                        onClick={() => setShowAddTemplate(false)}
                        style={{ padding: '16px 28px', fontSize: '15px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        Cancel
                      </button>
                    </div>

                  </div>
                </div>
              )}
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
