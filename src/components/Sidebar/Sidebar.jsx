import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Brain, 
  FileText, 
  Video, 
  Receipt, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut,
  Stethoscope,
  Pill,
  Zap,
  Sparkles
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ language }) => {
  const coreItems = [
    { id: '', icon: LayoutDashboard, label: { en: 'Dashboard', hi: 'डैशबोर्ड' } },
    { id: 'patients', icon: Users, label: { en: 'Patients', hi: 'मरीज' } },
    { id: 'intelligence', icon: Brain, label: { en: 'AI Intelligence', hi: 'AI बुद्धिमत्ता' } },
    { id: 'prescription', icon: FileText, label: { en: 'Prescription', hi: 'डिजिटल पर्चा' } },
  ];

  const operationsItems = [
    { id: 'billing', icon: Receipt, label: { en: 'Billing & GST', hi: 'बिलिंग' } },
    { id: 'inventory', icon: Package, label: { en: 'Inventory', hi: 'स्टॉक' } },
    { id: 'analytics', icon: BarChart3, label: { en: 'Analytics', hi: 'विश्लेषण' } },
    { id: 'ai-hub', icon: Zap, label: { en: 'AI Innovation Hub', hi: 'AI लैब' } },
    { id: 'pharmacy', icon: Pill, label: { en: 'Pharmacy', hi: 'फार्मेसी' } },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Area */}
      <div className="brand-container">
        <div className="brand-box">
          <div className="brand-logo-icon">
            <Stethoscope size={22} />
          </div>
          <div className="brand-text">
            <h1>SevaFlow</h1>
            <p>Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <div className="nav-scroll-area">
        {/* Group: Core */}
        <section className="nav-group">
          <p className="nav-group-label">Core</p>
          <nav>
            {coreItems.map((item) => (
              <NavLink
                key={item.id}
                to={`/${item.id}`}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end={item.id === ''}
              >
                <item.icon size={20} />
                <span>{item.label[language] || item.label.en}</span>
              </NavLink>
            ))}
          </nav>
        </section>

        {/* Group: Operations */}
        <section className="nav-group">
          <p className="nav-group-label">Operations</p>
          <nav>
            {operationsItems.map((item) => (
              <NavLink
                key={item.id}
                to={`/${item.id}`}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label[language] || item.label.en}</span>
              </NavLink>
            ))}
          </nav>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="sidebar-footer">
        <button className="footer-link">
          <Settings size={20} />
          <span>{language === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
        </button>
        <button className="footer-link logout" onClick={() => {
          if (window.confirm('Logout from SevaFlow?')) {
            localStorage.removeItem('clinicUser');
            window.location.href = '/login';
          }
        }}>
          <LogOut size={20} />
          <span>{language === 'hi' ? 'लॉगआउट' : 'Log out'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
