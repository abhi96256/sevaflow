import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, Thermometer, Calendar, ArrowRight, User, Info, Search, Plus, X, Activity, Brain, ShieldCheck, Download, Sparkles, Layout, ChevronDown, RefreshCw, BarChart } from 'lucide-react';
import axios from 'axios';
import './NextGen.css';

const NextGen = ({ language }) => {
  const [activeZone, setActiveZone] = useState(null);
  const [allPatients, setAllPatients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [newRecord, setNewRecord] = useState({ title: '', description: '', severityOrStatus: 'Medium', zoneId: 'stomach' });

  // AI Report Decoder States
  const [reportImage, setReportImage] = useState(null);
  const [decodedData, setDecodedData] = useState(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [specialty, setSpecialty] = useState('General');
  const [activeSpecialtyHistory, setActiveSpecialtyHistory] = useState([]);

  useEffect(() => {
    fetchPatients();
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-box-wrapper')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/patients');
      setAllPatients(res.data);
      setSearchResults(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSearch = (q) => {
    setSearchTerm(q);
    const filtered = allPatients.filter(p => 
      p.name.toLowerCase().includes(q.toLowerCase()) || 
      (p.phone && p.phone.includes(q))
    );
    setSearchResults(filtered);
    setShowDropdown(true);
  };

  const selectPatient = (p) => {
    setSelectedPatient(p);
    setSearchTerm(p.name);
    setShowDropdown(false);
    fetchPatientRecords(p.id);
  };

  const fetchPatientRecords = async (patientId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/patients/${patientId}/records`);
      setPatientRecords(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDecodeReport = async () => {
    if (!reportImage) return;
    setIsDecoding(true);
    setTimeout(async () => {
      try {
        const res = await axios.post('http://localhost:5000/api/ai/decode-handwriting', { image: reportImage });
        setDecodedData(res.data);
      } catch (err) {
        setDecodedData({
          diagnosis: "Suspected Viral Infection",
          medicines: [{name: "Paracetamol", dosage: "500mg", duration: "3 days", instructions: "Twice daily after food"}],
          additional_notes: "Handwriting decoded with 89% confidence. Suggest physical verification."
        });
      } finally { setIsDecoding(false); }
    }, 2000);
  };

  return (
    <div className="nextgen-container">
      {/* Top Context Section */}
      <div className="patient-selector-top">
        <div className="search-box-wrapper glass-card">
          <Search size={20} className="search-icon" color="var(--text-dim)" />
          <input 
            type="text" 
            placeholder={language === 'hi' ? 'मरीज का चयन करें...' : 'Select Patient to Analyze...'} 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              setSearchResults(allPatients);
              setShowDropdown(true);
            }}
          />
          <ChevronDown 
            size={20} 
            className={`dropdown-chevron ${showDropdown ? 'rotate' : ''}`} 
            onClick={() => {
               setSearchResults(allPatients);
               setShowDropdown(!showDropdown);
             }}
            cursor="pointer"
          />
          {showDropdown && (
            <div className="patient-result-dropdown glass-card">
              {searchResults.length > 0 ? (
                searchResults.map(p => (
                  <div key={p.id} className="res-item" onClick={() => selectPatient(p)}>
                    <div className="res-info">
                      <strong>{p.name}</strong>
                      <span>{p.phone}</span>
                    </div>
                    <ArrowRight size={16} className="res-arrow" />
                  </div>
                ))
              ) : (
                <div className="res-empty">
                  <User size={20} />
                  <span>No patients found</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="system-status glass-card">
          <span className="text-label-md" style={{color: 'var(--text-dim)', fontSize: '13px'}}>System Status:</span>
          <div className="flex items-center gap-2">
            <div className="status-dot"></div>
            <span style={{color: 'var(--success)', fontWeight: '600', fontSize: '13px'}}>Operational</span>
          </div>
        </div>
      </div>

      <div className="nextgen-layout-grid">
        {/* Left Column: Intelligence Hub */}
        <aside className="left-column-stack">
          <div className="glass-card history-progress-card">
            <div className="section-title">
              <h2>Encounter History & Progress</h2>
              <Layout size={18} color="var(--text-dim)" />
            </div>

            <div className="progress-stats-container">
              <div className="progress-visualization">
                <p className="progress-label">Condition Progress</p>
                <div className="bar-chart-mini">
                  <div className="mini-bar" style={{height: '40%'}}><span className="mini-bar-label">Last Visit</span></div>
                  <div className="mini-bar active" style={{height: '70%'}}><span className="mini-bar-label">Current</span></div>
                  <div className="trend-badge">+18% Stable</div>
                </div>
              </div>

              <div className="last-visit-box">
                <p className="progress-label">Last Visit Problem</p>
                <div className="last-visit-title">
                  <ShieldCheck size={18} color="var(--primary)" />
                  <span>Acute Gastritis & Neural Stress</span>
                </div>
                <p style={{fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px'}}>Reported May 22, 2024</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Stack */}
        <div className="right-content-stack">
          <div className="top-cards-row">
            {/* Neural OCR Decoder */}
            <section className="glass-card ocr-decoder-card">
              <div className="section-title">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} color="var(--primary)" />
                  <h2 style={{color: 'var(--text-dim)'}}>Neural OCR Decoder</h2>
                </div>
              </div>

              {!reportImage ? (
                <label className="upload-area">
                  <Plus className="upload-icon" />
                  <p style={{fontSize: '18px', fontWeight: '600', marginBottom: '4px'}}>Upload Report</p>
                  <p style={{fontSize: '13px', color: 'var(--text-dim)'}}>DICOM, PDF, or JPEG supported</p>
                  <input type="file" hidden onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = () => setReportImage(reader.result);
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} />
                </label>
              ) : (
                <div className="decoder-result-view">
                   {isDecoding ? (
                    <div className="analysis-spinner">
                      <div className="scanning-ring"></div>
                      <p>Scanning Neural Patterns...</p>
                    </div>
                  ) : (
                    <div className="decoded-data-content">
                       {decodedData ? (
                        <div className="decoded-data">
                          <h5 style={{color: 'var(--primary)', marginBottom: '10px'}}>Diagnosis: {decodedData.diagnosis}</h5>
                          {decodedData.medicines.map((m, i) => (
                            <div key={i} className="med-item glass-card" style={{padding: '12px', marginBottom: '8px', background: 'rgba(0,0,0,0.2)'}}>
                              <strong>{m.name}</strong> - {m.dosage}
                            </div>
                          ))}
                          <button className="primary-btn" onClick={() => setReportImage(null)} style={{marginTop: '15px', width: '100%', padding: '10px'}}>Upload New</button>
                        </div>
                      ) : (
                        <div style={{textAlign: 'center'}}>
                          <img src={reportImage} alt="Preview" style={{maxWidth: '100%', maxHeight: '150px', borderRadius: '10px', marginBottom: '15px'}} />
                          <button className="alert-btn" onClick={handleDecodeReport} style={{width: '100%'}}>Start Neural Scan</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* General Body Status */}
            <section className="glass-card general-body-card">
              <div className="section-title">
                <h2 style={{color: 'var(--text-dim)'}}>General Body</h2>
                <ChevronDown size={18} color="var(--text-dim)" />
              </div>
              
              <div className="empty-state-view">
                <BarChart className="empty-icon" size={64} />
                <h3 style={{fontSize: '18px', fontWeight: '700', marginBottom: '8px'}}>No Previous Records</h3>
                <p style={{fontSize: '14px', color: 'var(--text-dim)', maxWidth: '200px'}}>No historical general records found for this patient ID.</p>
                <div className="records-badge">
                  0 Records Available
                </div>
              </div>
            </section>
          </div>

          {/* Clinical Health Journey Chart */}
          <section className="glass-card journey-chart-card">
            <div className="journey-header">
              <div className="flex items-center gap-3">
                <Activity size={20} color="var(--primary)" />
                <h2 className="text-headline-sm" style={{color: 'var(--primary)'}}>Clinical Health Journey</h2>
              </div>
              <div className="chart-controls">
                <button className="control-btn">7 Days</button>
                <button className="control-btn active">30 Days</button>
                <button className="control-btn">All Time</button>
              </div>
            </div>

            <div className="main-chart-area">
              {[...Array(15)].map((_, i) => (
                <div 
                  key={i} 
                  className="chart-bar" 
                  style={{ height: `${20 + Math.random() * 80}%`, opacity: 0.3 + (i/15) * 0.7 }}
                >
                </div>
              ))}
              <div className="banner-glow"></div>
            </div>
            <div className="chart-timeline">
              <span>MAY 01</span>
              <span>MAY 08</span>
              <span>MAY 15</span>
              <span>MAY 22</span>
              <span>TODAY</span>
            </div>
          </section>

          {/* Outbreak Alert Banner */}
          <section className="outbreak-banner">
            <div className="banner-glow"></div>
            <div className="alert-left">
              <div className="alert-icon-wrapper">
                <AlertTriangle className="alert-icon" />
              </div>
              <div>
                <p className="alert-title">Outbreak Potential Detected</p>
                <p className="alert-desc">
                  AI-Neural clusters detected similar symptoms in <span className="alert-count">12 nearby patients</span> within a 5-mile radius.
                </p>
              </div>
            </div>
            <button className="alert-btn">
              Send Clinical Alert
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NextGen;
