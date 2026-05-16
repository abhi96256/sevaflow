import React, { useState, useRef, useEffect } from 'react';
import { Globe, QrCode, Share2, Camera, Link, MapPin, Copy, ExternalLink, Smartphone, Check, Trash2, Download, Plus, Info, Sparkles, Users, ArrowUpRight, Brain, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './BrandingHub.css';

const BrandingHub = ({ language }) => {
  const [slug, setSlug] = useState('dr-sharma-clinic');
  const [clinicName, setClinicName] = useState('Dr. Sharma Clinic');
  const [logo, setLogo] = useState(null);
  const [bio, setBio] = useState('Specialist in Orthopedics with 15+ years of experience in joint replacements and sports medicine.');
  const [fee, setFee] = useState('500');
  const [mapsLink, setMapsLink] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [photos, setPhotos] = useState([]);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Load data from Backend on mount
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/branding`);
        if (res.data.id) {
          const data = res.data;
          setSlug(data.slug || 'dr-sharma-clinic');
          setClinicName(data.clinicName || 'Dr. Sharma Clinic');
          setBio(data.bio || '');
          setFee(data.fee || '500');
          setMapsLink(data.mapsLink || '');
          setWhatsappNumber(data.whatsappNumber || '');
          setSocialLink(data.socialLink || '');
          setLogo(data.logo);
          if (data.photos) {
            setPhotos(JSON.parse(data.photos));
          }
        }
      } catch (err) {
        console.error("Failed to fetch branding details", err);
      }
    };
    fetchBranding();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`sevaflow.in/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result); // Save as base64 for persistence
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    const brandingData = {
      slug,
      clinicName,
      bio,
      fee,
      logo,
      photos,
      mapsLink,
      whatsappNumber,
      socialLink
    };

    try {
      // Save to Backend Database
      await axios.post(`${API_BASE_URL}/api/branding`, brandingData);
      
      setIsUpdating(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save branding details", err);
      setIsUpdating(false);
      alert("Error saving to database. Check console.");
    }
  };

  const handleDownloadQR = () => {
    setIsDownloading(true);
    
    // Create a high-res canvas for the poster
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');

    // Draw Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 1600);

    // Draw Primary Header
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, 1200, 300);

    // Draw Clinic Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(clinicName, 600, 180);

    // Draw Instruction Text
    ctx.fillStyle = '#1e293b';
    ctx.font = '50px Inter, system-ui';
    ctx.fillText('Scan to Book Appointment', 600, 500);

    // Draw Simulated QR Code Frame
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 10;
    ctx.strokeRect(300, 600, 600, 600);
    
    // Draw Footer info
    ctx.fillStyle = '#64748b';
    ctx.font = '30px Inter, system-ui';
    ctx.fillText(`Powered by SevaFlow | sevaflow.in/${slug}`, 600, 1500);

    // Fetch and Draw REAL QR Code from API
    const qrImage = new Image();
    qrImage.crossOrigin = "anonymous";
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=https://sevaflow.in/${slug}`;
    
    qrImage.onload = () => {
      // Draw the real QR code inside the frame
      ctx.drawImage(qrImage, 310, 610, 580, 580);

      // Trigger Download after QR is loaded
      const link = document.createElement('a');
      link.download = `${clinicName.replace(/\s+/g, '_')}_QR_Poster.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      setIsDownloading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    };

    qrImage.onerror = () => {
      alert("Failed to generate real QR code. Please check your internet connection.");
      setIsDownloading(false);
    };
  };

  return (
    <div className="branding-wrapper luxury-theme">
      {/* Immersive Background Glows */}
      <div className="neural-glow top-right"></div>
      <div className="neural-glow bottom-left"></div>

      {/* Immersive Header */}
      <div className="branding-header-ultra">
        <div className="header-content">
          <div className="title-ring"><Sparkles size={24} color="var(--primary)" /></div>
          <div className="header-titles">
            <h2>Professional Identity Lab</h2>
            <p>Sculpt your clinical brand with AI-powered visibility tools.</p>
          </div>
        </div>
        <div className="header-meta">
           <div className="meta-item">
              <Users size={18} />
              <span><strong>14.2k</strong> Potential Reach</span>
           </div>
           <button className="preview-lab-btn">
              <Globe size={18} /> Visit My Portal
           </button>
        </div>
      </div>

      <div className="bento-grid">
        {/* Authority Score Gauge */}
        <div className="bento-card score-gauge-card glass-panel">
          <h3>Brand Authority Score</h3>
          <div className="gauge-container">
            <svg viewBox="0 0 100 100" className="gauge-svg">
               <circle className="gauge-track" cx="50" cy="50" r="45" />
               <circle className="gauge-fill" cx="50" cy="50" r="45" strokeDasharray="210 283" />
            </svg>
            <div className="gauge-text">
               <span className="sc-val">84</span>
               <span className="sc-total">/100</span>
            </div>
          </div>
          <div className="gauge-footer">
             <div className="trend up"><ArrowUpRight size={14} /> +5.2%</div>
             <span>Clinical trust index is rising</span>
          </div>
        </div>

        {/* Unique Link Bento */}
        <div className="bento-card link-bento glass-panel">
          <div className="card-hd">
            <Link size={20} color="var(--primary)" />
            <h3>Master Booking Link</h3>
          </div>
          <div className="link-lab-wrapper">
            <div className="link-shield">
               <span className="l-pfx">sevaflow.in/</span>
               <input value={slug} onChange={(e) => setSlug(e.target.value)} />
               <button className="l-copy" onClick={handleCopy}>
                 {copied ? <Check size={18} /> : <Copy size={18} />}
               </button>
            </div>
          </div>
          <div className="lab-badges">
            <div className="l-badge instagram">Instagram</div>
            <div className="l-badge gmaps">Google Maps</div>
            <div className="l-badge seo">SEO Optimized</div>
          </div>
        </div>

        {/* Content Lab - Spans 2 rows */}
        <div className="bento-card content-lab glass-panel">
          <div className="panel-hdr">
             <div className="hdr-i"><Brain size={20} /></div>
             <h3>Clinic Identity Core</h3>
             <div className="sync-tag"><div className="dot"></div> Syncing</div>
          </div>
          
          <div className="lab-controls">
            <div className="lab-row">
              <div className="lab-logo-area">
                <div className="logo-target" onClick={() => logoInputRef.current.click()}>
                   {logo ? <img src={logo} alt="Logo" /> : <Camera size={30} />}
                   <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={handleLogoUpload} />
                </div>
                <div className="logo-helper">
                   <strong>Master Logo</strong>
                   <p>Max size 2MB, Square</p>
                </div>
              </div>
            </div>

            <div className="lab-gallery">
               <label>Gallery Assets</label>
               <div className="gallery-drop" onClick={() => fileInputRef.current.click()}>
                  <Plus size={24} />
                  <span>Import Media</span>
                  <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handlePhotoUpload} />
               </div>
               <div className="gallery-strip">
                 {photos.map((p, i) => (
                   <div key={i} className="strip-item">
                     <img src={p} alt="" />
                     <button className="del" onClick={() => removePhoto(i)}><Trash2 size={12} /></button>
                   </div>
                 ))}
               </div>
            </div>

            <div className="lab-form">
               <div className="i-group">
                 <label>Professional Clinic Name</label>
                 <input value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="Dr. XYZ's Clinic" />
               </div>
               <div className="i-group">
                 <label>Identity Bio</label>
                 <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell your clinical story..." />
               </div>
               <div className="i-group">
                 <label>Consultation Fee (INR)</label>
                 <div className="i-curr">
                    <span>₹</span>
                    <input type="number" value={fee} onChange={e => setFee(e.target.value)} />
                 </div>
               </div>
            </div>

            <button className="lab-publish-btn" onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Synchronizing...' : 'Publish Brand Transformation'}
            </button>
          </div>
        </div>

        {/* QR Lab Card */}
        <div className="bento-card qr-lab glass-panel">
           <div className="card-hd">
              <QrCode size={20} color="var(--primary)" />
              <h3>Physical Gateway</h3>
           </div>
           <div className="qr-lab-body">
              <div className="qr-lab-preview">
                 <div className="q-wrap">
                    <QrCode size={80} color="var(--primary)" />
                 </div>
              </div>
              <button className="qr-download-lab" onClick={handleDownloadQR}>
                 <Download size={18} /> Get High-Res Print
              </button>
           </div>
        </div>

        {/* Social Lab Card */}
        <div className="bento-card social-lab glass-panel">
           <h3>Social Connectors</h3>
           <div className="social-inputs">
              <div className="s-row"><MapPin size={16} /><input placeholder="Maps Link" value={mapsLink} onChange={e => setMapsLink(e.target.value)} /></div>
              <div className="s-row"><Smartphone size={16} /><input placeholder="WhatsApp Number" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} /></div>
           </div>
        </div>

        {/* Floating Smartphone Mockup */}
        <div className="floater-mockup">
           <div className="mockup-stage">
              <div className="iphone-15-pro">
                 <div className="bezel">
                    <div className="screen-content">
                       <div className="ios-header">
                          <div className="time">9:41</div>
                          <div className="dynamic-island"></div>
                          <div className="status-icons"><Activity size={12} /><Zap size={12} /></div>
                       </div>
                       
                       <div className="p-web-content">
                          <div className="p-banner" style={{backgroundImage: photos.length > 0 ? `url(${photos[0]})` : 'none'}}></div>
                          <div className="p-profile">
                             {logo ? <img src={logo} alt="" className="p-logo" /> : <div className="p-avatar">{clinicName?.[0]}</div>}
                          </div>
                          <div className="p-titles">
                             <h3>{clinicName}</h3>
                             <p>Premier Clinical Partner</p>
                          </div>
                          <div className="p-actions">
                             <div className="p-btn pri">Book Now</div>
                             <div className="p-btn sec">Profile Share</div>
                          </div>
                          <div className="p-bio">{bio}</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           <div className="mockup-label">
              <div className="live-pulse"></div>
              <span>Neural Live Preview</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingHub;
