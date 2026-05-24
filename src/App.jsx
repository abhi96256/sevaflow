import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import './styles/theme.css';
import './App.css';
import { Globe, Moon, Sun } from 'lucide-react';

import Analytics from './components/Charts/Analytics';
import PharmacyLink from './components/Pharmacy/PharmacyLink';
import PrescriptionBuilder from './components/Prescription/PrescriptionBuilder';
import Billing from './components/Billing/Billing';
import Appointments from './components/Appointments/Appointments';
// import TeleMedicine from './components/TeleMedicine/TeleMedicine';
import NextGen from './components/NextGen/NextGen';

import Intelligence from './components/Intelligence/Intelligence';
import PatientManager from './components/Patients/PatientManager';
import InventoryManager from './components/Inventory/InventoryManager';
import SuperAdminLayout from './pages/SuperAdmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import ManageClinics from './pages/SuperAdmin/ManageClinics';
import Revenue from './pages/SuperAdmin/Revenue';
import Broadcast from './pages/SuperAdmin/Broadcast';
import Security from './pages/SuperAdmin/Security';
import Login from './pages/Auth/Login';
import ClinicProfile from './pages/ClinicProfile';
import axios from 'axios';
import API_BASE_URL from './config/api';
import { Search, X, Calendar, Phone, User as UserIcon, Clock } from 'lucide-react';

function App() {
  const location = useLocation();
  const [language, setLanguage] = useState('en'); // en, hi, hn
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patients/search?query=${searchQuery}`);
      setSearchResults(res.data);
      setShowResults(true);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewHistory = async (patientId) => {
    setSelectedPatientId(patientId);
    setShowHistoryModal(true);
    setShowResults(false);
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/patients/${patientId}/history`);
      setPatientHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleLanguage = () => {
    const langs = ['en', 'hi', 'hn'];
    const nextIndex = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const isSuperAdminPath = location.pathname.startsWith('/super-admin');
  const isLoginPath = location.pathname === '/login';
  const isPublicProfilePath = location.pathname.startsWith('/c/');
  const isLandingPagePath = location.pathname === '/';

  if (isLandingPagePath) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  // // Temporarily disabled login check for development
  // if (!user && !isSuperAdminPath && !isLoginPath) {
  //   window.location.href = '/login';
  //   return null;
  // }

  if (isSuperAdminPath) {
    return (
      <Routes>
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="clinics" element={<ManageClinics />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="broadcast" element={<Broadcast />} />
          <Route path="security" element={<Security />} />
        </Route>
      </Routes>
    );
  }

  if (isLoginPath) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  if (isPublicProfilePath) {
    return (
      <Routes>
        <Route path="/c/:slug" element={<ClinicProfile />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <div className="bg-decor decoration-1"></div>
      <div className="bg-decor decoration-2"></div>
      
      <Sidebar language={language} />
      
      <main className="main-content">
        <div className="top-bar">
          <div className="search-container-header">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder={language === 'en' ? 'Search patients (name or phone)...' : language === 'hi' ? 'मरीज खोजें...' : 'Search karie patients...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 2 && setShowResults(true)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>

            {showResults && (
              <div className="search-results-dropdown glass-morph animate-in">
                <div className="results-header">
                  <span>Found {searchResults.length} Patients</span>
                  <button onClick={() => setShowResults(false)}>Close</button>
                </div>
                <div className="results-list">
                  {searchResults.length === 0 ? (
                    <div className="no-results">No patients found</div>
                  ) : (
                    searchResults.map(patient => (
                      <div key={patient.id} className="search-result-item">
                        <div className="res-avatar">{patient.name.charAt(0)}</div>
                        <div className="res-info">
                          <div className="res-name-row">
                            <strong>{patient.name}</strong>
                            <span className="res-gender">{patient.gender}, {patient.age} yrs</span>
                          </div>
                          <div className="res-meta">
                            <span className="res-phone"><Phone size={12} /> {patient.phone}</span>
                            {patient.appointments?.length > 0 ? (
                              <span className="res-last-visit">
                                <Clock size={12} /> Last Visit: {patient.appointments[0].appointmentDate}
                              </span>
                            ) : (
                              <span className="res-last-visit">No previous visits</span>
                            )}
                          </div>
                        </div>
                        <button className="res-action-btn" onClick={() => handleViewHistory(patient.id)}>
                          View Full History
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="top-actions">
            <button className="icon-btn" onClick={toggleLanguage} title="Change Language">
              <Globe size={18} />
              <span className="lang-code">{language.toUpperCase()}</span>
            </button>
            <button className="icon-btn" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div className="divider"></div>

            <div className="user-profile">
              <div className="avatar">DS</div>
              <div className="user-info">
                <strong>Dr. Sharma</strong>
                <span>MBBS, MD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="page-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard language={language} />} />
            <Route path="/patients" element={<PatientManager language={language} />} />
            <Route path="/appointments" element={<Appointments language={language} />} />
            <Route path="/intelligence" element={<Intelligence language={language} />} />
            <Route path="/prescription" element={<PrescriptionBuilder language={language} />} />
            <Route path="/billing" element={<Billing language={language} />} />
            {/* <Route path="/tele-consult" element={<TeleMedicine language={language} />} /> */}
            <Route path="/analytics" element={<Analytics language={language} />} />
            <Route path="/ai-hub" element={<NextGen language={language} />} />
            <Route path="/pharmacy" element={<PharmacyLink language={language} />} />
            <Route path="/inventory" element={<InventoryManager language={language} />} />

          </Routes>
        </div>

        {/* Patient History Modal */}
        {showHistoryModal && (
          <div className="modal-overlay animate-in" onClick={() => setShowHistoryModal(false)}>
            <div className="history-modal glass-morph" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="pat-header-info">
                  <h2>{patientHistory?.name || 'Loading...'}</h2>
                  <span>Patient ID: #{selectedPatientId}</span>
                </div>
                <button className="close-modal" onClick={() => setShowHistoryModal(false)}><X /></button>
              </div>

              <div className="modal-body">
                {loadingHistory ? (
                  <div className="loader-container">
                    <div className="loader"></div>
                    <p>Fetching full medical history...</p>
                  </div>
                ) : (
                  <div className="history-sections">
                    <div className="h-section">
                      <h3><Clock size={18} color="var(--primary)" /> Prescription History</h3>
                      <div className="h-list">
                        {!patientHistory?.Prescriptions || patientHistory.Prescriptions.length === 0 ? (
                          <div className="empty-state">No prescriptions found.</div>
                        ) : (
                          patientHistory.Prescriptions.map(p => (
                            <div key={p.id} className="h-card">
                              <div className="h-card-header">
                                <strong>{new Date(p.createdAt).toLocaleDateString()}</strong>
                                <span className="h-tag rx">Rx</span>
                              </div>
                              <p className="h-diagnosis"><strong>Diagnosis:</strong> {p.diagnosis || 'General Checkup'}</p>
                              <div className="h-meds">
                                {p.medicines?.map(m => (
                                  <span key={m.id} className="med-tag">{m.name} ({m.dosage})</span>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="h-section">
                      <h3><Calendar size={18} color="var(--accent)" /> Clinical Records</h3>
                      <div className="h-list">
                        {!patientHistory?.records || patientHistory.records.length === 0 ? (
                          <div className="empty-state">No clinical records found.</div>
                        ) : (
                          patientHistory.records.map(r => (
                            <div key={r.id} className="h-card record">
                              <div className="h-card-header">
                                <strong>{new Date(r.recordDate).toLocaleDateString()}</strong>
                                <span className="h-tag clinic">Record</span>
                              </div>
                              <p className="h-notes">{r.notes}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
