import { useState } from 'react';
import { User, Lock, Save, Shield, BadgeCheck, Activity } from 'lucide-react';
import authService from '../services/authService';

export default function ProfilePage({ user, setUser }) {
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  });
  
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: '',
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const updated = await authService.updateProfile(profileData);
      setUser(updated);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await authService.changePassword(passwords.old, passwords.new);
      setPasswords({ old: '', new: '', confirm: '' });
      setStatus({ type: 'success', message: 'Password changed successfully!' });
    } catch (err) {
      const msg = err.response?.data?.old_password?.[0] || 'Failed to change password.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your identity and platform credentials.</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {status.type === 'success' ? <BadgeCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Quick Info */}
        <div className="space-y-6">
          <div className="card p-6 text-center">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-3xl font-bold mx-auto">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">{user?.first_name} {user?.last_name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-700/10 capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="card p-6">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Account Metadata</h4>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">{new Date(user?.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Access Level</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.role === 'admin' ? 'Total Control' : user?.role === 'technician' ? 'Staff Oversight' : 'Read/Write Access'}
                    </p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Form */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-400" />
              <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwords.old}
                  onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="input-field"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn-secondary">
                  <Shield className="h-4 w-4 mr-2" />
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
