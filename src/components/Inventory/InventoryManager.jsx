import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter, AlertTriangle, TrendingDown, CheckCircle2, ShoppingCart, Calendar, History, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './InventoryManager.css';

const InventoryManager = ({ language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); 
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '', stock: '', unit: 'Strips' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory');
      setInventory(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleRefill = async (id) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/inventory/refill/${id}`);
      setInventory(prev => prev.map(item => item.id === id ? res.data : item));
    } catch (err) {
      alert("Error refilling stock");
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      const stockNum = parseInt(formData.stock);
      const status = stockNum < 20 ? 'Critical' : stockNum < 50 ? 'Low' : 'Healthy';
      const runway = stockNum < 20 ? '3 days' : stockNum < 50 ? '2 weeks' : '2 months';
      
      const payload = { ...formData, stock: stockNum, status, runway, lastOrdered: new Date().toISOString().split('T')[0] };
      const res = await axios.post('http://localhost:5000/api/inventory/add', payload);
      
      setInventory(prev => [...prev, res.data]);
      setShowAddModal(false);
      setFormData({ name: '', category: '', stock: '', unit: 'Strips' });
    } catch (err) {
      alert("Error adding medicine");
    }
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || item.status === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="loading-state"><Loader2 className="spin" /> Loading Inventory...</div>;

  return (
    <div className="inventory-page-wrapper">
      <div className="inventory-header-section">
        <div className="title-group">
          <h1>Clinic Inventory & Stock</h1>
          <p>Predictive stock management powered by AI prescriptions.</p>
        </div>
        <div className="inventory-stats">
          <div className="stat-pill critical">
            <AlertTriangle size={16} />
            <span>{inventory.filter(i => i.status === 'Critical').length} Critical Items</span>
          </div>
          <div className="stat-pill healthy">
            <CheckCircle2 size={16} />
            <span>{inventory.filter(i => i.status === 'Healthy').length} Healthy Items</span>
          </div>
        </div>
      </div>

      <div className="inventory-controls glass-panel">
        <div className="search-with-icon">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search medicine or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All">All Stocks</option>
            <option value="Critical">⚠️ Critical Only</option>
            <option value="Low">⚡ Low Stock Only</option>
            <option value="Healthy">✅ Healthy Only</option>
          </select>
          <button className="primary-btn" onClick={() => setShowAddModal(true)}><Plus size={18} /> Add Medicine</button>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="add-med-modal glass-panel"
            >
              <div className="modal-header">
                <h2>Add New medicine</h2>
                <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handleAddMedicine} className="add-med-form">
                <div className="form-group">
                  <label>Medicine Name</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Paracetamol" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <input required type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Antibiotic" />
                  </div>
                  <div className="form-group">
                    <label>Initial Stock</label>
                    <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Unit Type</label>
                  <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}>
                    <option>Strips</option>
                    <option>Tablets</option>
                    <option>Bottles</option>
                    <option>Vials</option>
                  </select>
                </div>
                <button type="submit" className="submit-btn-full">Confirm & Save</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="inventory-grid">
        <AnimatePresence mode='popLayout'>
          {filteredItems.map(item => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={item.id} 
              className={`inventory-card glass-panel ${item.status.toLowerCase()}`}
            >
              <div className="card-top">
                <div className="category-tag">{item.category}</div>
                <div className={`status-dot ${item.status.toLowerCase()}`}></div>
              </div>
              
              <div className="med-info">
                <h3>{item.name}</h3>
                <div className="stock-level-visual">
                  <div className="bar-bg">
                    <div className={`bar-fg ${item.status.toLowerCase()}`} style={{ width: item.stock > 100 ? '100%' : `${item.stock}%` }}></div>
                  </div>
                  <span className="stock-count"><strong>{item.stock}</strong> {item.unit}</span>
                </div>
              </div>

              <div className="prediction-box">
                <div className="pred-item">
                  <TrendingDown size={14} />
                  <span>AI Projection: <strong>{item.runway} left</strong></span>
                </div>
                <div className="pred-item">
                  <History size={14} />
                  <span>Last Updated: {item.lastOrdered}</span>
                </div>
              </div>

              <div className="card-actions">
                <button className="refill-btn-full" onClick={() => handleRefill(item.id)}>
                  <ShoppingCart size={16} />
                  Refill Stock (+50)
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="inventory-insights-bottom glass-panel">
        <div className="insight-icon"><TrendingDown size={20} /></div>
        <div className="insight-content">
          <h4>Smart Inventory Optimization</h4>
          <p>Based on your last 30 days of prescriptions, we suggest ordering 20 extra strips of <strong>Azithral</strong> for the upcoming week.</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
