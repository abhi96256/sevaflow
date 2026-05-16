import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  IndianRupee, 
  Megaphone, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Activity
} from 'lucide-react';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, you'd clear tokens/session here
    if (window.confirm('Are you sure you want to logout from Master Admin?')) {
      navigate('/');
    }
  };

  const menuItems = [
    { path: '/super-admin', icon: LayoutDashboard, label: 'Control Center' },
    { path: '/super-admin/clinics', icon: Building2, label: 'Manage Clinics' },
    { path: '/super-admin/revenue', icon: IndianRupee, label: 'Revenue & Payouts' },
    { path: '/super-admin/broadcast', icon: Megaphone, label: 'Broadcast News' },
    { path: '/super-admin/security', icon: ShieldCheck, label: 'Security & Logs' },
  ];

  return (
    <div className="sa-layout">
      {/* SaaS Sidebar */}
      <aside className="sa-sidebar">
        <div className="sa-logo">
          <div className="logo-icon-sa">
            <Activity size={24} />
          </div>
          <div className="logo-text">
            <h2>SevaFlow</h2>
            <span>Global Controller</span>
          </div>
        </div>

        <nav className="sa-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`sa-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sa-sidebar-footer">
          <button className="sa-nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout Master</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sa-main">
        <header className="sa-header">
          <div className="header-left">
            <h3>Welcome back, Master Admin</h3>
            <p>System is running at 99.9% uptime</p>
          </div>
          <div className="header-right">
            <div className="sa-status-indicator">
              <span className="pulse-dot-green"></span> Live Server
            </div>
            <div className="sa-user-profile">
              <img src="https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff" alt="Admin" />
            </div>
          </div>
        </header>
        <div className="sa-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
