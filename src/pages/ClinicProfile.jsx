import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ClinicProfile = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/branding/public/${slug}`);
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error(err);
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading Clinic Profile...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={styles.loadingScreen}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏥</div>
        <h2 style={{ color: '#1e293b', fontWeight: 800, marginBottom: '8px' }}>Clinic Not Found</h2>
        <p style={{ color: '#64748b', fontWeight: 500 }}>The profile at <strong>sevaflow.in/{slug}</strong> does not exist.</p>
      </div>
    );
  }

  const { clinicName, bio, fee, logo, photos = [], mapsLink, whatsappNumber } = profile;
  const initial = (clinicName || 'D')[0].toUpperCase();

  return (
    <div style={styles.page}>
      {/* SEO Meta */}
      <title>{clinicName} | SevaFlow</title>

      {/* Hero Header */}
      <div style={styles.heroSection}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <div style={styles.logoWrapper}>
            {logo ? (
              <img src={logo} alt={clinicName} style={styles.logoImg} />
            ) : (
              <div style={styles.logoFallback}>{initial}</div>
            )}
          </div>
          <h1 style={styles.clinicName}>{clinicName}</h1>
          <p style={styles.tagline}>Premier Clinical Partner · Verified by SevaFlow</p>
          {fee && (
            <div style={styles.feeBadge}>
              <span style={styles.feeLabel}>Consultation Fee</span>
              <span style={styles.feeAmount}>₹{fee}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div style={styles.mainCard}>

        {/* Action Buttons */}
        <div style={styles.actionRow}>
          {whatsappNumber && (
            <a
              href={`https://wa.me/91${whatsappNumber.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(clinicName)}%2C%20I%20would%20like%20to%20book%20an%20appointment.`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.btnPrimary}
            >
              <span style={{ fontSize: '20px' }}>💬</span>
              Book via WhatsApp
            </a>
          )}
          {mapsLink && (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.btnSecondary}
            >
              <span style={{ fontSize: '18px' }}>📍</span>
              Get Directions
            </a>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <div style={styles.bioSection}>
            <h3 style={styles.sectionTitle}>About the Doctor</h3>
            <p style={styles.bioText}>{bio}</p>
          </div>
        )}

        {/* Gallery */}
        {photos.length > 0 && (
          <div style={styles.gallerySection}>
            <h3 style={styles.sectionTitle}>Clinic Gallery</h3>
            <div style={styles.galleryGrid}>
              {photos.map((src, i) => (
                <div key={i} style={styles.galleryItem}>
                  <img src={src} alt={`Clinic photo ${i + 1}`} style={styles.galleryImg} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div style={styles.infoGrid}>
          {fee && (
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>💊</div>
              <div>
                <p style={styles.infoLabel}>Consultation Fee</p>
                <p style={styles.infoValue}>₹{fee}</p>
              </div>
            </div>
          )}
          {whatsappNumber && (
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>📱</div>
              <div>
                <p style={styles.infoLabel}>WhatsApp / Phone</p>
                <p style={styles.infoValue}>{whatsappNumber}</p>
              </div>
            </div>
          )}
          {mapsLink && (
            <div style={styles.infoCard}>
              <div style={styles.infoIcon}>📍</div>
              <div>
                <p style={styles.infoLabel}>Location</p>
                <a href={mapsLink} target="_blank" rel="noopener noreferrer" style={{ ...styles.infoValue, color: '#008080', textDecoration: 'none' }}>
                  View on Maps →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div style={styles.qrSection}>
          <div style={styles.qrCard}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://sevaflow.in/${slug}`}
              alt="QR Code"
              style={styles.qrImage}
            />
            <div>
              <p style={styles.qrTitle}>Share This Profile</p>
              <p style={styles.qrSlug}>sevaflow.in/{slug}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://sevaflow.in/${slug}`);
                  alert('Link copied!');
                }}
                style={styles.copyBtn}
              >
                📋 Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Powered by <strong style={{ color: '#008080' }}>SevaFlow Intelligence</strong> · India's Premier Clinical SaaS
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #f8fafc; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #f0fdfa 0%, #f8fafc 40%, #f1f5f9 100%)',
    fontFamily: "'Inter', sans-serif",
    animation: 'fadeUp 0.5s ease both',
  },
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    gap: '16px',
  },
  spinner: {
    width: '44px',
    height: '44px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #008080',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#64748b',
    fontWeight: 600,
    fontSize: '15px',
  },
  heroSection: {
    position: 'relative',
    background: 'linear-gradient(135deg, #003d4d 0%, #008080 60%, #00b8a9 100%)',
    paddingTop: '60px',
    paddingBottom: '80px',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(0,240,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
    zIndex: 0,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 24px',
  },
  logoWrapper: {
    width: '100px',
    height: '100px',
    borderRadius: '28px',
    background: 'white',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid rgba(255,255,255,0.3)',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  logoFallback: {
    fontSize: '42px',
    fontWeight: 900,
    color: '#008080',
  },
  clinicName: {
    fontSize: '32px',
    fontWeight: 900,
    color: '#ffffff',
    letterSpacing: '-0.5px',
    marginBottom: '8px',
    textShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  tagline: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: '20px',
  },
  feeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '50px',
    padding: '8px 20px',
  },
  feeLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.8)',
  },
  feeAmount: {
    fontSize: '18px',
    fontWeight: 900,
    color: '#ffffff',
  },
  mainCard: {
    maxWidth: '520px',
    margin: '-40px auto 0',
    background: '#ffffff',
    borderRadius: '28px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
    padding: '32px 28px',
    position: 'relative',
    zIndex: 2,
  },
  actionRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '28px',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #008080 0%, #00b8a9 100%)',
    color: '#ffffff',
    padding: '16px',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: 800,
    textDecoration: 'none',
    boxShadow: '0 8px 24px rgba(0, 128, 128, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    background: '#f8fafc',
    color: '#1e293b',
    padding: '14px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    border: '1px solid #e2e8f0',
    transition: 'background 0.2s',
  },
  bioSection: {
    marginBottom: '28px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #f1f5f9',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  bioText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#475569',
    lineHeight: '1.7',
  },
  gallerySection: {
    marginBottom: '28px',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  galleryItem: {
    borderRadius: '12px',
    overflow: 'hidden',
    aspectRatio: '1',
  },
  galleryImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '28px',
  },
  infoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: '#f8fafc',
    borderRadius: '14px',
    padding: '14px 16px',
    border: '1px solid #f1f5f9',
  },
  infoIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '3px',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1e293b',
  },
  qrSection: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '24px',
  },
  qrCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  qrImage: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    border: '2px solid #f1f5f9',
    padding: '4px',
    background: 'white',
    flexShrink: 0,
  },
  qrTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '4px',
  },
  qrSlug: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#008080',
    marginBottom: '10px',
  },
  copyBtn: {
    background: 'rgba(0,128,128,0.08)',
    border: 'none',
    color: '#008080',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    padding: '32px 24px',
  },
  footerText: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: 500,
  },
};

export default ClinicProfile;
