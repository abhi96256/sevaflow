import React, { useState, useEffect } from 'react';
import { 
  BarChart2, TrendingUp, IndianRupee, CreditCard, ArrowUpRight, 
  Clock, Download, Calendar, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Revenue.css';

const revenueData = [
  { month: 'Jan', saas: 12000, clinics: 4 },
  { month: 'Feb', saas: 24000, clinics: 8 },
  { month: 'Mar', saas: 45000, clinics: 14 },
  { month: 'Apr', saas: 78000, clinics: 24 },
  { month: 'May', saas: 95000, clinics: 28 },
  { month: 'Jun', saas: 130000, clinics: 35 },
];

const payouts = [
  { id: 'TXN-001', clinic: 'Seva Clinics', plan: 'Pro', amount: 4999, date: '2026-04-01', status: 'Received' },
  { id: 'TXN-002', clinic: 'City Heart Center', plan: 'Enterprise', amount: 9999, date: '2026-04-03', status: 'Received' },
  { id: 'TXN-003', clinic: 'Wellness Pathlab', plan: 'Basic', amount: 1999, date: '2026-04-15', status: 'Pending' },
  { id: 'TXN-004', clinic: 'Aman Hospital', plan: 'Pro', amount: 4999, date: '2026-04-20', status: 'Received' },
  { id: 'TXN-005', clinic: 'MedPlus Clinic', plan: 'Pro', amount: 4999, date: '2026-04-24', status: 'Pending' },
];

const Revenue = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');

  const totalRevenue = payouts.filter(p => p.status === 'Received').reduce((s, p) => s + p.amount, 0);
  const pendingRevenue = payouts.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="revenue-page">
      <div className="rev-page-header">
        <div>
          <h2>Revenue & Payouts</h2>
          <p>Track your SaaS earnings across all clinics</p>
        </div>
        <div className="rev-header-actions">
          <select className="period-select" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
            <option>Monthly</option>
            <option>Quarterly</option>
            <option>Yearly</option>
          </select>
          <button className="sa-btn-primary"><Download size={18} /> Export CSV</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="rev-cards-grid">
        <div className="rev-card sa-glass grad-border-green">
          <div className="rev-card-icon"><IndianRupee size={22} /></div>
          <div className="rev-card-info">
            <span>Total Collected</span>
            <h3>₹{totalRevenue.toLocaleString()}</h3>
            <p className="trend-up"><TrendingUp size={14} /> +22% vs last month</p>
          </div>
        </div>
        <div className="rev-card sa-glass grad-border-yellow">
          <div className="rev-card-icon pending-icon"><Clock size={22} /></div>
          <div className="rev-card-info">
            <span>Pending Collection</span>
            <h3>₹{pendingRevenue.toLocaleString()}</h3>
            <p>From {payouts.filter(p => p.status === 'Pending').length} clinics</p>
          </div>
        </div>
        <div className="rev-card sa-glass grad-border-blue">
          <div className="rev-card-icon subscription-icon"><CreditCard size={22} /></div>
          <div className="rev-card-info">
            <span>Active Subscriptions</span>
            <h3>{payouts.length}</h3>
            <p>3 Pro • 1 Enterprise • 1 Basic</p>
          </div>
        </div>
        <div className="rev-card sa-glass grad-border-purple">
          <div className="rev-card-icon growth-icon"><BarChart2 size={22} /></div>
          <div className="rev-card-info">
            <span>MRR (Monthly Recurring)</span>
            <h3>₹26,995</h3>
            <p className="trend-up"><ArrowUpRight size={14} /> Growing 18%/mo</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="rev-charts-grid">
        <div className="rev-chart-panel sa-glass">
          <div className="panel-header">
            <h3>Revenue Growth</h3>
            <span className="sub-label">Last 6 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff' }}
                formatter={v => [`₹${v.toLocaleString()}`, 'SaaS Revenue']}
              />
              <Area type="monotone" dataKey="saas" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rev-chart-panel sa-glass">
          <div className="panel-header">
            <h3>Clinic Onboardings</h3>
            <span className="sub-label">Per Month</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff' }} />
              <Bar dataKey="clinics" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions */}
      <div className="rev-transactions sa-glass">
        <div className="panel-header">
          <h3>Subscription Transactions</h3>
          <button className="sa-link">View All</button>
        </div>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Clinic</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id}>
                <td><code style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{p.id}</code></td>
                <td><strong>{p.clinic}</strong></td>
                <td><span className="plan-badge">{p.plan}</span></td>
                <td><strong style={{ color: '#10b981' }}>₹{p.amount.toLocaleString()}</strong></td>
                <td>{p.date}</td>
                <td>
                  <span className={`status-tag-rev ${p.status.toLowerCase()}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Revenue;
