import React from 'react';
import { 
  Users, 
  PhoneCall, 
  Mail, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Sparkles, 
  CalendarCheck,
  Building,
  UserCheck
} from 'lucide-react';

export default function AdminOverview({ leads, employees, callLogs, emailLogs, onNavigateTab }) {
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const siteVisits = leads.filter(l => l.status === 'Site Visit Scheduled').length;
  const converted = leads.filter(l => l.status === 'Converted').length;

  const totalCalls = callLogs.length;
  const totalEmails = emailLogs.length;

  // Calculate employee performance leaderboard
  const employeePerformance = employees.map(emp => {
    const callsDone = callLogs.filter(c => c.employeeId === emp.id).length;
    const emailsSent = emailLogs.filter(m => m.employeeId === emp.id).length;
    const leadsAssigned = leads.filter(l => (l.assignedToId === emp.id || l.assignedTo === emp.id)).length;
    const leadsWon = leads.filter(l => (l.assignedToId === emp.id || l.assignedTo === emp.id) && l.status === 'Converted').length;

    return {
      ...emp,
      callsDone,
      emailsSent,
      leadsAssigned,
      leadsWon,
      score: callsDone * 2 + emailsSent * 3 + leadsWon * 20
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-6">
      {/* Top 4 KPI Metrics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Prospects</span>
            <span className="stat-value">{totalLeads}</span>
            <span className="stat-trend positive">
              <TrendingUp size={12} />
              <span>Active CRM Pipeline</span>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <PhoneCall size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Staff Calls Done</span>
            <span className="stat-value">{totalCalls}</span>
            <span className="stat-trend positive">
              <TrendingUp size={12} />
              <span>Logged by Telecallers</span>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Mail size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Marketing Mails Sent</span>
            <span className="stat-value">{totalEmails}</span>
            <span className="stat-trend positive">
              <span>Brochures &amp; Pricing</span>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#faf5ff', color: '#9333ea' }}>
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Site Visits Scheduled</span>
            <span className="stat-value">{siteVisits}</span>
            <span className="stat-trend positive">
              <span>{converted} Deals Won</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Staff Leaderboard & Quick Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Employee Leaderboard Card */}
        <div className="table-card">
          <div className="table-header-meta">
            <div className="table-title">
              <Award size={18} className="text-amber-500" />
              <span>Workforce Activity Scoreboard</span>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTab('employees')}
            >
              Manage Staff
            </button>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {employeePerformance.map((emp, index) => (
                <div 
                  key={emp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontSize: '1.35rem' }}>{emp.avatar || '💼'}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                        {emp.name}
                        {index === 0 && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#b45309', background: '#fef3c7', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>★ Top Performer</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {emp.department}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>
                        {emp.callsDone} Calls
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {emp.emailsSent} Emails
                      </div>
                    </div>

                    <span className="brand-badge emp-badge" style={{ fontSize: '0.75rem' }}>
                      {emp.leadsAssigned} Leads
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Call Activity Card */}
        <div className="table-card">
          <div className="table-header-meta">
            <div className="table-title">
              <PhoneCall size={18} className="text-emerald-600" />
              <span>Latest Calls Conducted</span>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigateTab('calls')}
            >
              View All Logs
            </button>
          </div>

          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {callLogs.slice(0, 4).map(call => (
                <div 
                  key={call.id}
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                      {call.employeeName} ➔ {call.leadName}
                    </span>
                    <span className="status-badge status-contacted" style={{ fontSize: '0.7rem' }}>
                      {call.outcome}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    "{call.notes}"
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span>Duration: <strong style={{ color: '#0f172a' }}>{call.duration}</strong></span>
                    <span>{new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
