import React from 'react';
import { 
  Building2, 
  ExternalLink, 
  Plus, 
  Download, 
  RefreshCw, 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  PhoneCall, 
  Mail, 
  LogOut,
  UserCheck,
  ShieldCheck,
  Briefcase,
  Globe,
  Clock
} from 'lucide-react';
import { exportLeadsToCSV } from '../services/leadStorage';

export default function Header({ 
  currentUser, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  onOpenAddModal, 
  leads 
}) {
  const isAdmin = currentUser && currentUser.role === 'admin';

  const handleExport = () => {
    exportLeadsToCSV(leads);
  };

  return (
    <header className="admin-navbar">
      {/* Brand */}
      <div className="nav-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/sanghicity-icon.png"
            alt="Sanghi City Logo"
            style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' }}
          />
          <div>
            <div className="brand-title">
              SANGHI CITY
              <span className={`brand-badge ${isAdmin ? 'admin-badge' : 'emp-badge'}`}>
                {isAdmin ? 'EXECUTIVE ADMIN' : 'STAFF CRM'}
              </span>
            </div>
            <div className="brand-subtitle">Sanghi City Lead Management &amp; Calling CRM</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Admin vs Employee) */}
      <div className="nav-tabs">
        {isAdmin ? (
          <>
            <button
              className={`nav-tab-btn ${activeTab === 'dashboard' || activeTab === 'overview' || activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={15} />
              <span>Executive Dashboard</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'leads' || activeTab === 'calls' || activeTab === 'emails' ? 'active' : ''}`}
              onClick={() => setActiveTab('leads')}
            >
              <Users size={15} />
              <span>Leads &amp; Activities</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => setActiveTab('employees')}
            >
              <UserCheck size={15} />
              <span>Staff &amp; Credentials</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'monitoring' || activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('monitoring')}
            >
              <Clock size={15} />
              <span>Time &amp; Activity</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'cms' ? 'active' : ''}`}
              onClick={() => setActiveTab('cms')}
            >
              <Globe size={15} />
              <span>Website CMS</span>
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-tab-btn ${activeTab === 'desk' ? 'active' : ''}`}
              onClick={() => setActiveTab('desk')}
            >
              <Briefcase size={15} />
              <span>Calling &amp; Outreach Desk</span>
            </button>
          </>
        )}
      </div>

      {/* Right Tools & Profile */}
      <div className="nav-actions">
        <div className="live-indicator" title="Connected in real-time to Landing Page">
          <span className="live-dot"></span>
          <span>Live Sync</span>
        </div>

        {isAdmin && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleExport}
            title="Export all leads to CSV / Excel"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        )}

        <button 
          className="btn btn-primary btn-sm"
          onClick={onOpenAddModal}
        >
          <Plus size={15} />
          <span>New Lead</span>
        </button>

        <a 
          href="https://www.sanghicity.in" 
          target="_blank" 
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          title="Open Landing Page in new tab"
        >
          <span>View Site</span>
          <ExternalLink size={13} />
        </a>

        {/* User Profile Pill & Logout */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.3rem 0.65rem',
            background: '#f1f5f9',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.name || 'User'} 
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} 
            />
          ) : (
            <span style={{ fontSize: '1.2rem' }}>{currentUser.avatar || '💼'}</span>
          )}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {currentUser.role === 'admin' ? 'Super Admin' : currentUser.designation}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-secondary btn-icon btn-sm"
            style={{ marginLeft: '0.25rem', color: '#f87171' }}
            title="Sign out of CRM"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
