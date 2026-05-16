import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Clock, TrendingUp, Search, Plus, ExternalLink, Loader2, MapPin, Building2, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './PharmacyLink.css';

const PharmacyLink = ({ language }) => {
  const [pharmacies, setPharmacies] = useState([
    { id: 1, name: "City Medical Store", distance: "0.5 km", status: "Active", linkRate: 12, sending: false },
    { id: 2, name: "Sanjivani Pharmacy", distance: "1.2 km", status: "Active", linkRate: 10, sending: false },
    { id: 3, name: "Appolo Pharmacy", distance: "2.5 km", status: "Busy", linkRate: 15, sending: false },
  ]);

  const [orders, setOrders] = useState([
    { id: 421, patient: "Rahul Verma", status: "Pending", time: "2 mins ago" },
    { id: 420, patient: "Amit Singh", status: "Delivered", time: "1 hour ago" },
    { id: 419, patient: "Priya Sharma", status: "Delivered", time: "3 hours ago" },
  ]);

  const [earnings, setEarnings] = useState(4500);

  const handleSend = (pharmaId) => {
    setPharmacies(prev => prev.map(p => p.id === pharmaId ? { ...p, sending: true } : p));

    setTimeout(() => {
      const pharma = pharmacies.find(p => p.id === pharmaId);
      const newOrderId = Math.floor(Math.random() * 900) + 500;
      
      const newOrder = {
        id: newOrderId,
        patient: "Abhishek Kumar",
        status: "Pending",
        time: "Just now",
        commission: (500 * pharma.linkRate) / 100
      };

      setOrders(prev => [newOrder, ...prev]);
      setPharmacies(prev => prev.map(p => p.id === pharmaId ? { ...p, sending: false } : p));

      setTimeout(() => {
        setOrders(prev => prev.map(o => o.id === newOrderId ? { ...o, status: "Delivered" } : o));
        setEarnings(prev => prev + newOrder.commission);
      }, 4000);

    }, 1500);
  };

  return (
    <div className="pharmacy-wrapper">
      <div className="pharma-header-section">
        <div className="header-titles">
          <h2>{language === 'hi' ? 'फार्मेसी नेटवर्क' : 'Pharmacy Network'}</h2>
          <p>Connect with local pharmacies to fulfill prescriptions instantly.</p>
        </div>
        <div className="earnings-card">
          <div className="earn-icon"><TrendingUp size={24} /></div>
          <div className="earn-info">
            <span className="label">Total Commission</span>
            <div className="value-group">
              <span className="value">₹{earnings.toLocaleString()}</span>
              <span className="trend">+12.5%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pharmacy-grid">
        <div className="pharma-main-list">
          <div className="list-top">
            <h3>Nearby Partners</h3>
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search pharmacy..." />
            </div>
          </div>
          
          <div className="pharma-list">
            {pharmacies.map(pharma => (
              <div key={pharma.id} className="pharma-card-bento">
                <div className="pharma-identity">
                  <div className="pharma-icon-box">
                    <Building2 size={24} />
                  </div>
                  <div className="pharma-details">
                    <h4>{pharma.name}</h4>
                    <div className="meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {pharma.distance}
                      </span>
                      <span className="dot">•</span>
                      <span className="rate-badge">{pharma.linkRate}% commission</span>
                    </div>
                  </div>
                </div>
                
                <div className="pharma-actions">
                  <span className={`status-label ${pharma.status.toLowerCase()}`}>
                    {pharma.status}
                  </span>
                  <button 
                    className="send-prescription-btn"
                    onClick={() => handleSend(pharma.id)}
                    disabled={pharma.sending || pharma.status === 'Busy'}
                  >
                    {pharma.sending ? (
                      <Loader2 size={18} className="spinning" />
                    ) : (
                      <>
                        <MousePointer2 size={18} />
                        <span>Send Prescription</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="dashed-add-btn">
            <Plus size={20} />
            <span>Add New Pharmacy to Network</span>
          </button>
        </div>

        <div className="orders-sidebar-bento">
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>Recent Orders</h3>
              <a href="#" className="view-all-link">
                View All <ExternalLink size={14} />
              </a>
            </div>
            
            <div className="orders-list-bento">
              <AnimatePresence initial={false}>
                {orders.map(order => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order.id} 
                    className={`order-row-bento ${order.status.toLowerCase()}`}
                  >
                    <div className={`order-status-icon ${order.status.toLowerCase()}`}>
                      {order.status === 'Delivered' ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Clock size={18} />
                      )}
                    </div>
                    <div className="order-info">
                      <h5>{order.patient}</h5>
                      <p>Order #{order.id} • {order.time}</p>
                    </div>
                    <div className={`status-badge-text ${order.status.toLowerCase()}`}>
                      {order.status}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div style={{ marginTop: '24px' }}>
              <div className="target-card-bento">
                <p>Monthly Target</p>
                <h4>₹12,000 / ₹15,000</h4>
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLink;
