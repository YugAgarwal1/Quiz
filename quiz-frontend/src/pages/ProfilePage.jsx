import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import api from '../services/api.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faGraduationCap,
  faBuilding,
  faCamera,
  faPaperPlane,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faShieldHalved,
  faSave
} from '@fortawesome/free-solid-svg-icons';

export default function ProfilePage() {
  const { user, isAdmin, updateProfile, semesters, currentSemester, refreshSemesters } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || 'Studylink');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Semester Request State
  const [requestedSemId, setRequestedSemId] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4500);
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCollege(user.college || 'Studylink');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Load Semester Requests
  const loadRequests = async () => {
    try {
      const res = await api.getMySemesterRequests();
      if (res.success && Array.isArray(res.requests)) {
        setMyRequests(res.requests);
      }
    } catch (err) {
      console.warn('[Profile] Error loading requests:', err.message);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Handle Avatar Image Upload (converts to base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, college, avatar });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Semester Change Request
  const handleSubmitSemesterRequest = async (e) => {
    e.preventDefault();
    if (!requestedSemId) {
      showToast('Please select a semester to request', 'error');
      return;
    }
    setRequestLoading(true);
    try {
      const res = await api.submitSemesterRequest(requestedSemId, requestReason);
      showToast(res.message || 'Request submitted to administrator!', 'success');
      setRequestReason('');
      setRequestedSemId('');
      loadRequests();
    } catch (err) {
      showToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setRequestLoading(false);
    }
  };

  const pendingRequest = myRequests.find(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pt-20">
      <Header activePage="profile" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast Notification */}
        {toast.message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-md transition-all ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast({ message: '', type: 'success' })} className="text-gray-300 hover:text-white cursor-pointer">✕</button>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Account Profile & Settings</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your personal profile, avatar, and academic semester enrollment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Avatar & Quick Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-xs">
              {/* Avatar with Camera Overlay */}
              <div className="relative w-28 h-28 mx-auto mb-4 group">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile Avatar"
                    className="w-28 h-28 rounded-full object-cover border-2 border-red-500 shadow-sm"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-red-600 to-orange-400 text-white flex items-center justify-center font-bold text-4xl shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-gray-900 hover:bg-black text-white rounded-full shadow-md cursor-pointer transition transform group-hover:scale-110"
                  title="Upload New Photo"
                >
                  <FontAwesomeIcon icon={faCamera} className="w-3.5 h-3.5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <h3 className="text-lg font-bold text-gray-900">{user?.name || 'Student Name'}</h3>
              <p className="text-xs text-gray-500">{user?.email}</p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-2">
                <span className="px-3 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-full border border-red-200">
                  {currentSemester?.name || user?.semester_name || 'Sem VI'}
                </span>
                <span className={`px-3 py-1 font-bold text-xs rounded-full ${
                  isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                }`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-xs text-gray-600 space-y-2.5 shadow-2xs">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faShieldHalved} className="text-red-500" />
                Semester Policy
              </h4>
              <p className="leading-relaxed">
                Students are enrolled into their official curriculum semester. To switch semesters, submit a request below for admin review and validation.
              </p>
            </div>
          </div>

          {/* Right Column: Edit Profile Details & Semester Request */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Profile Details Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-red-500" />
                Personal Information
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      College / Institution
                    </label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Registered Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faSave} />
                    {loading ? 'Saving Changes...' : 'Save Profile Details'}
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Semester Enrollment & Request Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faGraduationCap} className="text-red-500" />
                  Academic Semester Enrollment
                </h3>
                <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full">
                  Current: {currentSemester?.name || 'Sem VI'}
                </span>
              </div>

              {isAdmin ? (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900">
                  <p className="font-bold mb-1">👑 Administrator Access Enabled</p>
                  <p>As an administrator, you have full clearance to switch active viewing semesters directly from the top navigation bar at any time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status of Pending Request if exists */}
                  {pendingRequest ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                      <FontAwesomeIcon icon={faClock} className="text-amber-600 text-lg mt-0.5" />
                      <div className="flex-1 text-xs">
                        <p className="font-bold text-amber-900">Semester Change Request Pending</p>
                        <p className="text-amber-800 mt-0.5">
                          You requested a change to <span className="font-bold">{pendingRequest.requested_semester_name}</span> on {new Date(pendingRequest.created_at).toLocaleDateString()}. Your request is waiting for administrator approval.
                        </p>
                        {pendingRequest.reason && (
                          <p className="text-amber-700 italic mt-1">Reason: "{pendingRequest.reason}"</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitSemesterRequest} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Request New Semester Assignment
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Select Desired Semester
                          </label>
                          <select
                            required
                            value={requestedSemId}
                            onChange={(e) => setRequestedSemId(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none"
                          >
                            <option value="">-- Select Semester --</option>
                            {semesters
                              .filter(s => s.id !== user?.semester_id)
                              .map((sem) => (
                                <option key={sem.id} value={sem.id}>
                                  {sem.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Reason / Academic Note
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Promoted to Sem VII term"
                            value={requestReason}
                            onChange={(e) => setRequestReason(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={requestLoading || !requestedSemId}
                          className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <FontAwesomeIcon icon={faPaperPlane} />
                          {requestLoading ? 'Submitting...' : 'Submit Request to Admin'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Previous Requests History */}
                  {myRequests.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Request History
                      </h4>
                      <div className="space-y-2">
                        {myRequests.map((req) => (
                          <div
                            key={req.id}
                            className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-gray-800">
                                Request to {req.requested_semester_name}
                              </span>
                              <p className="text-[11px] text-gray-400">
                                Submitted on {new Date(req.created_at).toLocaleDateString()}
                              </p>
                              {req.admin_comment && (
                                <p className="text-[11px] text-gray-500 italic mt-0.5">
                                  Admin note: "{req.admin_comment}"
                                </p>
                              )}
                            </div>

                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                              req.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : req.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
