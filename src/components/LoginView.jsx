import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ArrowLeft,
  Key,
  RefreshCw,
  Briefcase,
  Crown
} from 'lucide-react';
import { 
  loginWithCredentials, 
  resetUserPassword, 
  verifyLoginOtp, 
  resendLoginOtp,
  requestPasscodeResetOtp,
  verifyAndResetPasscode,
  requestAdminEmailChangeOtp,
  verifyAndChangeAdminEmail
} from '../services/authService';

export default function LoginView({ onLoginSuccess, employees = [] }) {
  // Role selection: 'admin' | 'employee'
  const [loginRole, setLoginRole] = useState('admin');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isEmailChangeMode, setIsEmailChangeMode] = useState(false);
  
  // Admin Login States (default jpmaytrigroup@gmail.com)
  const [adminEmail, setAdminEmail] = useState('jpmaytrigroup@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminEmailInput, setShowAdminEmailInput] = useState(false);
  
  // Employee Login States
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');

  // Common UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Active target email for OTP verification
  const [activeTargetEmail, setActiveTargetEmail] = useState('jpmaytrigroup@gmail.com');

  // OTP states
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Reset Passcode OTP states
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [isResetOtpStep, setIsResetOtpStep] = useState(false);
  const [resetOtpCode, setResetOtpCode] = useState('');

  // Change Admin Email OTP states
  const [emailChangeCurrentEmail, setEmailChangeCurrentEmail] = useState('jpmaytrigroup@gmail.com');
  const [emailChangeCurrentPassword, setEmailChangeCurrentPassword] = useState('');
  const [emailChangeNewEmail, setEmailChangeNewEmail] = useState('');
  const [isEmailChangeOtpStep, setIsEmailChangeOtpStep] = useState(false);
  const [emailChangeOtpCode, setEmailChangeOtpCode] = useState('');
  const [securitySubTab, setSecuritySubTab] = useState('passcode'); // 'passcode' | 'email'

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer = null;
    if (isOtpMode && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOtpMode, resendCountdown]);

  // Handle switching role tabs
  const handleRoleChange = (role) => {
    setLoginRole(role);
    setIsOtpMode(false);
    setIsResetMode(false);
    setIsEmailChangeMode(false);
    setError('');
    setSuccessMessage('');
    setOtpValue('');
  };

  // Submit credentials (Step 1)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const isAdm = loginRole === 'admin';
    const emailToUse = isAdm 
      ? ((adminEmail || '').trim() || 'jpmaytrigroup@gmail.com')
      : (employeeEmail || '').trim();
    const passToUse = isAdm ? adminPassword.trim() : employeePassword.trim();

    if (!isAdm && !emailToUse) {
      setError('Please enter your work email address.');
      return;
    }

    if (!passToUse) {
      setError(isAdm ? 'Please enter the admin passcode.' : 'Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginWithCredentials(emailToUse, passToUse, employees, loginRole);
      if (res.requireOtp) {
        const destEmail = res.email || emailToUse;
        setActiveTargetEmail(destEmail);
        setIsOtpMode(true);
        setOtpValue('');
        setResendCountdown(60);
        setSuccessMessage(res.message || `A 6-digit verification code was emailed to ${destEmail}.`);
      } else if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit OTP (Step 2)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpValue.trim() || otpValue.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    const targetEmail = activeTargetEmail || (loginRole === 'admin' ? 'jpmaytrigroup@gmail.com' : employeeEmail);

    setOtpLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await verifyLoginOtp(targetEmail, otpValue.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendLoading) return;
    const targetEmail = activeTargetEmail || (loginRole === 'admin' ? 'jpmaytrigroup@gmail.com' : employeeEmail);
    
    setResendLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await resendLoginOtp(targetEmail);
      if (res.success) {
        setResendCountdown(60);
        setSuccessMessage(res.message || `New verification code dispatched to ${targetEmail}.`);
      } else {
        setError(res.error || 'Failed to resend code.');
      }
    } catch (err) {
      setError(err.message || 'Could not resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  // Passcode Reset Step 1: Request OTP
  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!resetEmail.trim()) {
      setError('Please enter your registered work email address.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await requestPasscodeResetOtp(resetEmail.trim());
      if (res.success) {
        setIsResetOtpStep(true);
        setSuccessMessage(res.message || `A 6-digit security OTP was sent to ${resetEmail.trim()}.`);
      } else {
        setError(res.error || 'Failed to request reset OTP.');
      }
    } catch (err) {
      setError(err.message || 'Error requesting security OTP.');
    } finally {
      setResetLoading(false);
    }
  };

  // Passcode Reset Step 2: Verify OTP & Reset Passcode
  const handleVerifyResetPasscode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!resetOtpCode.trim() || resetOtpCode.trim().length < 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      setError('New passcode must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passcode and confirm passcode do not match.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await verifyAndResetPasscode(resetEmail.trim(), resetOtpCode.trim(), newPassword.trim(), employees);
      if (res.success) {
        setSuccessMessage('Passcode updated successfully! You can now sign in with your new passcode.');
        if (loginRole === 'admin') {
          setAdminPassword(newPassword.trim());
        }
        setIsResetMode(false);
        setIsResetOtpStep(false);
        setResetOtpCode('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.error || 'Failed to verify OTP or update passcode.');
      }
    } catch (err) {
      setError(err.message || 'Error updating passcode.');
    } finally {
      setResetLoading(false);
    }
  };

  // Change Admin Email Step 1: Request OTP
  const handleRequestEmailChangeOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!emailChangeCurrentEmail.trim() || !emailChangeCurrentPassword.trim() || !emailChangeNewEmail.trim()) {
      setError('Please provide current email, current passcode, and new admin email address.');
      return;
    }

    if (emailChangeCurrentEmail.trim().toLowerCase() === emailChangeNewEmail.trim().toLowerCase()) {
      setError('New admin email must be different from current email.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await requestAdminEmailChangeOtp(
        emailChangeCurrentEmail.trim(), 
        emailChangeCurrentPassword.trim(), 
        emailChangeNewEmail.trim()
      );
      if (res.success) {
        setIsEmailChangeOtpStep(true);
        setSuccessMessage(res.message || `Security OTP sent to ${emailChangeCurrentEmail.trim()}.`);
      } else {
        setError(res.error || 'Failed to request email change OTP.');
      }
    } catch (err) {
      setError(err.message || 'Error requesting authorization OTP.');
    } finally {
      setResetLoading(false);
    }
  };

  // Change Admin Email Step 2: Verify OTP & Change Email
  const handleVerifyChangeAdminEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!emailChangeOtpCode.trim() || emailChangeOtpCode.trim().length < 6) {
      setError('Please enter the 6-digit security OTP.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await verifyAndChangeAdminEmail(
        emailChangeCurrentEmail.trim(),
        emailChangeNewEmail.trim(),
        emailChangeOtpCode.trim()
      );
      if (res.success) {
        setAdminEmail(res.newEmail || emailChangeNewEmail.trim());
        setSuccessMessage(`Admin Email ID successfully changed to ${res.newEmail || emailChangeNewEmail.trim()}!`);
        setIsEmailChangeMode(false);
        setIsEmailChangeOtpStep(false);
        setEmailChangeOtpCode('');
        setEmailChangeCurrentPassword('');
        setEmailChangeNewEmail('');
      } else {
        setError(res.error || 'Failed to verify OTP or update email.');
      }
    } catch (err) {
      setError(err.message || 'Error changing admin email ID.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-backdrop-glow" />

      <div className="login-card">
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-brand-icon" style={{ background: 'transparent', padding: 0 }}>
            <img
              src="/sanghicity-icon.png"
              alt="Sanghi City"
              style={{ width: '56px', height: '56px', objectFit: 'contain' }}
            />
          </div>
          <h1 className="login-brand-title">SANGHI CITY</h1>
          <p className="login-brand-tagline">Sanghi City CRM &amp; Admin Portal</p>
        </div>

        {/* Role Selector Tabs (Admin vs Employee) */}
        {!isOtpMode && !isResetMode && (
          <div className="login-role-tabs">
            <button
              type="button"
              className={`login-role-btn ${loginRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
            >
              <Crown size={16} />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              className={`login-role-btn ${loginRole === 'employee' ? 'active' : ''}`}
              onClick={() => handleRoleChange('employee')}
            >
              <Briefcase size={16} />
              <span>Employee Portal</span>
            </button>
          </div>
        )}

        {/* Role & Security Banner */}
        <div className={`login-role-info-banner ${loginRole === 'admin' ? 'admin' : 'employee'}`}>
          <div className="role-info-header">
            <span className="role-badge">
              <ShieldCheck size={15} />
              <span>
                {isOtpMode 
                  ? 'Step 2: Enter 6-Digit Email OTP' 
                  : isResetMode 
                    ? 'Security & Password Setup' 
                    : loginRole === 'admin'
                      ? 'Admin Passcode Authentication'
                      : 'Employee & Staff Authentication'}
              </span>
            </span>
          </div>
          <p className="role-info-desc">
            {isOtpMode ? (
              <>
                We have sent a 6-digit one-time passcode to <strong style={{ color: '#000' }}>{activeTargetEmail}</strong>. Please enter the code below to complete sign-in.
              </>
            ) : isResetMode ? (
              'Enter your registered email address to set or update your password.'
            ) : loginRole === 'admin' ? (
              <>
                Enter your admin passcode below. A one-time verification OTP will be sent directly to <strong style={{ color: '#000' }}>{adminEmail || 'jpmaytrigroup@gmail.com'}</strong>.
              </>
            ) : (
              'Enter your registered work email and password. A verification OTP will be sent directly to your email.'
            )}
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div style={{
            background: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            color: '#065f46',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            lineHeight: 1.4
          }}>
            <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="login-error-alert" role="alert">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isOtpMode ? (
          /* Step 2: OTP 2FA Verification Form */
          <form onSubmit={handleOtpSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="otp-input" style={{ textAlign: 'center', display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>
                Enter 6-Digit OTP Code sent to {activeTargetEmail}
              </label>
              <div className="login-input-wrap" style={{ justifyContent: 'center' }}>
                <Key size={18} className="login-input-icon" />
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  className="form-input login-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: '0.55em',
                    fontWeight: '800',
                    fontFamily: 'monospace',
                    padding: '0.75rem 1rem 0.75rem 2.5rem'
                  }}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={otpLoading || otpValue.length < 6}
            >
              {otpLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>{loginRole === 'admin' ? 'Verify OTP & Enter Admin Dashboard' : 'Verify OTP & Enter Employee Desk'}</span>
                </>
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <button
                type="button"
                onClick={() => {
                  setIsOtpMode(false);
                  setOtpValue('');
                  setError('');
                  setSuccessMessage('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={15} />
                <span>Back to {loginRole === 'admin' ? 'Passcode' : 'Login'}</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCountdown > 0 || resendLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: resendCountdown > 0 ? '#94a3b8' : '#0d9488',
                  fontWeight: 700,
                  cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {resendLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : !isResetMode ? (
          /* Step 1: Login Form (Admin or Employee) */
          <form onSubmit={handleSubmit} className="login-form">
            {loginRole === 'admin' ? (
              /* Admin Form */
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="admin-password">
                    Admin Passcode
                  </label>
                  <div className="login-input-wrap">
                    <Lock size={17} className="login-input-icon" />
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin passcode"
                      className="form-input login-input"
                      autoComplete="current-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary login-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying Passcode...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Passcode &amp; Request OTP</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </>
            ) : (
              /* Employee Form */
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="employee-email">
                    Employee Work Email
                  </label>
                  <div className="login-input-wrap">
                    <Mail size={17} className="login-input-icon" />
                    <input
                      id="employee-email"
                      type="email"
                      required
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                      placeholder="e.g. employee@maytri.com"
                      className="form-input login-input"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="employee-password">
                    Employee Password
                  </label>
                  <div className="login-input-wrap">
                    <Lock size={17} className="login-input-icon" />
                    <input
                      id="employee-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                      placeholder="Enter employee password"
                      className="form-input login-input"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary login-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In &amp; Request OTP</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSuccessMessage('');
                  setResetEmail(loginRole === 'admin' ? adminEmail : employeeEmail);
                  setEmailChangeCurrentEmail(adminEmail);
                  setIsResetMode(true);
                  setSecuritySubTab('passcode');
                  setIsResetOtpStep(false);
                  setIsEmailChangeOtpStep(false);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}
                className="hover:underline"
              >
                Forgot passcode or need to change admin email?
              </button>
            </div>
          </form>
        ) : (
          /* Security & Credential Management Panel */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 2-Tab Sub-Selector */}
            <div className="login-role-tabs">
              <button
                type="button"
                className={`login-role-btn ${securitySubTab === 'passcode' ? 'active' : ''}`}
                onClick={() => {
                  setSecuritySubTab('passcode');
                  setError('');
                  setSuccessMessage('');
                  setIsResetOtpStep(false);
                }}
              >
                <KeyRound size={15} />
                <span>Reset Passcode</span>
              </button>

              {loginRole === 'admin' && (
                <button
                  type="button"
                  className={`login-role-btn ${securitySubTab === 'email' ? 'active' : ''}`}
                  onClick={() => {
                    setSecuritySubTab('email');
                    setError('');
                    setSuccessMessage('');
                    setIsEmailChangeOtpStep(false);
                  }}
                >
                  <Mail size={15} />
                  <span>Change Admin Email</span>
                </button>
              )}
            </div>

            {securitySubTab === 'passcode' ? (
              /* TAB A: Reset Passcode Form (with OTP) */
              <form onSubmit={!isResetOtpStep ? handleRequestResetOtp : handleVerifyResetPasscode} className="login-form">
                {!isResetOtpStep ? (
                  /* Step 1: Request OTP */
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="reset-email">
                        Registered Admin Work Email
                      </label>
                      <div className="login-input-wrap">
                        <Mail size={17} className="login-input-icon" />
                        <input
                          id="reset-email"
                          type="email"
                          required
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="jpmaytrigroup@gmail.com"
                          className="form-input login-input"
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary login-submit-btn"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Sending Security OTP...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound size={16} />
                          <span>Send Security OTP to Email</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  /* Step 2: Enter OTP & New Passcode */
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="reset-otp-input" style={{ textAlign: 'center', display: 'block', fontWeight: 700 }}>
                        Enter 6-Digit Security OTP sent to {resetEmail}
                      </label>
                      <div className="login-input-wrap" style={{ justifyContent: 'center' }}>
                        <Key size={18} className="login-input-icon" />
                        <input
                          id="reset-otp-input"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          required
                          value={resetOtpCode}
                          onChange={(e) => setResetOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="• • • • • •"
                          className="form-input login-input"
                          style={{
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            letterSpacing: '0.55em',
                            fontWeight: '800',
                            fontFamily: 'monospace'
                          }}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="new-password">
                        New Passcode (Min. 6 characters)
                      </label>
                      <div className="login-input-wrap">
                        <Lock size={17} className="login-input-icon" />
                        <input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new passcode"
                          className="form-input login-input"
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Hide passcode" : "Show passcode"}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="confirm-password">
                        Confirm New Passcode
                      </label>
                      <div className="login-input-wrap">
                        <Lock size={17} className="login-input-icon" />
                        <input
                          id="confirm-password"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new passcode"
                          className="form-input login-input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary login-submit-btn"
                      disabled={resetLoading || resetOtpCode.length < 6}
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Verifying OTP &amp; Updating Passcode...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          <span>Verify OTP &amp; Set New Passcode</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            ) : (
              /* TAB B: Change Admin Email ID Form (with OTP) */
              <form onSubmit={!isEmailChangeOtpStep ? handleRequestEmailChangeOtp : handleVerifyChangeAdminEmail} className="login-form">
                {!isEmailChangeOtpStep ? (
                  /* Step 1: Enter Current & New Email */
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="current-admin-email">Current Admin Email ID</label>
                      <div className="login-input-wrap">
                        <Mail size={17} className="login-input-icon" />
                        <input
                          id="current-admin-email"
                          type="email"
                          required
                          value={emailChangeCurrentEmail}
                          onChange={(e) => setEmailChangeCurrentEmail(e.target.value)}
                          placeholder="jpmaytrigroup@gmail.com"
                          className="form-input login-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="current-admin-passcode">Current Admin Passcode</label>
                      <div className="login-input-wrap">
                        <Lock size={17} className="login-input-icon" />
                        <input
                          id="current-admin-passcode"
                          type="password"
                          required
                          value={emailChangeCurrentPassword}
                          onChange={(e) => setEmailChangeCurrentPassword(e.target.value)}
                          placeholder="Enter current passcode"
                          className="form-input login-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="new-admin-email">New Desired Admin Email ID</label>
                      <div className="login-input-wrap">
                        <Mail size={17} className="login-input-icon" />
                        <input
                          id="new-admin-email"
                          type="email"
                          required
                          value={emailChangeNewEmail}
                          onChange={(e) => setEmailChangeNewEmail(e.target.value)}
                          placeholder="e.g. admin@sanghicity.in"
                          className="form-input login-input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary login-submit-btn"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Requesting Authorization OTP...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound size={16} />
                          <span>Request Authorization OTP</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  /* Step 2: Enter 6-Digit OTP for Email Change */
                  <>
                    <div className="form-group">
                      <label className="form-label" style={{ textAlign: 'center', display: 'block', fontWeight: 700 }}>
                        Enter 6-Digit OTP sent to {emailChangeCurrentEmail}
                      </label>
                      <div className="login-input-wrap" style={{ justifyContent: 'center' }}>
                        <Key size={18} className="login-input-icon" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          required
                          value={emailChangeOtpCode}
                          onChange={(e) => setEmailChangeOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="• • • • • •"
                          className="form-input login-input"
                          style={{
                            textAlign: 'center',
                            fontSize: '1.5rem',
                            letterSpacing: '0.55em',
                            fontWeight: '800',
                            fontFamily: 'monospace'
                          }}
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary login-submit-btn"
                      disabled={resetLoading || emailChangeOtpCode.length < 6}
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Verifying OTP &amp; Updating Email...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          <span>Verify OTP &amp; Update Admin Email ID</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </form>
            )}

            <button
              type="button"
              onClick={() => {
                setError('');
                setIsResetMode(false);
                setIsResetOtpStep(false);
                setIsEmailChangeOtpStep(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '0.25rem'
              }}
            >
              <ArrowLeft size={15} />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        <div className="login-footer-note">
          <span>Protected Real Estate Portal • Telangana RERA P02400007647</span>
        </div>
      </div>
    </div>
  );
}
