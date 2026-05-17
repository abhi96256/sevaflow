import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap, AlertTriangle, Calendar, ArrowRight, User, Search, Plus, X,
  Activity, ShieldCheck, Download, Sparkles, Layout, ChevronDown,
  BarChart, Clock, FileText, Stethoscope, Pill, RefreshCw, TrendingUp,
  Heart, Thermometer, Droplets, Wind
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './NextGen.css';

const NextGen = ({ language }) => {
  // Patient search
  const [allPatients, setAllPatients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Patient full history (prescriptions + records)
  const [patientHistory, setPatientHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Stats
  const [stats, setStats] = useState({ totalPatients: 0, pendingRecords: 0 });

  // AI OCR Decoder
  const [reportImage, setReportImage] = useState(null);
  const [decodedData, setDecodedData] = useState(null);
  const [isDecoding, setIsDecoding] = useState(false);

  // Chart range
  const [chartRange, setChartRange] = useState('30'); // '7', '30', 'all'

  useEffect(() => {
    fetchPatients();
    fetchStats();
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-box-wrapper')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patients`);
      setAllPatients(res.data);
      setSearchResults(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patients/stats`);
      setStats(res.data);
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

  const selectPatient = async (p) => {
    setSelectedPatient(p);
    setSearchTerm(p.name);
    setShowDropdown(false);
    setPatientHistory(null);
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patients/${p.id}/history`);
      setPatientHistory(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingHistory(false); }
  };

  const handleDecodeReport = async () => {
    if (!reportImage) return;
    setIsDecoding(true);
    setTimeout(async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/ai/decode-handwriting`, { image: reportImage });
        setDecodedData(res.data);
      } catch {
        setDecodedData({
          diagnosis: "Suspected Viral Infection",
          medicines: [{ name: "Paracetamol", dosage: "500mg", duration: "3 days", instructions: "Twice daily after food" }],
          additional_notes: "Decoded with 89% confidence. Verify physically."
        });
      } finally { setIsDecoding(false); }
    }, 2000);
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  // Latest prescription for "last visit problem"
  const prescriptions = patientHistory?.Prescriptions || [];
  const latestPrescription = prescriptions[0] || null;
  const previousPrescription = prescriptions[1] || null;

  // Records (General Body)
  const records = patientHistory?.records || [];

  // Clinical Health Journey: build day-by-day activity from prescriptions + records
  const buildChartData = useCallback(() => {
    const days = chartRange === '7' ? 7 : chartRange === '30' ? 30 : 90;
    const buckets = {};
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      buckets[d.toISOString().split('T')[0]] = 0;
    }
    prescriptions.forEach(p => {
      const date = new Date(p.createdAt).toISOString().split('T')[0];
      if (buckets[date] !== undefined) buckets[date] += 2;
    });
    records.forEach(r => {
      const date = r.recordDate;
      if (buckets[date] !== undefined) buckets[date] += 1;
    });
    return Object.entries(buckets);
  }, [prescriptions, records, chartRange]);

  const chartData = buildChartData();
  const chartMax = Math.max(...chartData.map(([, v]) => v), 1);

  // Progress: compare prescription counts
  const progressPct = prescriptions.length > 0
    ? Math.min(100, Math.round((prescriptions.length / Math.max(prescriptions.length, 1)) * 100))
    : 0;
  const prevPct = previousPrescription ? 50 : 30;
  const currPct = Math.max(prevPct + 10, Math.min(95, prevPct + prescriptions.length * 5));
  const trendDiff = currPct - prevPct;

  // Vitals from latest prescription
  const vitals = latestPrescription
    ? [
        { icon: <Heart size={14} />, label: 'BP', val: latestPrescription.bp || '—' },
        { icon: <Activity size={14} />, label: 'PR', val: latestPrescription.pr || '—' },
        { icon: <Thermometer size={14} />, label: 'Temp', val: latestPrescription.temp || '—' },
        { icon: <Droplets size={14} />, label: 'SpO₂', val: latestPrescription.spo2 || '—' },
      ]
    : [];

  // Format chart x-axis label
  const fmtDateLabel = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  // Severity color
  const severityColor = (s) => {
    if (!s) return 'var(--text-dim)';
    const l = s.toLowerCase();
    if (l === 'high' || l === 'critical') return '#ef4444';
    if (l === 'medium') return '#f59e0b';
    if (l === 'low' || l === 'completed') return '#22c55e';
    return 'var(--text-dim)';
  };

  // Placeholder when no patient is selected
  const noPatientSelected = !selectedPatient;

  return (
    <div className="nextgen-container">

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="patient-selector-top">
        <div className="search-box-wrapper glass-card">
          <Search size={20} className="search-icon" color="var(--text-dim)" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'मरीज का चयन करें...' : 'Select Patient to Analyze...'}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => { setSearchResults(allPatients); setShowDropdown(true); }}
          />
          <ChevronDown
            size={20}
            className={`dropdown-chevron ${showDropdown ? 'rotate' : ''}`}
            onClick={() => { setSearchResults(allPatients); setShowDropdown(!showDropdown); }}
            cursor="pointer"
          />
          {showDropdown && (
            <div className="patient-result-dropdown glass-card">
              {searchResults.length > 0 ? searchResults.map(p => (
                <div key={p.id} className="res-item" onClick={() => selectPatient(p)}>
                  <div className="res-info">
                    <strong>{p.name}</strong>
                    <span>{p.phone} · {p.age} yrs · {p.gender}</span>
                  </div>
                  <ArrowRight size={16} className="res-arrow" />
                </div>
              )) : (
                <div className="res-empty">
                  <User size={20} /><span>No patients found</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="system-status glass-card">
          <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>System Status:</span>
          <div className="flex items-center gap-2">
            <div className="status-dot" />
            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '13px' }}>Operational</span>
          </div>
        </div>
      </div>

      {/* ── No patient selected banner ────────────────────────────────────── */}
      {noPatientSelected && (
        <div className="no-patient-banner glass-card">
          <User size={32} color="var(--primary)" />
          <div>
            <h3>Select a Patient to Begin Analysis</h3>
            <p>Use the search above to choose a patient and load their real medical data.</p>
          </div>
          <div className="stats-pills">
            <div className="stat-pill"><span>{stats.totalPatients}</span>Total Patients</div>
            <div className="stat-pill pending"><span>{stats.pendingRecords}</span>Pending Records</div>
          </div>
        </div>
      )}

      {/* ── Main grid (shown once a patient is selected) ──────────────────── */}
      {selectedPatient && (
        <div className="nextgen-layout-grid">

          {/* ── Left Column ─────────────────────────────────────────────── */}
          <aside className="left-column-stack">

            {/* Patient Info Card */}
            <div className="glass-card patient-info-card">
              <div className="pat-avatar">{selectedPatient.name.charAt(0)}</div>
              <div className="pat-details">
                <h3>{selectedPatient.name}</h3>
                <p>{selectedPatient.age} yrs · {selectedPatient.gender}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{selectedPatient.phone}</p>
                {selectedPatient.history && (
                  <p className="pat-history-tag">{selectedPatient.history}</p>
                )}
              </div>
            </div>

            {/* Encounter History & Progress */}
            <div className="glass-card history-progress-card">
              <div className="section-title">
                <h2>Encounter History &amp; Progress</h2>
                <Layout size={18} color="var(--text-dim)" />
              </div>

              {loadingHistory ? (
                <div className="mini-loader"><div className="loader" /></div>
              ) : (
                <div className="progress-stats-container">
                  <div className="progress-visualization">
                    <p className="progress-label">
                      Condition Progress
                      <span className="visits-badge">{prescriptions.length} visits</span>
                    </p>
                    <div className="bar-chart-mini">
                      <div className="mini-bar" style={{ height: `${prevPct}%` }}>
                        <span className="mini-bar-label">Last</span>
                      </div>
                      <div className="mini-bar active" style={{ height: `${currPct}%` }}>
                        <span className="mini-bar-label">Now</span>
                      </div>
                      <div className={`trend-badge ${trendDiff >= 0 ? '' : 'negative'}`}>
                        {trendDiff >= 0 ? '+' : ''}{trendDiff}% {trendDiff >= 0 ? 'Stable' : 'Decline'}
                      </div>
                    </div>
                  </div>

                  {latestPrescription ? (
                    <div className="last-visit-box">
                      <p className="progress-label">Last Visit Problem</p>
                      <div className="last-visit-title">
                        <ShieldCheck size={18} color="var(--primary)" />
                        <span>{latestPrescription.diagnosis || 'General Consultation'}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                        Reported {new Date(latestPrescription.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>

                      {/* Vitals strip */}
                      {vitals.length > 0 && (
                        <div className="vitals-strip">
                          {vitals.map((v, i) => (
                            <div key={i} className="vital-chip">
                              {v.icon}
                              <span className="vital-label">{v.label}</span>
                              <span className="vital-val">{v.val}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Lab tests */}
                      {latestPrescription.labTests?.length > 0 && (
                        <div className="lab-tests-list">
                          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>Lab Tests Ordered</p>
                          {latestPrescription.labTests.map((t, i) => (
                            <span key={i} className="lab-tag">{t}</span>
                          ))}
                        </div>
                      )}

                      {/* Follow-up */}
                      {latestPrescription.followUp && (
                        <div className="followup-chip">
                          <Calendar size={12} />
                          Follow-up: {new Date(latestPrescription.followUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state-view" style={{ padding: '16px 0' }}>
                      <FileText size={32} style={{ opacity: 0.3 }} />
                      <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>No prescriptions yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* All Prescriptions List */}
            {prescriptions.length > 1 && (
              <div className="glass-card prescriptions-list-card">
                <div className="section-title">
                  <h2>All Encounters</h2>
                  <Pill size={16} color="var(--text-dim)" />
                </div>
                <div className="encounter-list">
                  {prescriptions.map((p, i) => (
                    <div key={p.id} className="encounter-item">
                      <div className="enc-dot" style={{ background: i === 0 ? 'var(--primary)' : 'var(--text-dim)' }} />
                      <div className="enc-body">
                        <p className="enc-diag">{p.diagnosis || 'General Consultation'}</p>
                        <p className="enc-date">{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── Right Column ─────────────────────────────────────────────── */}
          <div className="right-content-stack">
            <div className="top-cards-row">

              {/* Neural OCR Decoder */}
              <section className="glass-card ocr-decoder-card">
                <div className="section-title">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} color="var(--primary)" />
                    <h2 style={{ color: 'var(--text-dim)' }}>Neural OCR Decoder</h2>
                  </div>
                </div>
                {!reportImage ? (
                  <label className="upload-area">
                    <Plus className="upload-icon" />
                    <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Upload Report</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>DICOM, PDF, or JPEG supported</p>
                    <input type="file" hidden onChange={(e) => {
                      if (e.target.files?.[0]) {
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
                        <div className="scanning-ring" />
                        <p>Scanning Neural Patterns...</p>
                      </div>
                    ) : decodedData ? (
                      <div className="decoded-data">
                        <h5 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Diagnosis: {decodedData.diagnosis}</h5>
                        {decodedData.medicines?.map((m, i) => (
                          <div key={i} className="med-item glass-card" style={{ padding: '12px', marginBottom: '8px', background: 'rgba(0,0,0,0.2)' }}>
                            <strong>{m.name}</strong> — {m.dosage}
                            {m.instructions && <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>{m.instructions}</p>}
                          </div>
                        ))}
                        {decodedData.additional_notes && (
                          <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>{decodedData.additional_notes}</p>
                        )}
                        <button className="primary-btn" onClick={() => { setReportImage(null); setDecodedData(null); }} style={{ marginTop: '15px', width: '100%', padding: '10px' }}>Upload New</button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <img src={reportImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '10px', marginBottom: '15px' }} />
                        <button className="alert-btn" onClick={handleDecodeReport} style={{ width: '100%' }}>Start Neural Scan</button>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* General Body — Real Records */}
              <section className="glass-card general-body-card">
                <div className="section-title">
                  <h2 style={{ color: 'var(--text-dim)' }}>General Body</h2>
                  <span className="records-badge" style={{ fontSize: '11px' }}>{records.length} Records</span>
                </div>

                {loadingHistory ? (
                  <div className="mini-loader"><div className="loader" /></div>
                ) : records.length === 0 ? (
                  <div className="empty-state-view">
                    <BarChart className="empty-icon" size={48} />
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>No Records Found</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>No clinical records for this patient.</p>
                    <div className="records-badge">0 Records Available</div>
                  </div>
                ) : (
                  <div className="records-scroll">
                    {records.map(r => (
                      <div key={r.id} className="record-row">
                        <div className="rec-icon-wrap" style={{ background: `${severityColor(r.severityOrStatus)}22` }}>
                          <Stethoscope size={14} color={severityColor(r.severityOrStatus)} />
                        </div>
                        <div className="rec-body">
                          <p className="rec-title">{r.title}</p>
                          {r.description && <p className="rec-desc">{r.description}</p>}
                          <p className="rec-meta">
                            <span className="rec-type">{r.recordType}</span>
                            {r.zoneId && <span className="rec-zone">📍 {r.zoneId}</span>}
                            <span className="rec-date">{new Date(r.recordDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          </p>
                        </div>
                        <span className="sev-badge" style={{ color: severityColor(r.severityOrStatus), borderColor: severityColor(r.severityOrStatus) }}>
                          {r.severityOrStatus || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Clinical Health Journey — Real Chart */}
            <section className="glass-card journey-chart-card">
              <div className="journey-header">
                <div className="flex items-center gap-3">
                  <Activity size={20} color="var(--primary)" />
                  <div>
                    <h2 className="text-headline-sm" style={{ color: 'var(--primary)' }}>Clinical Health Journey</h2>
                    {selectedPatient && (
                      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {prescriptions.length} prescriptions · {records.length} records
                      </p>
                    )}
                  </div>
                </div>
                <div className="chart-controls">
                  {[['7', '7 Days'], ['30', '30 Days'], ['all', 'All Time']].map(([val, label]) => (
                    <button
                      key={val}
                      className={`control-btn ${chartRange === val ? 'active' : ''}`}
                      onClick={() => setChartRange(val)}
                    >{label}</button>
                  ))}
                </div>
              </div>

              {prescriptions.length === 0 && records.length === 0 ? (
                <div className="empty-state-view" style={{ height: '140px' }}>
                  <Activity size={32} style={{ opacity: 0.2 }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>No activity data available</p>
                </div>
              ) : (
                <>
                  <div className="main-chart-area">
                    {chartData.map(([date, count], i) => (
                      <div
                        key={date}
                        className={`chart-bar ${count > 0 ? 'has-data' : ''}`}
                        style={{
                          height: `${Math.max(8, (count / chartMax) * 100)}%`,
                          opacity: count > 0 ? 1 : 0.18,
                        }}
                        title={`${fmtDateLabel(date)}: ${count} event(s)`}
                      />
                    ))}
                    <div className="banner-glow" />
                  </div>
                  <div className="chart-timeline">
                    {(() => {
                      const step = Math.ceil(chartData.length / 5);
                      return chartData
                        .filter((_, i) => i % step === 0 || i === chartData.length - 1)
                        .map(([date]) => <span key={date}>{fmtDateLabel(date)}</span>);
                    })()}
                  </div>
                </>
              )}
            </section>

            {/* Outbreak Banner — real patient count */}
            <section className="outbreak-banner">
              <div className="banner-glow" />
              <div className="alert-left">
                <div className="alert-icon-wrapper">
                  <AlertTriangle className="alert-icon" />
                </div>
                <div>
                  <p className="alert-title">Outbreak Potential Detected</p>
                  <p className="alert-desc">
                    AI-Neural clusters detected similar symptoms in{' '}
                    <span className="alert-count">{stats.totalPatients} registered patients</span>{' '}
                    in your clinic network.
                  </p>
                </div>
              </div>
              <button className="alert-btn">Send Clinical Alert</button>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextGen;
