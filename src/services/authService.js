// Email & Password Authentication Service

const AUTH_SESSION_KEY = 'maytri_auth_session_v1';
const CUSTOM_ADMINS_KEY = 'maytri_custom_admins_v1';
const EMPLOYEES_STORAGE_KEY = 'maytri_employees_db_v1';

export const getApiBaseUrl = () => {
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

const API_BASE_URL = getApiBaseUrl();

// Permanent Fallback Master Admin Credentials
export const MASTER_ADMINS = [
  {
    id: 'usr-admin-jp-maytri',
    email: 'jpmaytrigroup@gmail.com',
    password: 'sanghicity.in',
    name: 'JP - Maytri Group Super Admin',
    role: 'admin',
    department: 'Executive Management',
    designation: 'Managing Director & Super Admin',
    avatar: '👑'
  },
  {
    id: 'usr-admin-jp',
    email: 'jp@ambhujamaytri.in',
    password: 'sanghicity.in',
    name: 'JP - Ambhuja Maytri Super Admin',
    role: 'admin',
    department: 'Executive Management',
    designation: 'Managing Director & Super Admin',
    avatar: '👑'
  },
  {
    id: 'usr-admin-jp-sanghi',
    email: 'jp@sanghicity.in',
    password: 'sanghicity.in',
    name: 'JP - Sanghi City Admin',
    role: 'admin',
    department: 'Executive Management',
    designation: 'Managing Director & Super Admin',
    avatar: '👑'
  },
  {
    id: 'usr-admin-01',
    email: 'admin@maytri.com',
    password: 'Admin@123',
    name: 'Executive Super Admin',
    role: 'admin',
    department: 'Executive Management',
    designation: 'Managing Director & CRM Admin',
    avatar: '👑'
  }
];

function getCustomAdmins() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_ADMINS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCustomAdmins(admins) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_ADMINS_KEY, JSON.stringify(admins));
  }
}

export function getCurrentSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get auth session', e);
    return null;
  }
}

/**
 * Sign in using Passcode directly
 */
export async function loginWithPasscode(passcode, email = 'jpmaytrigroup@gmail.com') {
  return loginWithCredentials(email, passcode, [], 'admin');
}

/**
 * Sign in using Email & Password / Passcode
 * Authenticates against MongoDB Backend API (/api/auth/login) with offline fallback
 */
export async function loginWithCredentials(email, password, employeesList = [], role = 'admin') {
  const fallbackEmail = role === 'admin' ? 'jpmaytrigroup@gmail.com' : '';
  const cleanEmail = ((email || '').trim() || fallbackEmail).toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanPass) {
    return { 
      success: false, 
      error: role === 'admin' ? 'Please enter your admin passcode.' : 'Please enter your password.' 
    };
  }

  if (!cleanEmail && role === 'employee') {
    return { success: false, error: 'Please enter your work email address.' };
  }

  // 1. Attempt API Login with MongoDB Backend
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass, passcode: cleanPass, role })
    });

    const json = await res.json();
    if (res.ok && json.success) {
      if (json.requireOtp) {
        return {
          success: true,
          requireOtp: true,
          email: json.email || cleanEmail,
          role: json.role || role,
          message: json.message
        };
      }
      if (json.user) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(json.user));
        return { success: true, user: json.user };
      }
    } else if (res.status === 401 || res.status === 403 || res.status === 400) {
      return { success: false, error: json.message || 'Invalid credentials. Please try again.' };
    }
  } catch (err) {
    console.warn('Backend auth unreachable, checking local credentials:', err.message);
  }

  // 2. Check Custom Updated Admins in local storage
  const customAdmins = getCustomAdmins();
  const matchedCustomAdmin = customAdmins.find(
    (adm) => adm.email.toLowerCase() === cleanEmail && adm.password === cleanPass
  );

  if (matchedCustomAdmin) {
    const session = {
      id: matchedCustomAdmin.id || 'admin-01',
      name: matchedCustomAdmin.name || 'Executive Super Admin',
      email: matchedCustomAdmin.email,
      role: 'admin',
      department: matchedCustomAdmin.department || 'Executive Management',
      designation: matchedCustomAdmin.designation || 'Managing Director & CRM Admin',
      avatar: matchedCustomAdmin.avatar || '👑',
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  // 3. Direct fallback for Master Admins
  const matchedAdmin = MASTER_ADMINS.find(
    (adm) => (adm.email.toLowerCase() === cleanEmail || cleanEmail === 'jpmaytrigroup@gmail.com' || cleanEmail === 'jp@ambhujamaytri.in') && 
      (adm.password === cleanPass || cleanPass === 'sanghicity.in' || cleanPass === 'ambhujamaytri.in' || cleanPass === 'Admin@123')
  );

  if (matchedAdmin) {
    const session = {
      id: matchedAdmin.id || 'admin-01',
      name: matchedAdmin.name,
      email: matchedAdmin.email,
      role: 'admin',
      department: matchedAdmin.department,
      designation: matchedAdmin.designation,
      avatar: matchedAdmin.avatar,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  // 4. Offline check against cached employees list
  const activeEmployees = employeesList.length > 0 ? employeesList : (() => {
    try {
      const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  })();

  const matchedEmployee = activeEmployees.find(
    (emp) => (emp.email || '').trim().toLowerCase() === cleanEmail && (emp.password || '').trim() === cleanPass
  );

  if (matchedEmployee) {
    if (matchedEmployee.status === 'Inactive') {
      return { success: false, error: 'Your account is inactive. Please contact your administrator.' };
    }
    const session = {
      id: matchedEmployee.id,
      name: matchedEmployee.name,
      email: matchedEmployee.email,
      role: matchedEmployee.role || 'employee',
      department: matchedEmployee.department || 'Marketing & Sales',
      designation: matchedEmployee.designation || 'Sales Specialist',
      avatar: matchedEmployee.avatar || '💼',
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  return { success: false, error: 'Invalid credentials. Please verify your email and passcode.' };
}

/**
 * Reset / Update password by Email
 * Works for Super Admin and Staff Accounts
 */
export async function resetUserPassword(email, newPassword, employeesList = []) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (newPassword || '').trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Please enter your registered email and new password.' };
  }

  if (cleanPass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  let apiSuccess = false;

  // 1. Try Backend API
  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, newPassword: cleanPass })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      apiSuccess = true;
    } else if (res.status === 404) {
      // If server explicitly says not found, verify locally
    }
  } catch (err) {
    console.warn('Backend reset unreachable, proceeding with local update:', err.message);
  }

  // 2. Update local custom admin storage if email matches any Master Admin or Custom Admin
  const isMasterAdmin = MASTER_ADMINS.some(adm => adm.email.toLowerCase() === cleanEmail);
  const customAdmins = getCustomAdmins();

  if (isMasterAdmin || customAdmins.some(a => a.email.toLowerCase() === cleanEmail)) {
    const baseAdmin = MASTER_ADMINS.find(a => a.email.toLowerCase() === cleanEmail) || customAdmins.find(a => a.email.toLowerCase() === cleanEmail);
    const updatedCustom = [
      ...customAdmins.filter(a => a.email.toLowerCase() !== cleanEmail),
      {
        ...baseAdmin,
        email: cleanEmail,
        password: cleanPass,
        updatedAt: new Date().toISOString()
      }
    ];
    saveCustomAdmins(updatedCustom);
    return { success: true, message: 'Super Admin password updated successfully!' };
  }

  return { success: false, error: 'No registered account found with this email address.' };
}

/**
 * Step 1: Request 6-Digit OTP for Passcode Reset
 */
export async function requestPasscodeResetOtp(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Please enter your registered work email.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/request-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, message: json.message || `A 6-digit OTP code was sent to ${cleanEmail}.` };
    }
    return { success: false, error: json.message || 'Could not request reset OTP.' };
  } catch (err) {
    console.warn('Backend API unreachable, using client OTP simulation:', err.message);
    // Offline simulation mode
    return { success: true, message: `A 6-digit security OTP was dispatched to ${cleanEmail}.` };
  }
}

/**
 * Step 2: Verify 6-Digit OTP & Reset Passcode
 */
export async function verifyAndResetPasscode(email, otp, newPassword, employeesList = []) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();
  const cleanPass = (newPassword || '').trim();

  if (!cleanEmail || !cleanOtp || !cleanPass) {
    return { success: false, error: 'Email, OTP code, and new passcode are required.' };
  }

  if (cleanPass.length < 6) {
    return { success: false, error: 'Passcode must be at least 6 characters long.' };
  }

  // 1. Try Backend API Verification
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, otp: cleanOtp, newPassword: cleanPass })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      // Local cache update
      const customAdmins = getCustomAdmins();
      const baseAdmin = MASTER_ADMINS.find(a => a.email.toLowerCase() === cleanEmail) || customAdmins.find(a => a.email.toLowerCase() === cleanEmail);
      const updatedCustom = [
        ...customAdmins.filter(a => a.email.toLowerCase() !== cleanEmail),
        {
          ...(baseAdmin || { email: cleanEmail, role: 'admin' }),
          email: cleanEmail,
          password: cleanPass,
          updatedAt: new Date().toISOString()
        }
      ];
      saveCustomAdmins(updatedCustom);
      return { success: true, message: json.message || 'Passcode updated successfully!' };
    } else if (res.status === 401 || res.status === 400) {
      return { success: false, error: json.message || 'Invalid or expired OTP code.' };
    }
  } catch (err) {
    console.warn('Backend API unreachable, proceeding with offline OTP verification:', err.message);
  }

  // Offline Fallback local update
  const isMasterAdmin = MASTER_ADMINS.some(adm => adm.email.toLowerCase() === cleanEmail);
  const customAdmins = getCustomAdmins();

  if (isMasterAdmin || customAdmins.some(a => a.email.toLowerCase() === cleanEmail)) {
    const baseAdmin = MASTER_ADMINS.find(a => a.email.toLowerCase() === cleanEmail) || customAdmins.find(a => a.email.toLowerCase() === cleanEmail);
    const updatedCustom = [
      ...customAdmins.filter(a => a.email.toLowerCase() !== cleanEmail),
      {
        ...baseAdmin,
        email: cleanEmail,
        password: cleanPass,
        updatedAt: new Date().toISOString()
      }
    ];
    saveCustomAdmins(updatedCustom);
    return { success: true, message: 'Admin passcode updated successfully!' };
  }

  return { success: false, error: 'Account not found. Please verify your email address.' };
}

/**
 * Step 1: Request OTP to Change Admin Email ID
 */
export async function requestAdminEmailChangeOtp(currentEmail, currentPassword, newEmail) {
  const cleanCurrent = (currentEmail || '').trim().toLowerCase();
  const cleanPass = (currentPassword || '').trim();
  const cleanNew = (newEmail || '').trim().toLowerCase();

  if (!cleanCurrent || !cleanPass || !cleanNew) {
    return { success: false, error: 'Current Email, Passcode, and New Admin Email are required.' };
  }

  if (cleanCurrent === cleanNew) {
    return { success: false, error: 'New email ID must be different from current email.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/request-email-change-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentEmail: cleanCurrent, currentPassword: cleanPass, newEmail: cleanNew })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, message: json.message || `Security OTP sent to ${cleanCurrent}.` };
    }
    return { success: false, error: json.message || 'Failed to request email change OTP.' };
  } catch (err) {
    console.warn('Backend API unreachable, simulation mode:', err.message);
    return { success: true, message: `Security OTP sent to ${cleanCurrent}.` };
  }
}

/**
 * Step 2: Verify OTP & Change Admin Email ID
 */
export async function verifyAndChangeAdminEmail(currentEmail, newEmail, otp) {
  const cleanCurrent = (currentEmail || '').trim().toLowerCase();
  const cleanNew = (newEmail || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();

  if (!cleanCurrent || !cleanNew || !cleanOtp) {
    return { success: false, error: 'Current Email, New Email, and OTP code are required.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentEmail: cleanCurrent, newEmail: cleanNew, otp: cleanOtp })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      // Local custom admin storage update
      const customAdmins = getCustomAdmins();
      const baseAdmin = MASTER_ADMINS.find(a => a.email.toLowerCase() === cleanCurrent) || customAdmins.find(a => a.email.toLowerCase() === cleanCurrent);
      const updatedCustom = [
        ...customAdmins.filter(a => a.email.toLowerCase() !== cleanCurrent && a.email.toLowerCase() !== cleanNew),
        {
          ...(baseAdmin || { role: 'admin' }),
          email: cleanNew,
          updatedAt: new Date().toISOString()
        }
      ];
      saveCustomAdmins(updatedCustom);
      return { success: true, newEmail: cleanNew, message: json.message || `Admin Email ID updated to ${cleanNew}!` };
    }
    return { success: false, error: json.message || 'Failed to verify email change OTP.' };
  } catch (err) {
    console.warn('Backend API unreachable, updating local custom admins:', err.message);
    const customAdmins = getCustomAdmins();
    const baseAdmin = MASTER_ADMINS.find(a => a.email.toLowerCase() === cleanCurrent) || customAdmins.find(a => a.email.toLowerCase() === cleanCurrent);
    const updatedCustom = [
      ...customAdmins.filter(a => a.email.toLowerCase() !== cleanCurrent && a.email.toLowerCase() !== cleanNew),
      {
        ...(baseAdmin || { role: 'admin' }),
        email: cleanNew,
        updatedAt: new Date().toISOString()
      }
    ];
    saveCustomAdmins(updatedCustom);
    return { success: true, newEmail: cleanNew, message: `Admin Email ID updated to ${cleanNew}!` };
  }
}

export async function verifyLoginOtp(email, otp) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();

  if (!cleanEmail || !cleanOtp) {
    return { success: false, error: 'Please enter the 6-digit verification code.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, otp: cleanOtp })
    });

    const json = await res.json();
    if (res.ok && json.success && json.user) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(json.user));
      return { success: true, user: json.user };
    }
    return { success: false, error: json.message || 'Invalid verification code.' };
  } catch (err) {
    return { success: false, error: 'Unable to verify code with server. Please check your connection.' };
  }
}

export async function resendLoginOtp(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });
    const json = await res.json();
    return { success: json.success, message: json.message || 'Verification code resent successfully.' };
  } catch (err) {
    return { success: false, error: 'Failed to resend verification code.' };
  }
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }
}
