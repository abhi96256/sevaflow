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
  Plus
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import './Billing.css';

const Billing = ({ language }) => {
  const [items, setItems] = useState([]);
  const [patientInfo, setPatientInfo] = useState({ name: 'Abhishek Kumar', phone: '9876543210' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const invoiceRef = useRef(null);

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

  const handleSendInvoice = () => {
    if (!patientInfo.phone) {
      alert('Patient phone number missing!');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    }, 2000);
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
      setItems([...items, { id: Date.now(), desc, sub: 'Direct Addition', price, type: 'service' }]);
      e.target.reset();
    }
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="billing-wrapper">
      {/* Hidden Invoice for Export */}
      <div className="hidden-invoice-container" ref={invoiceRef} style={{ display: 'none' }}>
        <div style={{ padding: '40px', background: 'white' }}>
          <h1>INVOICE</h1>
          <p>SevaFlow Clinical Network</p>
          <hr />
          <p><strong>Patient:</strong> {patientInfo.name}</p>
          <p><strong>Phone:</strong> {patientInfo.phone}</p>
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th align="left" style={{ padding: '10px' }}>Description</th>
                <th align="right" style={{ padding: '10px' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{i.desc}</td>
                  <td align="right" style={{ padding: '10px' }}>₹{i.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '30px', textAlign: 'right' }}>
            <p>Subtotal: ₹{total.toFixed(2)}</p>
            <p>GST (18%): ₹{gst.toFixed(2)}</p>
            <h3>Grand Total: ₹{grandTotal.toFixed(2)}</h3>
          </div>
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
                {items.map(item => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={item.id} 
                    className="item-row-bento"
                  >
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
                        <button><Edit3 size={16} /></button>
                        <button onClick={() => deleteItem(item.id)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                <RefreshCw size={20} className="spinning" />
              ) : sent ? (
                <CheckCircle size={20} />
              ) : (
                <>
                  <MessageCircle size={20} />
                  <span>Send WhatsApp Invoice</span>
                </>
              )}
            </button>

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
              <span className="trend">+12%</span>
            </div>
            <div className="rev-value-row">
              <span className="value">₹42,850</span>
              <span className="count">from 18 bills</span>
            </div>
            <div className="rev-progress-track">
              <div className="rev-progress-bar" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spinning { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinning { animation: spinning 1s linear infinite; }
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
