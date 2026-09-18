// Activity Log Service (Calls Completed & Emails Dispatched by Employees)

const CALL_LOGS_KEY = 'maytri_call_logs_v1';
const EMAIL_LOGS_KEY = 'maytri_email_logs_v1';
const CHANNEL_NAME = 'maytri_leads_sync_channel';

const INITIAL_CALL_LOGS = [];
const INITIAL_EMAIL_LOGS = [];

export const EMAIL_TEMPLATES = [
  {
    id: 'tpl-brochure',
    title: 'Digital Project Kit & Master Plan',
    subject: (name) => `Sanghi City Villa Township: Comprehensive Digital Kit for ${name || 'You'}`,
    body: (name, unit) => `Dear ${name || 'Sir/Madam'},

Thank you for your interest in Sanghi City, Hyderabad's premier luxury villa community near Pedda Amberpet & ORR Exit-11.

We are pleased to share the complete project digital kit:
• Township Master Plan (4.5 Acres Central Park)
• 90,000 Sq.Ft Luxury Clubhouse & 16 Amenities
• Architectural Floor Plans for 222 SQ YD & 300 SQ YD East/West Facing Villas (${unit || 'Luxury Villas'})
• Official Telangana RERA Registration: P02400007647

Please let us know your preferred date and time for an exclusive guided walkthrough.

Warm regards,
Sales & Advisory Desk
Sanghi City Township
Phone: +91 98490 12345 | Web: www.sanghicity.in`
  },
  {
    id: 'tpl-cost-sheet',
    title: 'Cost Sheet & Payment Milestone Plan',
    subject: (name) => `Official Pricing & Payment Schedule — Sanghi City`,
    body: (name, unit) => `Dear ${name || 'Valued Client'},

As requested during our discussion, here is the detailed pricing overview and payment milestone schedule for ${unit || 'Sanghi City Luxury Villas'}:

• All-inclusive pricing breakdown with base rate and clubhouse charges
• Construction linked payment milestones (10% booking advance, phased structure payments)
• Approved Home Loan Partners: SBI, HDFC Bank, ICICI Bank & Axis Bank

Our finance advisory team is available to assist you with custom payment schedules and loan pre-approvals.

Warm regards,
Sanghi City Sales Office`
  },
  {
    id: 'tpl-site-visit',
    title: 'VIP Site Visit Confirmation & Google Maps Pass',
    subject: (name) => `Confirmation: Your VIP Site Visit at Sanghi City`,
    body: (name, unit) => `Dear ${name || 'Sir/Madam'},

We are delighted to confirm your upcoming site visit to Sanghi City Villa Township!

📍 Site Location: Survey No: 156, ORR Exit-11, Pedda Amberpet, Hyderabad 501511.
Google Maps Link: https://maps.google.com/?q=Sanghi+City+Hyderabad

Your dedicated relationship manager will receive you at the township experience center to give you and your family a personalized tour of the sample villa and clubhouse.

Looking forward to meeting you!

Warm regards,
Sanghi City Welcome Desk`
  }
];

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel error', e);
}

const MOCK_NAMES = [
  "Rajesh Kumar Verma",
  "Dr. Snigdha Reddy",
  "Venkata Satyanarayana",
  "Ananya & Rohit Sharma",
  "K. S. Rao"
];

function isMockCall(call) {
  if (!call) return false;
  if (['call-101', 'call-102', 'call-103', 'call-104', 'call-105'].includes(call.id)) return true;
  if (MOCK_NAMES.includes(call.leadName)) return true;
  if (['+91 98490 12345', '+91 98855 67890', '+91 94401 88990', '+91 97000 45612', '+91 99890 22334'].includes(call.leadPhone)) return true;
  return false;
}

function isMockEmail(email) {
  if (!email) return false;
  if (['mail-201', 'mail-202'].includes(email.id)) return true;
  if (MOCK_NAMES.includes(email.leadName)) return true;
  return false;
}

// ----------------- CALL LOGS -----------------
export function getCallLogs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CALL_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(c => !isMockCall(c));
      if (filtered.length !== parsed.length) {
        localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
    return [];
  } catch (e) {
    console.error('Failed to get call logs', e);
    return [];
  }
}

export function logCall(callData) {
  const current = getCallLogs();
  const newCall = {
    id: callData.id || ('call-' + Date.now().toString(36)),
    leadId: callData.leadId || '',
    leadName: callData.leadName || 'Prospect',
    leadPhone: callData.leadPhone || '',
    employeeId: callData.employeeId || 'emp-unknown',
    employeeName: callData.employeeName || 'Staff Member',
    employeeDept: callData.employeeDept || 'Marketing & Sales',
    outcome: callData.outcome || 'Connected - Interested',
    duration: callData.duration || '2 mins 30 secs',
    durationSec: callData.durationSec || 150,
    notes: callData.notes || '',
    timestamp: new Date().toISOString()
  };

  const updated = [newCall, ...current];
  localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(updated));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'CALLS_UPDATED', calls: updated, newCall });
  }

  // Sync with MongoDB API
  syncCallLogToAPI(newCall);

  return newCall;
}

// ----------------- EMAIL LOGS -----------------
export function getEmailLogs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(e => !isMockEmail(e));
      if (filtered.length !== parsed.length) {
        localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
    return [];
  } catch (e) {
    console.error('Failed to get email logs', e);
    return [];
  }
}

export function logEmail(emailData) {
  const current = getEmailLogs();
  const newMail = {
    id: emailData.id || ('mail-' + Date.now().toString(36)),
    leadId: emailData.leadId || '',
    leadName: emailData.leadName || 'Prospect',
    leadEmail: emailData.leadEmail || '',
    employeeId: emailData.employeeId || 'emp-unknown',
    employeeName: emailData.employeeName || 'Marketing Executive',
    templateType: emailData.templateType || 'Digital Project Kit & Master Plan',
    subject: emailData.subject || 'Maytri Ambhuja Villa Township Enquiry',
    preview: emailData.preview || (emailData.body ? emailData.body.substring(0, 120) + '...' : ''),
    body: emailData.body || '',
    status: 'Delivered',
    sentAt: new Date().toISOString()
  };

  const updated = [newMail, ...current];
  localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'EMAILS_UPDATED', emails: updated, newMail });
  }

  // Sync with MongoDB API
  syncEmailLogToAPI(newMail);

  return newMail;
}

// ---------------- MongoDB API Helpers ----------------
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  const envUrl = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
                 (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL);
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return 'https://api.sanghicity.in/api';
};

export async function fetchCallLogsFromAPI() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/calls`);
    if (!res.ok) throw new Error('API fetch calls failed');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const filtered = json.data.filter(c => !isMockCall(c));
      localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(filtered));
      return filtered;
    }
  } catch (err) {
    console.warn('Could not sync call logs from API:', err.message);
  }
  return getCallLogs();
}

export async function syncCallLogToAPI(callData) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callData)
    });
    return await res.json();
  } catch (err) {
    console.warn('API call log save failed:', err.message);
    return null;
  }
}

export async function fetchEmailLogsFromAPI() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/emails`);
    if (!res.ok) throw new Error('API fetch emails failed');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const filtered = json.data.filter(e => !isMockEmail(e));
      localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(filtered));
      return filtered;
    }
  } catch (err) {
    console.warn('Could not sync email logs from API:', err.message);
  }
  return getEmailLogs();
}

export async function syncEmailLogToAPI(emailData) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    return await res.json();
  } catch (err) {
    console.warn('API email log save failed:', err.message);
    return null;
  }
}
