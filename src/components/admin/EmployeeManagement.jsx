import React, { useState } from 'react';
import { 
  UserPlus, 
  Key, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit3,
  PhoneCall,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  UserCheck,
  Shield,
  Clock
} from 'lucide-react';
import { createEmployee, updateEmployee, deleteEmployee } from '../../services/employeeService';
import EmployeeTimeMonitoringView from './EmployeeTimeMonitoringView';

export default function EmployeeManagement({ 
  employees = [], 
  callLogs = [], 
  emailLogs = [], 
  leads = [], 
  onRefresh,
  initialSubTab = 'roster'
}) {
  const [subTab, setSubTab] = useState(initialSubTab);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    phone: '',
    department: 'Telecalling & Direct Sales',
    designation: 'Telecalling Specialist',
    dailyCallTarget: 35,
    dailyEmailTarget: 20,
  });

  const filteredEmployees = employees.filter(emp => {
    const q = searchQuery.toLowerCase();
    return (emp.name || '').toLowerCase().includes(q) || 
           (emp.email || '').toLowerCase().includes(q) || 
           (emp.department || '').toLowerCase().includes(q) ||
           (emp.designation || '').toLowerCase().includes(q);
  });

  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    await updateEmployee(emp.id || emp._id, { status: newStatus });
    if (onRefresh) onRefresh();
  };

  const handleDelete = async (emp) => {
    if (window.confirm(`Are you sure you want to delete login access for "${emp.name}" (${emp.email})?`)) {
      await deleteEmployee(emp.id || emp._id);
      if (onRefresh) onRefresh();
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: 'Pass@' + Math.floor(1000 + Math.random() * 9000),
      role: 'employee',
      phone: '',
      department: 'Telecalling & Direct Sales',
      designation: 'Telecalling Specialist',
      dailyCallTarget: 35,
      dailyEmailTarget: 20,
    });
    setEditingEmployee(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name || '',
      email: emp.email || '',
      password: emp.password || '',
      role: emp.role || 'employee',
      phone: emp.phone || '',
      department: emp.department || 'Telecalling & Direct Sales',
      designation: emp.designation || 'Telecalling Specialist',
      dailyCallTarget: emp.dailyCallTarget || 35,
      dailyEmailTarget: emp.dailyEmailTarget || 20,
    });
    setIsCreateModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      alert('Please fill Name, Email, and Password.');
      return;
    }

    if (editingEmployee) {
      await updateEmployee(editingEmployee.id || editingEmployee._id, formData);
    } else {
      await createEmployee(formData);
    }

    setIsCreateModalOpen(false);
    setEditingEmployee(null);
    if (onRefresh) onRefresh();
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
        <button
          type="button"
          className={`btn ${subTab === 'roster' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubTab('roster')}
          style={{ padding: '0.5rem 1.25rem', fontWeight: 700 }}
        >
          <UserCheck size={16} />
          <span>Staff Roster &amp; Credentials</span>
        </button>

        <button
          type="button"
          className={`btn ${subTab === 'monitoring' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSubTab('monitoring')}
          style={{ padding: '0.5rem 1.25rem', fontWeight: 700 }}
        >
          <Clock size={16} />
          <span>Real-time Time &amp; Activity Monitor</span>
        </button>
      </div>

      {subTab === 'monitoring' ? (
        <EmployeeTimeMonitoringView />
      ) : (
        <>
          {/* Controls Bar */}
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search employees by name, email, designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleOpenCreate}
            >
              <UserPlus size={16} />
              <span>Add New Employee / Telecaller</span>
            </button>
          </div>

          {/* Employees Master Table */}
          <div className="table-card">
            <div className="table-card-header">
              <div>
                <h3 className="table-title">Registered Employees &amp; Login Credentials</h3>
                <p className="table-subtitle">
                  Manage logins, emails, passwords, roles and outreach daily targets for all staff members.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-cyan">{employees.length} Total Users</span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="leads-table">
                <thead>
                  <tr>
                    <th>Employee &amp; Role</th>
                    <th>Login Email</th>
                    <th>Password</th>
                    <th>Phone</th>
                    <th>Targets (Calls / Emails)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                        No employees found. Click "Add New Employee / Telecaller" to create login credentials.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const empId = emp.id || emp._id;
                      const isPassVisible = showPasswords[empId];
                      const isAdminRole = emp.role === 'admin';

                      return (
                        <tr key={empId}>
                          {/* Name & Role */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontSize: '1.4rem' }}>{emp.avatar || (isAdminRole ? '👑' : '💼')}</span>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                  {emp.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                                  <span className={`badge ${isAdminRole ? 'badge-gold' : 'badge-slate'}`} style={{ fontSize: '0.7rem' }}>
                                    {isAdminRole ? '👑 ADMIN' : 'STAFF'}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {emp.designation || 'Telecaller'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Login Email */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              <Mail size={13} className="text-cyan-600" />
                              <span>{emp.email}</span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {emp.department || 'Sales'}
                            </span>
                          </td>

                          {/* Password */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700, color: '#0f766e', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                {isPassVisible ? (emp.password || 'welcome123') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(empId)}
                                className="btn btn-icon btn-sm btn-secondary"
                                title={isPassVisible ? "Hide Password" : "Show Password"}
                                style={{ padding: '0.25rem' }}
                              >
                                {isPassVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                          </td>

                          {/* Phone */}
                          <td>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {emp.phone || '—'}
                            </span>
                          </td>

                          {/* Daily Targets */}
                          <td>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              📞 {emp.dailyCallTarget || 30} calls / ✉️ {emp.dailyEmailTarget || 20} emails
                            </div>
                          </td>

                          {/* Status */}
                          <td>
                            <button
                              onClick={() => handleToggleStatus(emp)}
                              className={`badge ${emp.status === 'Active' ? 'badge-emerald' : 'badge-rose'}`}
                              style={{ cursor: 'pointer', border: 'none' }}
                              title="Click to toggle status"
                            >
                              {emp.status === 'Active' ? '● Active' : '○ Inactive'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                className="btn btn-secondary btn-icon btn-sm"
                                onClick={() => handleOpenEdit(emp)}
                                title="Edit Credentials & Target"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                className="btn btn-secondary btn-icon btn-sm"
                                style={{ color: '#ef4444' }}
                                onClick={() => handleDelete(emp)}
                                title="Delete User"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create / Edit Employee Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} className="text-cyan-600" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#000000' }}>
                  {editingEmployee ? 'Edit Employee Credentials' : 'Create New Employee Login'}
                </h3>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsCreateModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role Privilege *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="form-select"
                    >
                      <option value="employee">Staff / Telecaller Desk</option>
                      <option value="admin">Executive Super Admin</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Login Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="suresh@maytri.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Set Login Password *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pass@1234"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Telecaller"
                      value={formData.designation}
                      onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Daily Call Target</label>
                    <input
                      type="number"
                      value={formData.dailyCallTarget}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailyCallTarget: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Daily Email Target</label>
                    <input
                      type="number"
                      value={formData.dailyEmailTarget}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailyEmailTarget: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-header" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: 'none', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <UserPlus size={16} />
                  <span>{editingEmployee ? 'Save Changes' : 'Save & Grant Login Access'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
