import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Share2, 
  Sparkles, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';

export default function AnalyticsView({ leads }) {
  const total = leads.length || 1;

  // Pipeline count
  const statusCounts = {
    'New': leads.filter(l => l.status === 'New').length,
    'Contacted': leads.filter(l => l.status === 'Contacted').length,
    'Site Visit Scheduled': leads.filter(l => l.status === 'Site Visit Scheduled').length,
    'Negotiation': leads.filter(l => l.status === 'Negotiation').length,
    'Converted': leads.filter(l => l.status === 'Converted').length,
    'Lost': leads.filter(l => l.status === 'Lost').length,
  };

  // Source count
  const sourceCounts = leads.reduce((acc, lead) => {
    const s = lead.source || 'Website';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Method count
  const methodCounts = leads.reduce((acc, lead) => {
    const m = lead.preferredMethod || 'Phone';
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="analytics-grid">
      {/* 1. Sales Pipeline Stage Distribution */}
      <div className="chart-card">
        <div className="chart-card-title">
          <Layers size={18} className="text-cyan-400" />
          <span>Sales Conversion Funnel</span>
        </div>

        <div className="progress-bar-container">
          <div className="progress-item">
            <div className="progress-meta">
              <span>1. New Inquiries</span>
              <strong>{statusCounts['New']} ({Math.round((statusCounts['New'] / total) * 100)}%)</strong>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${(statusCounts['New'] / total) * 100}%`, background: '#60a5fa' }} 
              />
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-meta">
              <span>2. Contacted &amp; Qualified</span>
              <strong>{statusCounts['Contacted']} ({Math.round((statusCounts['Contacted'] / total) * 100)}%)</strong>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${(statusCounts['Contacted'] / total) * 100}%`, background: '#fbbf24' }} 
              />
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-meta">
              <span>3. Site Visits Scheduled</span>
              <strong>{statusCounts['Site Visit Scheduled']} ({Math.round((statusCounts['Site Visit Scheduled'] / total) * 100)}%)</strong>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${(statusCounts['Site Visit Scheduled'] / total) * 100}%`, background: '#c084fc' }} 
              />
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-meta">
              <span>4. Price Negotiation</span>
              <strong>{statusCounts['Negotiation']} ({Math.round((statusCounts['Negotiation'] / total) * 100)}%)</strong>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${(statusCounts['Negotiation'] / total) * 100}%`, background: '#2dd4bf' }} 
              />
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-meta">
              <span>5. Booked / Converted</span>
              <strong>{statusCounts['Converted']} ({Math.round((statusCounts['Converted'] / total) * 100)}%)</strong>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${(statusCounts['Converted'] / total) * 100}%`, background: '#34d399' }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Acquisition Source Distribution */}
      <div className="chart-card">
        <div className="chart-card-title">
          <Share2 size={18} className="text-amber-400" />
          <span>Lead Acquisition Channels</span>
        </div>

        <div className="progress-bar-container">
          {Object.entries(sourceCounts).map(([source, count], idx) => {
            const colors = ['#2dd4bf', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6'];
            const color = colors[idx % colors.length];
            const pct = Math.round((count / total) * 100);

            return (
              <div className="progress-item" key={source}>
                <div className="progress-meta">
                  <span>{source}</span>
                  <strong>{count} leads ({pct}%)</strong>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${pct}%`, background: color }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Communication Channel Preference */}
      <div className="chart-card">
        <div className="chart-card-title">
          <PieChart size={18} className="text-emerald-400" />
          <span>Client Contact Preference</span>
        </div>

        <div className="progress-bar-container">
          {Object.entries(methodCounts).map(([method, count], idx) => {
            const colors = {
              'WhatsApp': '#22c55e',
              'Phone': '#3b82f6',
              'Email': '#eab308'
            };
            const color = colors[method] || '#94a3b8';
            const pct = Math.round((count / total) * 100);

            return (
              <div className="progress-item" key={method}>
                <div className="progress-meta">
                  <span>{method}</span>
                  <strong>{count} ({pct}%)</strong>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${pct}%`, background: color }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 'auto', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: '#0f172a' }}>Advisory Desk Tip:</strong> WhatsApp leads respond 3x faster than traditional phone cold calls. Use the one-click WhatsApp action in the Leads table to initiate follow-ups.
        </div>
      </div>
    </div>
  );
}
