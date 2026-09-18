import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  Award,
  Clock,
  Target
} from 'lucide-react';
import EmployeeLeadsQueue from './EmployeeLeadsQueue';
import EmployeeActivityHistory from './EmployeeActivityHistory';
import LogCallModal from './LogCallModal';
import SendEmailModal from './SendEmailModal';
import LeadDetailDrawer from '../LeadDetailDrawer';

export default function EmployeeDashboard({ 
  currentUser, 
  leads, 
  callLogs, 
  emailLogs, 
  onRefresh 
}) {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'history'
  const [activeCallLead, setActiveCallLead] = useState(null);
  const [activeEmailLead, setActiveEmailLead] = useState(null);
  const [selectedDrawerLead, setSelectedDrawerLead] = useState(null);

  // My stats
  const myCalls = callLogs.filter(c => c.employeeId === currentUser.id);
  const myEmails = emailLogs.filter(m => m.employeeId === currentUser.id);
  const myLeads = leads.filter(l => l.assignedToId === currentUser.id);
  const mySiteVisits = myLeads.filter(l => l.status === 'Site Visit Scheduled');

  const callTarget = currentUser.dailyCallTarget || 30;
  const emailTarget = currentUser.dailyEmailTarget || 20;

  const callProgressPct = Math.min(100, Math.round((myCalls.length / callTarget) * 100));
  const emailProgressPct = Math.min(100, Math.round((myEmails.length / emailTarget) * 100));

  return (
    <div className="flex flex-col gap-6">
      {/* Top Welcome Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #fffbeb 100%)',
          border: '1px solid #ccfbf1',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            Welcome back, {currentUser.name} {currentUser.avatar || '💼'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {currentUser.designation} • {currentUser.department}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className={`nav-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
            style={{ background: activeTab === 'queue' ? 'var(--bg-surface-elevated)' : 'transparent' }}
          >
            <Users size={16} />
            <span>Outreach Desk</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{ background: activeTab === 'history' ? 'var(--bg-surface-elevated)' : 'transparent' }}
          >
            <Clock size={16} />
            <span>My Activity History</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        {/* Calls Done vs Target */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <PhoneCall size={24} />
          </div>
          <div className="stat-info" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Calls Done Today</span>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>{callProgressPct}% Target</span>
            </div>
            <span className="stat-value">{myCalls.length} / {callTarget}</span>
            <div className="progress-track" style={{ marginTop: '0.35rem', height: '6px' }}>
              <div className="progress-fill" style={{ width: `${callProgressPct}%`, background: '#34d399' }} />
            </div>
          </div>
        </div>

        {/* Emails Dispatched vs Target */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#fbbf24' }}>
            <Mail size={24} />
          </div>
          <div className="stat-info" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">Mails Sent Today</span>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>{emailProgressPct}% Target</span>
            </div>
            <span className="stat-value">{myEmails.length} / {emailTarget}</span>
            <div className="progress-track" style={{ marginTop: '0.35rem', height: '6px' }}>
              <div className="progress-fill" style={{ width: `${emailProgressPct}%`, background: '#fbbf24' }} />
            </div>
          </div>
        </div>

        {/* My Active Leads */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Assigned Prospects</span>
            <span className="stat-value">{myLeads.length}</span>
            <span className="stat-trend positive">
              <Target size={12} />
              <span>In Your Pipeline</span>
            </span>
          </div>
        </div>

        {/* Site Visits Scheduled */}
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#c084fc' }}>
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Site Visits Scheduled</span>
            <span className="stat-value">{mySiteVisits.length}</span>
            <span className="stat-trend positive">
              <span>Township Walkthroughs</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab View */}
      {activeTab === 'queue' ? (
        <EmployeeLeadsQueue
          leads={leads}
          currentUser={currentUser}
          onLogCall={(lead) => setActiveCallLead(lead)}
          onSendEmail={(lead) => setActiveEmailLead(lead)}
          onSelectLead={(lead) => setSelectedDrawerLead(lead)}
          onRefresh={onRefresh}
        />
      ) : (
        <EmployeeActivityHistory
          currentUser={currentUser}
          callLogs={callLogs}
          emailLogs={emailLogs}
        />
      )}

      {/* Modals */}
      <LogCallModal
        lead={activeCallLead}
        currentUser={currentUser}
        onClose={() => setActiveCallLead(null)}
        onSuccess={onRefresh}
      />

      <SendEmailModal
        lead={activeEmailLead}
        currentUser={currentUser}
        onClose={() => setActiveEmailLead(null)}
        onSuccess={onRefresh}
      />

      <LeadDetailDrawer
        lead={selectedDrawerLead}
        onClose={() => setSelectedDrawerLead(null)}
        onRefresh={onRefresh}
      />
    </div>
  );
}
