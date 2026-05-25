import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

// Import generated images (using relative paths for development)
// Note: In a real app, these would be in the public/assets folder
const slideImages = [
  '/slide1.png',
  '/slide2.png',
  '/slide3.png'
];

const slideContent = [
  { 
    title: "Empowering Clinical Excellence.", 
    desc: "Precision management for modern healthcare providers." 
  },
  { 
    title: "AI-Driven Medical Intelligence.", 
    desc: "Transforming raw data into life-saving clinical insights." 
  },
  { 
    title: "Next-Gen Clinic Operations.", 
    desc: "Seamless workflows for the future of patient care." 
  }
];

const Login = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [role, setRole] = useState('Doctor'); // Doctor, Staff, Master
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchClinics();
    
    // Image Slider Interval
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  const fetchClinics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/clinics`);
      setClinics(res.data);
    } catch (err) {
      console.error('Failed to fetch clinics');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (role === 'Master') {
      if (password === 'admin123') {
        navigate('/super-admin');
        return;
      } else {
        setError('Invalid Master Admin password');
        return;
      }
    }

    if (!selectedClinic) {
      setError('Please select your clinic first');
      return;
    }

    const correctPassword = role === 'Doctor' ? selectedClinic.doctorPassword : selectedClinic.staffPassword;

    if (password === correctPassword) {
      localStorage.setItem('clinicUser', JSON.stringify({
         clinicId: selectedClinic.id,
         clinicName: selectedClinic.name,
         role: role
      }));
      navigate('/dashboard');
    } else {
      setError(`Invalid ${role} password for ${selectedClinic.name}`);
    }
  };

  return (
    <div className="login-page">
      <main className="login-main-container">
        {/* Left Panel - Image Slider */}
        <section className="login-left-panel">
          <AnimatePresence mode="wait">
            <motion.img 
              key={slideImages[currentSlide]}
              src={slideImages[currentSlide]} 
              alt="Medical Intelligence" 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </AnimatePresence>
          
          <div className="overlay-gradient"></div>
          
          <div className="left-panel-content">
            <div>
              <div className="login-brand">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '32px' }}>Pulse</span>
                <h1>SevaFlow</h1>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="hero-heading">{slideContent[currentSlide].title}</h2>
                  <p className="hero-subtext">{slideContent[currentSlide].desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="slider-dots">
              {slideImages.map((_, index) => (
                <div 
                  key={index} 
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                ></div>
              ))}
            </div>

            <div className="trust-badges">
              <div className="glass-badge">
                <span className="material-symbols-outlined">verified_user</span>
                <span>Enterprise Grade Security</span>
              </div>
              <div className="glass-badge">
                <span className="material-symbols-outlined">bolt</span>
                <span>AI-Powered Diagnostics</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <section className="login-right-panel">
          <div className="login-form-wrapper">
            <header className="form-header">
              <h2>Welcome Back</h2>
              <p>Access your clinic dashboard below</p>
            </header>

            <form onSubmit={handleLogin}>
              {/* Clinic Selection */}
              <div className="input-group">
                <label className="label-mini">Select Your Clinic</label>
                <div className="select-wrapper">
                  <select 
                    className="login-select"
                    value={selectedClinic ? selectedClinic.id : ''}
                    onChange={(e) => {
                      const clinic = clinics.find(c => c.id === parseInt(e.target.value));
                      setSelectedClinic(clinic);
                      setError('');
                    }}
                    disabled={role === 'Master'}
                  >
                    <option value="" disabled>{role === 'Master' ? 'System Login' : 'Choose your clinic...'}</option>
                    {clinics.map(clinic => (
                      <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined chevron">expand_more</span>
                </div>
              </div>

              {/* Role Selector */}
              <div className="input-group">
                <label className="label-mini">Continue as</label>
                <div className="role-grid">
                  <button 
                    type="button" 
                    className={`role-btn ${role === 'Doctor' ? 'active' : ''}`}
                    onClick={() => { setRole('Doctor'); setError(''); }}
                  >
                    <span className="material-symbols-outlined">person</span>
                    <span>Doctor</span>
                  </button>
                  <button 
                    type="button" 
                    className={`role-btn ${role === 'Staff' ? 'active' : ''}`}
                    onClick={() => { setRole('Staff'); setError(''); }}
                  >
                    <span className="material-symbols-outlined">groups</span>
                    <span>Staff</span>
                  </button>
                  <button 
                    type="button" 
                    className={`role-btn ${role === 'Master' ? 'active' : ''}`}
                    onClick={() => { setRole('Master'); setError(''); setSelectedClinic(null); }}
                  >
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    <span>Master</span>
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label className="label-mini">{role} Password</label>
                <div className="password-wrapper">
                  <span className="material-symbols-outlined lock-icon">lock</span>
                  <input 
                    className="login-input"
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required
                  />
                </div>
              </div>

              {error && <div className="login-error animate-in">{error}</div>}

              <button type="submit" className="submit-btn">
                <span>Enter Dashboard</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <footer className="form-footer">
              <p>Problems logging in? <span>Contact Support</span></p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
