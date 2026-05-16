import React, { useState } from 'react';
import { Search, Brain, FileText, CheckCircle2, FlaskConical, AlertCircle, Sparkles, RefreshCw, Download, AlertTriangle, Key, Bolt, Info } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Intelligence.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' ? new GoogleGenerativeAI(API_KEY) : null;

const SYSTEM_PROMPT = `You are a professional medical diagnostic assistant. Analyze the user's symptoms and return a valid JSON object. 
DO NOT include any markdown formatting, backticks, or "json" labels. Return ONLY raw JSON.

JSON Schema:
{
  "diagnosis": [
    {"name": "string", "confidence": "percentage string", "treatment": "string"}
  ],
  "labs": ["string"],
  "guidelines": "string",
  "critical": boolean
}

Rules:
1. Provide 3 probable diagnoses.
2. Confidence should be like "85%".
3. Treatment should be concise.
4. Labs should be relevant investigations.
5. If symptoms indicate emergency (heart attack, severe trauma, etc.), set critical to true.
6. Language: Use professional clinical English.
7. Return ONLY the JSON object. No other text.`;

const Intelligence = () => {
  const [symptoms, setSymptoms] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      setError('Please enter some symptoms first.');
      return;
    }

    if (!genAI) {
      setError('Gemini API Key is missing. Please add it to your .env file.');
      return;
    }

    setError('');
    setAnalyzing(true);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `${SYSTEM_PROMPT}\n\nSymptoms: ${symptoms}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const parsedData = JSON.parse(cleanedText);
      
      setResults(parsedData);
    } catch (err) {
      console.error("Gemini Error:", err);
      setError(`Analysis failed: ${err.message || 'Unknown error'}.`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setResults(null);
    setError('');
  };

  return (
    <div className="intel-wrapper">
      <header className="intel-header">
        <div className="intel-title-group">
          <div className="title-row">
            <Brain className="brain-icon-large" />
            <h2>Clinical Intelligence</h2>
          </div>
          <p>Real-time clinical reasoning powered by SevaFlow AI</p>
        </div>
        <div className="ai-status-badge">
          <div className={`pulse-dot ${genAI ? 'online' : 'offline'}`}></div>
          <span>Gemini AI Online</span>
        </div>
      </header>

      <div className="intel-grid">
        {/* Input Section */}
        <div className="input-section">
          <div className="elevation-card">
            <div className="panel-header">
              <h3>Input Symptoms</h3>
              <button className="reset-btn" onClick={handleReset}>
                <RefreshCw size={16} /> Reset
              </button>
            </div>
            <textarea 
              className="symptom-textarea"
              placeholder="e.g., 45yo male with sharp chest pain radiating to left arm, sweating since 30 mins..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            ></textarea>
            
            <button className="ai-analyze-btn" onClick={analyzeSymptoms} disabled={analyzing || !symptoms.trim()}>
              {analyzing ? <RefreshCw className="spinning" size={20} /> : <Bolt size={20} fill="white" />}
              <span>{analyzing ? 'Analyzing Symptoms...' : 'Run AI Analysis'}</span>
            </button>

            <div className="badge-row">
              <span className="status-badge-small">#REALTIME</span>
              <span className="status-badge-small">#GEMINIPRO</span>
              <span className="status-badge-small">#MEDICALKNOWLEDGE</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          <div className="elevation-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-48px', right: '-48px', width: '128px', height: '128px', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
            <div className="panel-header">
              <h3>Diagnostic Insights</h3>
            </div>
            
            <div className="diagnosis-content">
              {analyzing ? (
                <div className="insights-placeholder">
                  <div className="brain-circle spinning-glow">
                    <RefreshCw size={48} color="var(--primary)" className="spinning" />
                  </div>
                  <p>AI is processing clinical data...</p>
                </div>
              ) : results ? (
                <div className="results-list">
                  {results.diagnosis.map((d, i) => (
                    <div key={i} className={`diagnosis-item ${results.critical && i === 0 ? 'critical' : ''}`}>
                      <div className="diag-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h5>{d.name}</h5>
                          {results.critical && i === 0 && <span className="critical-tag">CRITICAL</span>}
                        </div>
                        <span className="conf-tag">{d.confidence} match</span>
                      </div>
                      <p className="treatment-text"><strong>Plan:</strong> {d.treatment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="insights-placeholder">
                  <div className="brain-circle">
                    <Brain size={48} color="var(--primary)" />
                  </div>
                  <h4>Awaiting clinical input...</h4>
                  <p style={{ fontSize: '14px', maxWidth: '250px', margin: '0 auto' }}>
                    Run analysis to get AI-powered differential diagnoses and treatment plans based on latest medical journals.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="sidebar-section">
          <div className="elevation-card sidebar-widget">
            <div className="widget-title">
              <div className="icon-bg labs">
                <FlaskConical size={18} />
              </div>
              <h4>Recommended Investigations</h4>
            </div>
            <ul className="widget-list">
              {results ? results.labs.map((lab, i) => (
                <li key={i}>
                  <div className="dot-marker" style={{ backgroundColor: 'var(--primary)' }}></div>
                  <span>{lab}</span>
                </li>
              )) : (
                <li>
                  <div className="dot-marker"></div>
                  <span style={{ fontStyle: 'italic', color: '#999' }}>Awaiting clinical data...</span>
                </li>
              )}
            </ul>
          </div>

          <div className="elevation-card sidebar-widget">
            <div className="widget-title">
              <div className="icon-bg book">
                <FileText size={18} />
              </div>
              <h4>Medical Guidelines</h4>
            </div>
            <div className="guideline-box">
              {results ? (
                <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: '1.5' }}>{results.guidelines}</p>
              ) : (
                <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#999' }}>Relevant protocols will be fetched after analysis.</p>
              )}
            </div>
          </div>

          <div className="visual-card">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoMljCnngHL5GuMqSogaGpePpPx1Di9YvEEixay0XkUYyNTU2sOh8-8i11eJRmglVcvcrhWGidt5b7gfjEVqFTLGyqjVFWuQTzhsqDEpi_KEed9ehMBqlMKJ4ZFjVf-mkLfJ5D6cgXPbfFm1uERw26ffLOoUv3bLmUoyDLqbv4AC0WW3vmWzoDdEMGFL0bhj9-g8ly8kah6Z9wshqPnBfdIGAtdbvrJOBf6cPKVwiRw3pBq18xl2T4EH3sUrrfe7uT48XrrQSRg6wU" 
              alt="AI Concept" 
              className="visual-image" 
            />
            <p>Continuous Learning Engine v4.2 Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intelligence;
