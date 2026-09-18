import React, { useState } from 'react';
import { 
  Users, 
  PhoneCall, 
  Mail, 
  History, 
  Plus, 
  Download, 
  Filter, 
  Sparkles,
  PhoneForwarded,
  Send
} from 'lucide-react';
import LeadsMasterTable from './LeadsMasterTable';
import CallLogsView from './CallLogsView';
import EmailLogsView from './EmailLogsView';

export default function LeadsHubView({ 
  leads = [], 
  employees = [], 
  callLogs = [], 
  emailLogs = [], 
  onSelectLead, 
  onRefresh,
  initialSubTab = 'leads'
}) {
  const [subTab, setSubTab] = useState(initialSubTab); // 'leads' | 'calls' | 'emails'

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-Tabs Switcher for Leads & Activities */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          padding: '0.65rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border-subtle)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className={`btn ${subTab === 'leads' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSubTab('leads')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Users size={15} />
            <span>All Leads ({leads.length})</span>
          </button>

          <button
            className={`btn ${subTab === 'calls' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSubTab('calls')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <PhoneCall size={15} />
            <span>Calls Done ({callLogs.length})</span>
          </button>

          <button
            className={`btn ${subTab === 'emails' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSubTab('emails')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Mail size={15} />
            <span>Emails Sent ({emailLogs.length})</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.78rem' }}>
            {subTab === 'leads' ? 'Pipeline Master' : subTab === 'calls' ? 'Telecaller Audio Logs' : 'Email Outreach History'}
          </span>
        </div>
      </div>

      {/* View Content */}
      {subTab === 'leads' && (
        <LeadsMasterTable
          leads={leads}
          employees={employees}
          onSelectLead={onSelectLead}
          onRefresh={onRefresh}
        />
      )}

      {subTab === 'calls' && (
        <CallLogsView
          callLogs={callLogs}
          employees={employees}
        />
      )}

      {subTab === 'emails' && (
        <EmailLogsView
          emailLogs={emailLogs}
          employees={employees}
        />
      )}
    </div>
  );
}
