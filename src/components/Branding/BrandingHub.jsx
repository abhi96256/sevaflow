import React, { useState, useRef, useEffect } from 'react';
import { Globe, QrCode, Share2, Camera, Link, MapPin, Copy, ExternalLink, Smartphone, Check, Trash2, Download, Plus, Info, Sparkles, Users, ArrowUpRight, Brain, Zap, Activity } from 'lucide-react';
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

  // Toggle States
  const [instagramSync, setInstagramSync] = useState(true);
  const [mapsIntegration, setMapsIntegration] = useState(true);
  const [seoOptimized, setSeoOptimized] = useState(true);

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Load data from Backend on mount
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/branding`);
        if (res.data && res.data.id) {
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
    navigator.clipboard.writeText(`${window.location.origin}/c/${slug}`);
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
    ctx.fillStyle = '#008080';
    ctx.fillRect(0, 0, 1200, 300);

    // Draw Clinic Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(clinicName, 600, 180);

    const profileUrl = `${window.location.origin}/c/${slug}`;
    ctx.fillText(`Scan to book an appointment`, 600, 500);

    // Draw Footer info
    ctx.fillStyle = '#64748b';
    ctx.font = '30px Inter, system-ui';
    ctx.fillText(profileUrl, 600, 1500);

    // Fetch and Draw REAL QR Code from API
    const qrImage = new Image();
    qrImage.crossOrigin = "anonymous";
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(profileUrl)}`;
    
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
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar branding-wrapper-bg">
      {/* Hero Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-sevaflow-brand">
            <Sparkles className="w-8 h-8 text-sevaflow-brand" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Professional Identity Lab</h2>
            <p className="text-slate-500 font-medium">Sculpt your clinical brand with AI-powered visibility tools.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-2">
            <p className="text-lg font-bold text-slate-800">14.2k</p>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Potential Reach</p>
          </div>
          <a
            href={`/c/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-sevaflow-dark text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/10 hover:bg-black transition-all text-sm no-underline"
          >
            <ExternalLink className="w-5 h-5" />
            Visit My Portal
          </a>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Core Tools */}
        <div className="col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Brand Authority Score Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Brain className="w-32 h-32 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-6">Brand Authority Score</h3>
              <div className="flex flex-col items-center">
                <div className="circular-progress">
                  <div className="z-10 flex flex-col items-center">
                    <span className="text-4xl font-black text-slate-800 leading-none">84</span>
                    <span className="text-xs font-bold text-slate-400">/100</span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <div className="flex items-center gap-1 text-emerald-500 font-bold mb-1 justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>+5.2%</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium italic">"Clinical trust index is rising"</p>
                </div>
              </div>
            </div>

            {/* Master Booking Link Card */}
            <div className="bg-white p-8 rounded-3xl border border-sevaflow-accent/30 shadow-md relative group">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-sevaflow-accent/10 rounded-lg text-sevaflow-brand">
                  <Link className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Master Booking Link</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between mb-6">
                <div className="flex items-baseline gap-1 overflow-hidden flex-1">
                  <span className="text-slate-400 font-medium text-sm">sevaflow.in/</span>
                  <input
                    className="text-sevaflow-brand font-bold text-lg truncate bg-transparent outline-none border-none flex-1 min-w-0"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
                <button
                  className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-sevaflow-brand"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">Instagram Sync</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={instagramSync}
                      onChange={(e) => setInstagramSync(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">Google Maps Integration</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={mapsIntegration}
                      onChange={(e) => setMapsIntegration(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-600">SEO Optimized</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={seoOptimized}
                      onChange={(e) => setSeoOptimized(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Physical & Social */}
          <div className="grid grid-cols-2 gap-6">
            {/* Physical Gateway */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <QrCode className="w-5 h-5 text-sevaflow-brand" />
                <h3 className="text-lg font-bold text-slate-800">Physical Gateway</h3>
              </div>
              <div className="flex items-center gap-8">
                <div className="w-32 h-32 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/c/' + slug)}`}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <button
                    onClick={handleDownloadQR}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all mb-2"
                  >
                    <Download className="w-4 h-4" />
                    Get High-Res Print
                  </button>
                  <p className="text-[11px] text-slate-400 font-medium">Scan to book appointments instantly from your reception desk.</p>
                </div>
              </div>
            </div>

            {/* Social Connectors */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Social Connectors</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    className="flex-1 bg-slate-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-sevaflow-accent py-2 px-3 outline-none"
                    placeholder="Maps Link"
                    type="text"
                    value={mapsLink}
                    onChange={(e) => setMapsLink(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <input
                    className="flex-1 bg-slate-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-sevaflow-accent py-2 px-3 outline-none"
                    placeholder="WhatsApp Number"
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Clinic Info */}
        <div className="col-span-4 space-y-6">
          {/* Clinic Identity Core */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-sevaflow-brand" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Clinic Identity Core</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                SYNCING
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Master Logo</label>
                <div
                  className="border-2 border-dashed border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-sevaflow-accent/50 cursor-pointer transition-all min-h-[120px]"
                  onClick={() => logoInputRef.current.click()}
                >
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-20 h-20 object-cover rounded-xl shadow-md border" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-slate-300 mb-2" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Max size 2MB, Square</span>
                    </>
                  )}
                  <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={handleLogoUpload} />
                </div>
              </div>

              {/* Gallery Assets Uploader */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Gallery Assets</label>
                <div
                  className="border-2 border-dashed border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-sevaflow-accent/50 cursor-pointer transition-all mb-3"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Plus className="w-6 h-6 text-slate-300 mb-1" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Import Media</span>
                  <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handlePhotoUpload} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors border-none cursor-pointer flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(i);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Professional Clinic Name</label>
                <input
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-semibold text-slate-800 focus:ring-sevaflow-accent outline-none"
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Identity Bio</label>
                <textarea
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-medium text-slate-600 text-sm focus:ring-sevaflow-accent outline-none"
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Consultation Fee (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    className="w-full bg-slate-50 border-none rounded-xl py-3 pl-8 px-4 font-bold text-slate-800 focus:ring-sevaflow-accent outline-none"
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Neural Live Preview */}
          <div>
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 shadow-sm rounded-full text-[10px] font-bold text-slate-500">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                Neural Live Preview
              </span>
            </div>

            {/* Mobile Device Frame */}
            <div className="w-full aspect-[9/18.5] bg-slate-900 rounded-[3rem] p-2.5 shadow-2xl mobile-frame-glow relative border-[6px] border-slate-800 max-w-[320px] mx-auto">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
              <div className="bg-white h-full w-full rounded-[2.2rem] overflow-hidden flex flex-col">
                {/* Mobile Screen Content */}
                <div className="h-32 bg-slate-50 flex items-center justify-center pt-8 relative overflow-hidden">
                  {photos.length > 0 ? (
                    <img src={photos[0]} alt="" className="w-full h-full object-cover absolute inset-0 opacity-80" />
                  ) : (
                    <div className="absolute inset-0 bg-slate-50" />
                  )}
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center z-10 overflow-hidden">
                    {logo ? (
                      <img src={logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-sevaflow-brand">{clinicName?.[0] || 'D'}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 px-6 pt-6 text-center overflow-y-auto custom-scrollbar">
                  <h4 className="text-xl font-bold text-slate-800 mb-1 leading-tight">{clinicName}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Premier Clinical Partner</p>
                  <button className="w-full bg-sevaflow-brand text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-cyan-900/10 mb-2 border-none cursor-pointer">
                    Book Now
                  </button>
                  <button className="w-full bg-slate-50 text-slate-700 py-3 rounded-xl text-sm font-bold border border-slate-100 mb-6 cursor-pointer">
                    Profile Share
                  </button>
                  <p className="text-[10px] leading-relaxed text-slate-500 text-center">
                    {bio}
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-2 pb-6">
                    {photos.slice(0, 3).map((p, i) => (
                      <img key={i} src={p} alt="" className="h-16 w-full object-cover rounded-lg border" />
                    ))}
                    {photos.length < 3 && Array.from({ length: 3 - photos.length }).map((_, i) => (
                      <div key={i} className="h-16 bg-slate-50 rounded-lg border border-dashed" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="pt-4">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full bg-gradient-to-r from-sevaflow-brand to-teal-600 text-white py-5 rounded-2xl text-lg font-black shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 border-none cursor-pointer"
            >
              {isUpdating ? 'Synchronizing...' : 'Publish Brand Transformation'}
              <ArrowUpRight className="w-6 h-6 animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingHub;
