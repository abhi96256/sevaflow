import React, { useState, useEffect, useRef } from 'react';
import { 
  IndianRupee, 
  MessageCircle, 
  FileText, 
  Download, 
  CheckCircle, 
  Smartphone, 
  Send, 
  ArrowRight, 
  Printer, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Bolt, 
  ShieldCheck, 
  CloudLightning,
  Lightbulb,
  Plus,
  X
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './Billing.css';


const Billing = ({ language }) => {
  const [items, setItems] = useState([]);
  const [patientInfo, setPatientInfo] = useState({ name: 'Abhishek Kumar', phone: '9876543210' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const invoiceRef = useRef(null);

  const [editingItemId, setEditingItemId] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editSub, setEditSub] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditDesc(item.desc);
    setEditSub(item.sub || '');
    setEditPrice(item.price);
  };

  const saveEdit = (id) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          desc: editDesc,
          sub: editSub,
          price: parseFloat(editPrice) || 0
        };
      }
      return item;
    });
    setItems(updated);
    
    const savedBill = localStorage.getItem('pending_bill');
    if (savedBill) {
      const parsed = JSON.parse(savedBill);
      localStorage.setItem('pending_bill', JSON.stringify({
        ...parsed,
        items: updated
      }));
    } else {
      localStorage.setItem('pending_bill', JSON.stringify({
        patientName: patientInfo.name,
        patientPhone: patientInfo.phone,
        items: updated
      }));
    }
    
    setEditingItemId(null);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
  };

  const [stats, setStats] = useState({ revenue: 0, count: 0 });
  const [waReady, setWaReady] = useState(false);
  const [waQR, setWaQR] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/billing/stats`);
      setStats({ revenue: res.data.revenue, count: res.data.count });
    } catch (err) {
      console.error('Error fetching billing stats:', err);
    }
  };

  const fetchWAStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/whatsapp/status`);
      setWaReady(res.data.isReady);
      if (res.data.hasQR) {
        setWaQR(res.data.qrCode);
      } else {
        setWaQR(null);
      }
    } catch (err) {
      // Backend not reachable
    }
  };

  useEffect(() => {
    fetchStats();
    fetchWAStatus();
    // Poll WA status every 4 seconds until connected
    const interval = setInterval(() => {
      fetchWAStatus();
    }, 4000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (waReady) setShowQRModal(false);
  }, [waReady]);

  useEffect(() => {
    const savedBill = localStorage.getItem('pending_bill');
    if (savedBill) {
      const parsed = JSON.parse(savedBill);
      setItems(parsed.items);
      setPatientInfo({ name: parsed.patientName || 'Abhishek Kumar', phone: parsed.patientPhone || '9876543210' });
    } else {
      setItems([
        { id: 1, desc: 'General Consultation', sub: 'Regular Check-up Fee', price: 500, type: 'service' },
        { id: 2, desc: 'Levocetirizine 5mg', sub: '10 Tablets Strip', price: 150, type: 'med' },
        { id: 3, desc: 'Montelukast', sub: 'Anti-allergic medication', price: 150, type: 'med' },
        { id: 4, desc: 'Nasal Spray', sub: 'Allergy Relief 10ml', price: 150, type: 'med' }
      ]);
    }
  }, []);

  const total = items.reduce((acc, item) => acc + item.price, 0);
  const gst = total * 0.18;
  const grandTotal = total + gst;

  const handleSendInvoice = async () => {
    if (!patientInfo.phone) {
      alert('Patient phone number missing!');
      return;
    }

    // If WA not connected yet, show QR setup modal
    if (!waReady) {
      setShowQRModal(true);
      return;
    }

    setSending(true);
    try {
      // STEP 1: Auto-download PDF silently (doctor's digital record)
      const invoiceId = `SF-${Math.floor(1000 + Math.random() * 9000)}`;
      const element = invoiceRef.current;
      element.dataset.invoiceId = invoiceId;
      element.style.display = 'block';
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${patientInfo.name}_${invoiceId}.pdf`);
      element.style.display = 'none';

      // Get PDF as Base64 string to send to WhatsApp API
      const pdfBase64 = pdf.output('datauristring').split(',')[1];

      // STEP 2: Backend sends WhatsApp message automatically + saves to DB
      const res = await axios.post(`${API_BASE_URL}/api/whatsapp/send-invoice`, {
        patientName: patientInfo.name,
        patientPhone: patientInfo.phone,
        items,
        subtotal: total,
        gst,
        grandTotal,
        pdfBase64
      });


      setSent(true);
      setSuccessMsg(`✅ Sent! Invoice ${res.data.invoiceId}`);
      setTimeout(() => { setSent(false); setSuccessMsg(''); }, 4000);
      localStorage.removeItem('pending_bill');
      fetchStats();
    } catch (err) {
      console.error('Error:', err);
      const errMsg = err?.response?.data?.error || 'Something went wrong.';
      alert(errMsg);
    } finally {
      setSending(false);
    }
  };


  const downloadPDF = async () => {
    setGenerating(true);
    const element = invoiceRef.current;
    element.style.display = 'block';
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${patientInfo.name}.pdf`);
    } catch (err) {
      console.error('PDF Error:', err);
    } finally {
      element.style.display = 'none';
      setGenerating(false);
    }
  };

  const addItem = (e) => {
    e.preventDefault();
    const desc = e.target.desc.value;
    const price = parseInt(e.target.price.value);
    if (desc && price) {
      const newItem = { id: Date.now(), desc, sub: 'Direct Addition', price, type: 'service' };
      const updated = [...items, newItem];
      setItems(updated);
      
      const savedBill = localStorage.getItem('pending_bill');
      if (savedBill) {
        const parsed = JSON.parse(savedBill);
        localStorage.setItem('pending_bill', JSON.stringify({
          ...parsed,
          items: updated
        }));
      } else {
        localStorage.setItem('pending_bill', JSON.stringify({
          patientName: patientInfo.name,
          patientPhone: patientInfo.phone,
          items: updated
        }));
      }
      e.target.reset();
    }
  };

  const deleteItem = (id) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    
    const savedBill = localStorage.getItem('pending_bill');
    if (savedBill) {
      const parsed = JSON.parse(savedBill);
      localStorage.setItem('pending_bill', JSON.stringify({
        ...parsed,
        items: updated
      }));
    } else {
      localStorage.setItem('pending_bill', JSON.stringify({
        patientName: patientInfo.name,
        patientPhone: patientInfo.phone,
        items: updated
      }));
    }
  };

  return (
    <div className="billing-wrapper">

      {/* ✅ Success Toast */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 99999,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff', padding: '14px 24px', borderRadius: '14px',
          fontWeight: '700', fontSize: '14px', boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
          display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'slideInRight 0.3s ease'
        }}>
          <MessageCircle size={18} /> {successMsg}
        </div>
      )}

      {/* 📱 WhatsApp QR Setup Modal */}
      {showQRModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)',
          backdropFilter: 'blur(8px)', zIndex: 99998,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowQRModal(false)}>
          <div style={{
            background: '#fff', borderRadius: '24px', padding: '40px',
            maxWidth: '420px', width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📱</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>
              Connect WhatsApp
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
              Scan this QR code with your <strong>WhatsApp</strong> once. After that, invoices will send <strong>automatically</strong> — no popups, no clicks!
            </p>

            {waQR ? (
              <div>
                <img src={waQR} alt="WhatsApp QR Code"
                  style={{ width: '240px', height: '240px', borderRadius: '12px', border: '2px solid #e2e8f0' }} />
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
                  Open WhatsApp → ⋮ Menu → Linked Devices → Link a Device
                </p>
                <div style={{
                  marginTop: '16px', padding: '10px 16px', background: '#fef9c3',
                  borderRadius: '10px', fontSize: '12px', color: '#854d0e', fontWeight: '600'
                }}>
                  ⏳ Waiting for you to scan... Auto-updates every 4s
                </div>
              </div>
            ) : waReady ? (
              <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '12px' }}>
                <div style={{ fontSize: '48px' }}>✅</div>
                <p style={{ fontWeight: '700', color: '#16a34a', margin: '8px 0 0' }}>WhatsApp Connected!</p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Invoices will now send automatically.</p>
              </div>
            ) : (
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Generating QR Code...<br/>Please wait a moment.</p>
              </div>
            )}

            <button onClick={() => setShowQRModal(false)} style={{
              marginTop: '24px', padding: '12px 32px', background: '#f1f5f9',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontWeight: '700', color: '#64748b', fontSize: '14px'
            }}>Close</button>
          </div>
        </div>
      )}

      {/* Hidden Professional Invoice for PDF Export */}
      <div ref={invoiceRef} style={{ display: 'none', fontFamily: 'Arial, sans-serif', width: '794px', background: '#fff', color: '#1e293b' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #008080, #006060)', padding: '36px 40px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>🏥 SevaFlow</div>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px', fontWeight: '500' }}>Clinical Network — Digital Health Records</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '2px' }}>INVOICE</div>
              <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>Invoice ID: {invoiceRef.current?.dataset?.invoiceId || 'SF-XXXX'}</div>
              <div style={{ fontSize: '13px', opacity: 0.85 }}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div style={{ padding: '28px 40px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '48px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Billed To</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{patientInfo.name}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>📞 +91 {patientInfo.phone}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Clinic</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>SevaFlow Clinical Network</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>GST Registered | Digital Records</div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ padding: '28px 40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '8px 0 0 8px' }}>Description</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Details</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '0 8px 8px 0' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{item.desc}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>{item.sub}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#1e293b', textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '260px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                <span>GST (18%)</span><span>₹{gst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'linear-gradient(135deg, #008080, #006060)', color: '#fff', borderRadius: '10px', marginTop: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '800' }}>Grand Total</span>
                <span style={{ fontSize: '18px', fontWeight: '900' }}>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 40px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Generated by SevaFlow Intelligence Platform • {new Date().toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '11px', color: '#008080', fontWeight: '700' }}>✅ GST Compliant • Digital Record Saved</div>
        </div>
      </div>

      <div className="billing-grid">
        <div className="builder-column">
          {/* Header Banner */}
          <div className="billing-card-shell billing-top-banner">
            <div className="banner-left">
              <h2>One-Click Billing</h2>
              <div className="active-patient-chip">
                <div className="status-dot"></div>
                <span>Active Patient: <strong>{patientInfo.name}</strong></span>
              </div>
            </div>
            <div className="banner-right">
              <span className="billing-badge id">ID: SF-9842</span>
              <span className="billing-badge gst">GST Active</span>
            </div>
          </div>

          {/* Items List */}
          <div className="billing-card-shell items-list-container">
            <div className="items-header">
              <h3>Billable Items</h3>
            </div>
            <div className="items-list">
              <AnimatePresence initial={false}>
                {items.map(item => {
                  const isEditing = item.id === editingItemId;
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id} 
                      className={`item-row-bento ${isEditing ? 'editing' : ''}`}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', flex: 1, gap: '12px', alignItems: 'center' }}>
                          <div className={`item-icon-box ${item.type === 'med' ? 'med' : ''}`}>
                            {item.type === 'med' ? <Pill size={20} /> : <FileText size={20} />}
                          </div>
                          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '6px' }}>
                            <input 
                              type="text" 
                              value={editDesc} 
                              onChange={e => setEditDesc(e.target.value)}
                              placeholder="Item Name"
                              style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 700, borderRadius: '8px', border: '1px solid var(--outline)', outline: 'none', background: '#ffffff', width: '90%' }}
                            />
                            <input 
                              type="text" 
                              value={editSub} 
                              onChange={e => setEditSub(e.target.value)}
                              placeholder="Details / Specifications"
                              style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '8px', border: '1px solid var(--outline)', outline: 'none', background: '#ffffff', width: '90%' }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <span style={{ position: 'absolute', left: '10px', fontSize: '13px', fontWeight: 700, color: '#64748b' }}>₹</span>
                              <input 
                                type="number" 
                                value={editPrice} 
                                onChange={e => setEditPrice(e.target.value)}
                                placeholder="Price"
                                style={{ padding: '6px 8px 6px 20px', fontSize: '13px', fontWeight: 700, borderRadius: '8px', border: '1px solid var(--outline)', outline: 'none', background: '#ffffff', width: '80px', textAlign: 'right' }}
                              />
                            </div>
                            <div className="row-action-btns">
                              <button onClick={() => saveEdit(item.id)} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}><CheckCircle size={16} /></button>
                              <button onClick={cancelEdit} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="item-identity">
                            <div className={`item-icon-box ${item.type === 'med' ? 'med' : ''}`}>
                              {item.type === 'med' ? <Pill size={20} /> : <FileText size={20} />}
                            </div>
                            <div className="item-details">
                              <h4>{item.desc}</h4>
                              <p>{item.sub}</p>
                            </div>
                          </div>
                          <div className="item-actions-group">
                            <span className="item-price">₹{item.price.toFixed(2)}</span>
                            <div className="row-action-btns">
                              <button onClick={() => startEditing(item)} style={{ cursor: 'pointer' }}><Edit3 size={16} /></button>
                              <button onClick={() => deleteItem(item.id)} style={{ cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Add Item Form */}
          <div className="add-service-bento">
            <h3>Add Service or Product</h3>
            <form className="add-item-form-grid" onSubmit={addItem}>
              <div className="input-field-group">
                <label>Service Name</label>
                <input name="desc" placeholder="Enter service or medicine name..." required />
              </div>
              <div className="input-field-group">
                <label>Price (₹)</label>
                <input name="price" type="number" placeholder="0.00" required />
              </div>
              <button type="submit" className="add-btn-primary">
                <Plus size={18} /> Add
              </button>
            </form>
          </div>

          {/* Summary Section */}
          <div className="billing-card-shell summary-bento-card">
            <div className="summary-rows-container">
              <div className="summary-item-row">
                <span className="label">Subtotal</span>
                <span className="value">₹{total.toFixed(2)}</span>
              </div>
              <div className="summary-item-row">
                <span className="label">GST (18%)</span>
                <span className="value">₹{gst.toFixed(2)}</span>
              </div>
              <div className="grand-total-row">
                <span>Grand Total</span>
                <span className="total-value">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-column">
          {/* Quick Actions Card */}
          <div className="sidebar-action-card">
            <h3><Bolt size={20} color="var(--primary)" /> Quick Actions</h3>
            <div className="contact-input-field">
              <label>Recipient Phone</label>
              <div className="phone-input-wrapper">
                <div className="phone-prefix">+91</div>
                <input 
                  type="text" 
                  value={patientInfo.phone} 
                  onChange={e => setPatientInfo({...patientInfo, phone: e.target.value})}
                />
              </div>
            </div>

            <button 
              className={`wa-send-btn ${sending ? 'working' : ''}`}
              onClick={handleSendInvoice}
              disabled={sending}
            >
              {sending ? (
                <><RefreshCw size={20} className="spinning" /><span>Sending...</span></>
              ) : sent ? (
                <><CheckCircle size={20} /><span>Sent! ✅</span></>
              ) : (
                <>
                  <MessageCircle size={20} />
                  <span>{waReady ? 'Send WhatsApp Invoice' : 'Setup WhatsApp First'}</span>
                </>
              )}
            </button>

            {/* WA Connection Status Pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', borderRadius: '20px', marginTop: '4px',
              background: waReady ? 'rgba(16,185,129,0.1)' : 'rgba(251,191,36,0.1)',
              border: `1px solid ${waReady ? 'rgba(16,185,129,0.3)' : 'rgba(251,191,36,0.3)'}`,
              cursor: waReady ? 'default' : 'pointer'
            }} onClick={() => !waReady && setShowQRModal(true)}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: waReady ? '#10b981' : '#f59e0b',
                boxShadow: waReady ? '0 0 6px #10b981' : '0 0 6px #f59e0b'
              }} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: waReady ? '#10b981' : '#b45309' }}>
                {waReady ? 'WhatsApp Connected' : 'Click to Connect WhatsApp'}
              </span>
            </div>

            <div className="secondary-action-grid">
              <button className="sq-action-btn" onClick={downloadPDF} disabled={generating}>
                <Download size={24} />
                <span>PDF</span>
              </button>
              <button className="sq-action-btn" onClick={() => window.print()}>
                <Printer size={24} />
                <span>Print</span>
              </button>
            </div>

            <div className="trust-signals-stack">
              <div className="trust-item">
                <div className="icon-circle"><ShieldCheck size={14} /></div>
                <span>GST Compliant</span>
              </div>
              <div className="trust-item">
                <div className="icon-circle"><CloudLightning size={14} /></div>
                <span>Digital Record Saved</span>
              </div>
            </div>
          </div>

          {/* Doctor Note Banner */}
          <div className="doctor-note-banner">
            <div className="note-content">
              <h4>Doctor's Note</h4>
              <p>Ensure patient follows the 5-day course for Levocetirizine. Billing includes follow-up within 7 days.</p>
            </div>
            <Lightbulb size={32} className="note-bg-icon" />
          </div>

          {/* Mini Stats Card */}
          <div className="revenue-stat-card">
            <div className="rev-header">
              <h4>Today's Revenue</h4>
              <span className="trend" style={{ color: stats.revenue > 0 ? '#10b981' : '#94a3b8' }}>
                {stats.revenue > 0 ? 'Active' : 'No Sales'}
              </span>
            </div>
            <div className="rev-value-row">
              <span className="value">₹{stats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="count">from {stats.count} bills</span>
            </div>
            <div className="rev-progress-track">
              <div className="rev-progress-bar" style={{ width: `${Math.min(100, (stats.revenue / 20000) * 100)}%` }}></div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spinning { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spinning 1s linear infinite; }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

// Simple Pill icon shim if not found in lucide
const Pill = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>
);

export default Billing;
