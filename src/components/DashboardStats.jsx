import React from 'react';
import { 
  Users, 
  Sparkles, 
  CalendarCheck, 
  CheckCircle2, 
  TrendingUp, 
  Clock 
} from 'lucide-react';

export default function DashboardStats({ leads }) {
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const siteVisits = leads.filter(l => l.status === 'Site Visit Scheduled').length;
  const inNegotiation = leads.filter(l => l.status === 'Negotiation').length;
  const converted = leads.filter(l => l.status === 'Converted').length;

  const conversionRate = totalLeads > 0 
    ? Math.round(((converted + siteVisits) / totalLeads) * 100) 
    : 0;

  return (
    <div className="stats-grid">
      {/* Total Enquiries */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
          <Users size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Total Prospects</span>
          <span className="stat-value">{totalLeads}</span>
          <span className="stat-trend positive">
            <TrendingUp size={12} />
            <span>Active Real Estate Pipeline</span>
          </span>
        </div>
      </div>

      {/* New Enquiries */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(45, 212, 191, 0.15)', color: '#2dd4bf' }}>
          <Sparkles size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">New Enquiries</span>
          <span className="stat-value">{newLeads}</span>
          <span className="stat-trend" style={{ color: newLeads > 0 ? '#fbbf24' : '#94a3b8' }}>
            <Clock size={12} />
            <span>{newLeads > 0 ? 'Requires immediate callback' : 'All leads contacted'}</span>
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
          <span className="stat-value">{siteVisits}</span>
          <span className="stat-trend positive">
            <TrendingUp size={12} />
            <span>Villa Township Walkthroughs</span>
          </span>
        </div>
      </div>

      {/* Converted / Deals in Closing */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
          <CheckCircle2 size={24} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Converted / Won</span>
          <span className="stat-value">{converted}</span>
          <span className="stat-trend positive">
            <span>{conversionRate}% qualified engagement</span>
          </span>
        </div>
      </div>
    </div>
  );
}
