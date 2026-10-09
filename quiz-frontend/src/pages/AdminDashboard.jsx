import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import api from '../services/api.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faQuestionCircle,
  faUsers,
  faGraduationCap,
  faPlus,
  faTrash,
  faEdit,
  faSearch,
  faFilter,
  faCheckCircle,
  faShieldHalved,
  faBookOpen,
  faLayerGroup,
  faArrowLeft,
  faClock,
  faCheck,
  faTimes,
  faCamera,
  faExchangeAlt,
  faInbox,
  faChartLine,
  faEye
} from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'questions' | 'academic' | 'users' | 'requests'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [questionPage, setQuestionPage] = useState(1);

  // Users State
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

  // Semester Requests State
  const [requests, setRequests] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [selectedRequestStatus, setSelectedRequestStatus] = useState('');
  const [reviewingReqId, setReviewingReqId] = useState(null);
  const [adminCommentInput, setAdminCommentInput] = useState('');

  // Academic State
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Modals State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);

  // Question Form State
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    subject_id: '',
    chapter_id: '',
    question_text: '',
    difficulty: 'Easy',
    solution_explanation: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0
  });

  // User Form State
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    semester_id: '1',
    college: 'Studylink',
    avatar: ''
  });

  // Academic Forms
  const [semesterForm, setSemesterForm] = useState({ code: '', name: '', order_num: 1 });
  const [subjectForm, setSubjectForm] = useState({ semester_id: '1', name: '', code: '', description: '' });
  const [chapterForm, setChapterForm] = useState({ subject_id: '1', chapter_number: 1, chapter_name: '', chapter_description: '' });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Load Overview Data
  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getOverview();
      if (res.success) setStats(res.stats);
    } catch (err) {
      showToast('Error loading overview: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Questions
  const loadQuestions = async () => {
    try {
      const res = await api.admin.getQuestions({
        search: questionSearch,
        difficulty: selectedDifficulty,
        subject_id: selectedSubjectFilter,
        page: questionPage,
        limit: 15
      });
      if (res.success) {
        setQuestions(res.questions);
        setTotalQuestions(res.totalQuestions);
      }
    } catch (err) {
      showToast('Error loading questions: ' + err.message);
    }
  };

  // Load Users
  const loadUsers = async () => {
    try {
      const res = await api.admin.getUsers({
        search: userSearch,
        role: selectedRoleFilter
      });
      if (res.success) {
        setUsers(res.users);
        setTotalUsers(res.totalUsers);
      }
    } catch (err) {
      showToast('Error loading users: ' + err.message);
    }
  };

  // Load Semester Requests
  const loadSemesterRequests = async () => {
    try {
      const res = await api.admin.getSemesterRequests({
        status: selectedRequestStatus
      });
      if (res.success) {
        setRequests(res.requests);
        setTotalRequests(res.totalRequests);
        const pending = res.requests.filter(r => r.status === 'pending').length;
        setPendingRequestsCount(pending);
      }
    } catch (err) {
      showToast('Error loading semester requests: ' + err.message);
    }
  };

  // Handle Review Semester Request
  const handleReviewRequest = async (id, status, comment = '') => {
    try {
      const res = await api.admin.reviewSemesterRequest(id, status, comment);
      showToast(res.message || `Request ${status} successfully!`);
      setReviewingReqId(null);
      setAdminCommentInput('');
      loadSemesterRequests();
      loadUsers();
      loadOverview();
    } catch (err) {
      showToast('Failed to review request: ' + err.message);
    }
  };

  // Load Academics
  const loadAcademics = async () => {
    try {
      const [semRes, subRes] = await Promise.all([
        api.getSemesters(),
        api.getSubjects()
      ]);
      if (semRes.success) setSemesters(semRes.semesters);
      if (subRes.success) setSubjects(subRes.subjects);
    } catch (err) {
      showToast('Error loading academic data: ' + err.message);
    }
  };

  useEffect(() => {
    loadOverview();
    loadAcademics();
    loadSemesterRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'questions') loadQuestions();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'academic') loadAcademics();
    if (activeTab === 'requests') loadSemesterRequests();
  }, [activeTab, questionSearch, selectedDifficulty, selectedSubjectFilter, questionPage, userSearch, selectedRoleFilter, selectedRequestStatus]);

  // Question Actions
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      const opts = questionForm.options.map((opt, idx) => ({
        option_text: opt,
        is_correct: idx === questionForm.correctOptionIndex ? 1 : 0
      }));

      const payload = {
        chapter_id: parseInt(questionForm.chapter_id, 10),
        question_text: questionForm.question_text,
        difficulty: questionForm.difficulty,
        solution_explanation: questionForm.solution_explanation,
        options: opts
      };

      if (editingQuestionId) {
        await api.admin.updateQuestion(editingQuestionId, payload);
        showToast('Question updated successfully!');
      } else {
        await api.admin.createQuestion(payload);
        showToast('Question created successfully!');
      }

      setShowQuestionModal(false);
      setEditingQuestionId(null);
      loadQuestions();
      loadOverview();
    } catch (err) {
      showToast('Failed to save question: ' + err.message);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.admin.deleteQuestion(id);
      showToast('Question deleted.');
      loadQuestions();
      loadOverview();
    } catch (err) {
      showToast('Delete failed: ' + err.message);
    }
  };

  // User Actions
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        await api.admin.updateUser(editingUserId, userForm);
        showToast('User updated successfully!');
      } else {
        await api.admin.createUser(userForm);
        showToast('User created successfully!');
      }
      setShowUserModal(false);
      setEditingUserId(null);
      loadUsers();
      loadOverview();
    } catch (err) {
      showToast('Failed to save user: ' + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.admin.deleteUser(id);
      showToast('User deleted.');
      loadUsers();
      loadOverview();
    } catch (err) {
      showToast('Delete failed: ' + err.message);
    }
  };

  // Academic Actions
  const handleCreateSemester = async (e) => {
    e.preventDefault();
    try {
      await api.admin.createSemester(semesterForm);
      showToast('Semester added successfully!');
      setShowSemesterModal(false);
      loadAcademics();
      loadOverview();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.admin.createSubject(subjectForm);
      showToast('Subject created successfully!');
      setShowSubjectModal(false);
      loadAcademics();
      loadOverview();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    try {
      await api.admin.createChapter(chapterForm);
      showToast('Chapter created successfully!');
      setShowChapterModal(false);
      loadAcademics();
      loadOverview();
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header activePage="admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-200 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
                <FontAwesomeIcon icon={faShieldHalved} /> Administrator Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              Quiz Bird Management Center
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Full control over question bank, academic curriculums, user roles, and platform statistics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition cursor-pointer flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back to App
            </button>
            <button
              onClick={() => {
                setEditingQuestionId(null);
                setQuestionForm({
                  subject_id: subjects[0]?.id || '1',
                  chapter_id: '1',
                  question_text: '',
                  difficulty: 'Easy',
                  solution_explanation: '',
                  options: ['', '', '', ''],
                  correctOptionIndex: 0
                });
                setShowQuestionModal(true);
              }}
              className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} /> Add New Question
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="mb-6 p-4 bg-gray-900 text-white rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
            <span>{notification}</span>
            <button onClick={() => setNotification('')} className="text-gray-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Navigation Tabs (Horizontally scrollable on mobile) */}
        <div className="flex overflow-x-auto scrollbar-none border-b border-gray-200 bg-white rounded-t-2xl px-4 sm:px-6 pt-3 gap-3 sm:gap-6 shadow-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 shrink-0 cursor-pointer transition ${
              activeTab === 'overview'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FontAwesomeIcon icon={faChartPie} /> Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 shrink-0 cursor-pointer transition ${
              activeTab === 'questions'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FontAwesomeIcon icon={faQuestionCircle} /> Question Bank ({stats?.questions?.total || totalQuestions || '...'})
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`pb-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 shrink-0 cursor-pointer transition ${
              activeTab === 'academic'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FontAwesomeIcon icon={faGraduationCap} /> Semesters & Subjects
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 shrink-0 cursor-pointer transition ${
              activeTab === 'users'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FontAwesomeIcon icon={faUsers} /> User Management ({stats?.users?.total || totalUsers || '...'})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 shrink-0 cursor-pointer transition ${
              activeTab === 'requests'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FontAwesomeIcon icon={faExchangeAlt} /> Semester Requests
            {pendingRequestsCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-600 text-white rounded-full animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="bg-white p-4 sm:p-6 rounded-b-2xl border border-t-0 border-gray-200 space-y-6 sm:space-y-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-red-500 to-rose-600 p-5 sm:p-6 rounded-2xl text-white shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-red-100 text-xs sm:text-sm font-medium">Total Questions</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">{stats?.questions?.total || 0}</h3>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl">
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-xl sm:text-2xl" />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/20 text-xs flex justify-between">
                  <span>Easy: {stats?.questions?.easy || 0}</span>
                  <span>Med: {stats?.questions?.medium || 0}</span>
                  <span>Hard: {stats?.questions?.hard || 0}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 sm:p-6 rounded-2xl text-white shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm font-medium">Registered Users</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">{stats?.users?.total || 0}</h3>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl">
                    <FontAwesomeIcon icon={faUsers} className="text-xl sm:text-2xl" />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/20 text-xs flex justify-between">
                  <span>Students: {stats?.users?.students || 0}</span>
                  <span>Admins: {stats?.users?.admins || 0}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 sm:p-6 rounded-2xl text-white shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-emerald-100 text-xs sm:text-sm font-medium">Academic Hierarchy</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">{stats?.academic?.subjects || 0} Subjects</h3>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-xl sm:text-2xl" />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/20 text-xs flex justify-between">
                  <span>{stats?.academic?.semesters || 0} Semesters</span>
                  <span>{stats?.academic?.chapters || 0} Chapters</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 sm:p-6 rounded-2xl text-white shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-amber-100 text-xs sm:text-sm font-medium">Quiz Submissions</p>
                    <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">{stats?.tests?.total || 0}</h3>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl">
                    <FontAwesomeIcon icon={faChartPie} className="text-xl sm:text-2xl" />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/20 text-xs flex justify-between">
                  <span>Platform Avg: {stats?.tests?.avgAccuracy || 0}%</span>
                  <span>Completed: {stats?.tests?.completed || 0}</span>
                </div>
              </div>
            </div>

            {/* Subject Question Distribution & Signups */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faBookOpen} className="text-red-500" /> Subject Question Distribution
                </h3>
                <div className="space-y-3">
                  {stats?.subjectBreakdown?.map((sub) => (
                    <div key={sub.id} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-800 text-sm">{sub.name}</span>
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                          {sub.question_count} Questions
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round((sub.question_count / (stats?.questions?.total || 1)) * 100))}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent User Signups */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="text-blue-500" /> Recent User Signups
                </h3>
                <div className="space-y-2.5">
                  {stats?.recentUsers?.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="bg-white p-3 rounded-xl border border-gray-200 flex justify-between items-center shadow-2xs hover:border-red-300 hover:shadow-sm transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-xs sm:text-sm group-hover:text-red-600 transition flex items-center gap-1.5 truncate">
                            {u.name}
                            <span className="text-[11px] text-gray-400 font-normal">#{u.id}</span>
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">{u.email} • {u.college || 'Studylink'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {u.role}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/users/${u.id}`);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="View Full Report"
                        >
                          <FontAwesomeIcon icon={faChartLine} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUESTION BANK (Responsive Table + Mobile Cards) */}
        {activeTab === 'questions' && (
          <div className="bg-white p-4 sm:p-6 rounded-b-2xl border border-t-0 border-gray-200 space-y-4 sm:space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FontAwesomeIcon icon={faSearch} />
                </div>
                <input
                  type="text"
                  placeholder="Search questions by keyword..."
                  value={questionSearch}
                  onChange={(e) => { setQuestionSearch(e.target.value); setQuestionPage(1); }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white text-xs sm:text-sm outline-none"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => { setSelectedDifficulty(e.target.value); setQuestionPage(1); }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none flex-1 sm:flex-none"
                >
                  <option value="">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => { setSelectedSubjectFilter(e.target.value); setQuestionPage(1); }}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none flex-1 sm:flex-none"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setEditingQuestionId(null);
                    setQuestionForm({
                      subject_id: subjects[0]?.id || '1',
                      chapter_id: '1',
                      question_text: '',
                      difficulty: 'Easy',
                      solution_explanation: '',
                      options: ['', '', '', ''],
                      correctOptionIndex: 0
                    });
                    setShowQuestionModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FontAwesomeIcon icon={faPlus} /> Add Question
                </button>
              </div>
            </div>

            {/* Mobile Cards View (Hidden on Desktop) */}
            <div className="block md:hidden space-y-3">
              {questions.length === 0 ? (
                <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed text-xs">
                  No questions found matching criteria.
                </div>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono text-gray-400 text-[10px]">#{q.id} • </span>
                        <span className="font-bold text-gray-900">{q.subject_name}</span>
                        <span className="text-[11px] text-gray-500 block">Ch {q.chapter_number}: {q.chapter_name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="font-medium text-gray-800 text-xs leading-relaxed">{q.question_text}</p>
                    
                    <div className="p-2 bg-white rounded-lg border border-gray-100 text-[11px]">
                      <span className="font-bold text-emerald-600">Answer: </span>
                      <span className="text-gray-700">{q.answer || 'N/A'}</span>
                    </div>

                    {q.solution_explanation && (
                      <p className="text-[10px] text-gray-400 italic">Sol: {q.solution_explanation}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-1 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setEditingQuestionId(q.id);
                          const opts = (q.options || []).map(o => o.option_text);
                          const correctIdx = (q.options || []).findIndex(o => o.is_correct === 1);
                          setQuestionForm({
                            subject_id: q.subject_id,
                            chapter_id: q.chapter_id,
                            question_text: q.question_text,
                            difficulty: q.difficulty,
                            solution_explanation: q.solution_explanation || '',
                            options: opts.length > 0 ? opts : ['', '', '', ''],
                            correctOptionIndex: correctIdx >= 0 ? correctIdx : 0
                          });
                          setShowQuestionModal(true);
                        }}
                        className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="px-3 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-lg"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4"># ID</th>
                    <th className="py-3.5 px-4">Subject & Chapter</th>
                    <th className="py-3.5 px-4">Question Text</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4">Correct Answer</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-400">
                        No questions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    questions.map((q) => (
                      <tr key={q.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3.5 px-4 font-mono text-gray-500 text-xs">#{q.id}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-900 block">{q.subject_name}</span>
                          <span className="text-xs text-gray-500">Ch {q.chapter_number}: {q.chapter_name}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-md">
                          <p className="font-medium text-gray-800 line-clamp-2">{q.question_text}</p>
                          {q.solution_explanation && (
                            <p className="text-xs text-gray-400 italic mt-1 line-clamp-1">
                              Sol: {q.solution_explanation}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600 max-w-xs truncate">
                          {q.answer || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => {
                              setEditingQuestionId(q.id);
                              const opts = (q.options || []).map(o => o.option_text);
                              const correctIdx = (q.options || []).findIndex(o => o.is_correct === 1);
                              setQuestionForm({
                                subject_id: q.subject_id,
                                chapter_id: q.chapter_id,
                                question_text: q.question_text,
                                difficulty: q.difficulty,
                                solution_explanation: q.solution_explanation || '',
                                options: opts.length > 0 ? opts : ['', '', '', ''],
                                correctOptionIndex: correctIdx >= 0 ? correctIdx : 0
                              });
                              setShowQuestionModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Question"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Question"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2">
              <span className="text-xs text-gray-500 font-medium">
                Showing {questions.length} of {totalQuestions} questions
              </span>
              <div className="flex gap-2">
                <button
                  disabled={questionPage <= 1}
                  onClick={() => setQuestionPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-50 rounded-lg border">
                  Page {questionPage}
                </span>
                <button
                  disabled={questions.length < 15}
                  onClick={() => setQuestionPage(p => p + 1)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACADEMIC MANAGEMENT (Semesters & Subjects & Chapters) */}
        {activeTab === 'academic' && (
          <div className="bg-white p-4 sm:p-6 rounded-b-2xl border border-t-0 border-gray-200 space-y-6 sm:space-y-8">
            {/* Semesters section */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Semesters & Curriculum Tracks</h3>
                  <p className="text-xs text-gray-500">Configure academic semesters available across the platform</p>
                </div>
                <button
                  onClick={() => setShowSemesterModal(true)}
                  className="self-start sm:self-auto px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faPlus} /> Add Semester
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {semesters.map((sem) => (
                  <div key={sem.id} className="bg-gray-50 p-3.5 sm:p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-2xs">
                    <div>
                      <span className="font-bold text-gray-900 text-sm sm:text-base block">{sem.name}</span>
                      <span className="text-xs text-gray-500 font-mono">{sem.code} • {sem.subjects_count || 0} Subjects</span>
                    </div>
                    <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded">
                      Order: {sem.order_num}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects & Chapters section */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Subjects Catalog</h3>
                  <p className="text-xs text-gray-500">Manage course modules, chapters, and question counts</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSubjectModal(true)}
                    className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add Subject
                  </button>
                  <button
                    onClick={() => setShowChapterModal(true)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faPlus} /> Add Chapter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {subjects.map((sub) => (
                  <div key={sub.id} className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                          {sub.semester_name || 'Sem VI'}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          {sub.total_questions || 0} Qs
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900">{sub.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{sub.description}</p>
                      <div className="mt-3 text-xs font-semibold text-gray-500">
                        Chapters: <span className="text-gray-800 font-bold">{sub.chapters_count || 5}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USER MANAGEMENT (Responsive Table + Mobile Cards) */}
        {activeTab === 'users' && (
          <div className="bg-white p-4 sm:p-6 rounded-b-2xl border border-t-0 border-gray-200 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FontAwesomeIcon icon={faSearch} />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white text-xs sm:text-sm outline-none"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium outline-none flex-1 sm:flex-none"
                >
                  <option value="">All Roles</option>
                  <option value="student">Students</option>
                  <option value="admin">Administrators</option>
                </select>

                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setUserForm({
                      name: '',
                      email: '',
                      password: '',
                      role: 'student',
                      semester_id: '1',
                      college: 'Studylink'
                    });
                    setShowUserModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FontAwesomeIcon icon={faPlus} /> Add User
                </button>
              </div>
            </div>

            {/* Mobile Cards View (Hidden on Desktop) */}
            <div className="block md:hidden space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2.5">
                  <div 
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                          {u.name}
                          <span className="text-[10px] text-gray-400 font-mono">#{u.id}</span>
                        </h4>
                        <p className="text-[11px] text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {u.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-gray-100 text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Academic Enrolled</span>
                      <span className="font-semibold text-gray-800">{u.semester_name || 'Sem VI'} • {u.college || 'Studylink'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Quizzes Taken</span>
                      <span className="font-bold text-red-600">{u.tests_taken || 0} tests</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg text-xs flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faChartLine} /> Report
                    </button>
                    <button
                      onClick={() => {
                        setEditingUserId(u.id);
                        setUserForm({
                          name: u.name,
                          email: u.email,
                          password: '',
                          role: u.role,
                          semester_id: u.semester_id || '1',
                          college: u.college || 'Studylink',
                          avatar: u.avatar || ''
                        });
                        setShowUserModal(true);
                      }}
                      className="px-3 py-1 bg-blue-50 text-blue-600 font-semibold rounded-lg text-xs flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 font-semibold rounded-lg text-xs flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4"># ID</th>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Semester & College</th>
                    <th className="py-3.5 px-4">Quizzes Taken</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="py-3.5 px-4 font-mono text-gray-500 text-xs">#{u.id}</td>
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200 group-hover:ring-2 group-hover:ring-red-400 transition"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs group-hover:bg-red-200 transition">
                              {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-gray-900 block group-hover:text-red-600 transition flex items-center gap-1.5">
                              {u.name}
                            </span>
                            <span className="text-xs text-gray-500">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-600">
                        <span className="font-semibold text-gray-800 block">{u.semester_name || 'Sem VI'}</span>
                        <span>{u.college || 'Studylink'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {u.tests_taken || 0} tests
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="View Full Analytics, Tests & Academic Performance"
                        >
                          <FontAwesomeIcon icon={faChartLine} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUserId(u.id);
                            setUserForm({
                              name: u.name,
                              email: u.email,
                              password: '',
                              role: u.role,
                              semester_id: u.semester_id || '1',
                              college: u.college || 'Studylink',
                              avatar: u.avatar || ''
                            });
                            setShowUserModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Edit User"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete User"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SEMESTER REQUESTS MANAGEMENT (Responsive Table + Mobile Cards) */}
        {activeTab === 'requests' && (
          <div className="bg-white p-4 sm:p-6 rounded-b-2xl border border-t-0 border-gray-200 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faExchangeAlt} className="text-red-500" />
                  Student Semester Transfer Requests
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review, approve, or reject student requests to change enrolled semester.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                {[
                  { id: '', label: 'All' },
                  { id: 'pending', label: `Pending (${pendingRequestsCount})` },
                  { id: 'approved', label: 'Approved' },
                  { id: 'rejected', label: 'Rejected' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedRequestStatus(st.id)}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      selectedRequestStatus === st.id
                        ? 'bg-white text-gray-900 shadow-2xs font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Cards View (Hidden on Desktop) */}
            <div className="block md:hidden space-y-3">
              {requests.length === 0 ? (
                <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed text-xs">
                  <FontAwesomeIcon icon={faInbox} className="text-2xl text-gray-300 mb-2 block mx-auto" />
                  No semester requests found matching status.
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {req.user_avatar ? (
                          <img src={req.user_avatar} alt={req.user_name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                            {req.user_name ? req.user_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-gray-900 block">{req.user_name}</span>
                          <span className="text-[10px] text-gray-500">{req.user_email}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700 animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs bg-white p-2 rounded-lg border border-gray-100">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-semibold rounded text-[11px]">
                        {req.current_semester_name || 'Sem VI'}
                      </span>
                      <span className="text-gray-400 font-bold">➔</span>
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded border border-red-200 text-[11px]">
                        {req.requested_semester_name}
                      </span>
                    </div>

                    {req.reason && (
                      <p className="text-[11px] text-gray-700 italic">"{req.reason}"</p>
                    )}

                    {req.status === 'pending' ? (
                      <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
                        {reviewingReqId === req.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Optional note..."
                              value={adminCommentInput}
                              onChange={(e) => setAdminCommentInput(e.target.value)}
                              className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none flex-1"
                            />
                            <button
                              onClick={() => handleReviewRequest(req.id, 'approved', adminCommentInput)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg"
                            >
                              Confirm
                            </button>
                            <button onClick={() => setReviewingReqId(null)} className="p-1 text-gray-400">✕</button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleReviewRequest(req.id, 'approved', 'Approved by administrator')}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                            >
                              <FontAwesomeIcon icon={faCheck} /> Approve
                            </button>
                            <button
                              onClick={() => handleReviewRequest(req.id, 'rejected', 'Request declined')}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-lg flex items-center gap-1"
                            >
                              <FontAwesomeIcon icon={faTimes} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4"># ID</th>
                    <th className="py-3.5 px-4">Student Details</th>
                    <th className="py-3.5 px-4">Semester Transfer</th>
                    <th className="py-3.5 px-4">Submission Date & Reason</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-400">
                        <FontAwesomeIcon icon={faInbox} className="text-3xl text-gray-300 mb-2 block mx-auto" />
                        No semester requests found matching status.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3.5 px-4 font-mono text-gray-500 text-xs">#{req.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {req.user_avatar ? (
                              <img
                                src={req.user_avatar}
                                alt={req.user_name}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                                {req.user_name ? req.user_name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-gray-900 block">{req.user_name}</span>
                              <span className="text-xs text-gray-500">{req.user_email} • {req.college || 'Studylink'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-semibold rounded">
                              {req.current_semester_name || 'Sem VI'}
                            </span>
                            <span className="text-gray-400 font-bold">➔</span>
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded border border-red-200">
                              {req.requested_semester_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-xs text-gray-500 font-medium">
                            {new Date(req.created_at).toLocaleDateString()} at {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {req.reason ? (
                            <p className="text-xs text-gray-800 italic mt-0.5 line-clamp-2">
                              "{req.reason}"
                            </p>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No note provided</span>
                          )}
                          {req.admin_comment && (
                            <p className="text-[11px] text-blue-700 font-medium mt-1">
                              Admin note: {req.admin_comment}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                            req.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : req.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700 animate-pulse'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {req.status === 'pending' ? (
                            <div className="flex justify-end items-center gap-2">
                              {reviewingReqId === req.id ? (
                                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                                  <input
                                    type="text"
                                    placeholder="Optional note..."
                                    value={adminCommentInput}
                                    onChange={(e) => setAdminCommentInput(e.target.value)}
                                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs outline-none w-32"
                                  />
                                  <button
                                    onClick={() => handleReviewRequest(req.id, 'approved', adminCommentInput)}
                                    className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-2xs"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setReviewingReqId(null)}
                                    className="p-1 text-gray-400 hover:text-gray-600 text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleReviewRequest(req.id, 'approved', 'Approved by administrator')}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                    title="Approve semester change"
                                  >
                                    <FontAwesomeIcon icon={faCheck} /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleReviewRequest(req.id, 'rejected', 'Request declined')}
                                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                                    title="Reject request"
                                  >
                                    <FontAwesomeIcon icon={faTimes} /> Reject
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-semibold">
                              Reviewed ({req.status})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ========================================== */}
      {/* MODALS SECTION */}
      {/* ========================================== */}

      {/* 1. Add / Edit Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-500 p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {editingQuestionId ? `Edit Question #${editingQuestionId}` : 'Add New Quiz Question'}
              </h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-white hover:opacity-80 text-xl font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject</label>
                  <select
                    value={questionForm.subject_id}
                    onChange={(e) => setQuestionForm({ ...questionForm, subject_id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Question Prompt</label>
                <textarea
                  required
                  rows="3"
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  placeholder="Enter the question text here..."
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Options (Select the correct radio):</label>
                <div className="space-y-2.5">
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={questionForm.correctOptionIndex === idx}
                        onChange={() => setQuestionForm({ ...questionForm, correctOptionIndex: idx })}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...questionForm.options];
                          newOpts[idx] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOpts });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 px-3 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Solution Explanation</label>
                <textarea
                  rows="2"
                  value={questionForm.solution_explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, solution_explanation: e.target.value })}
                  placeholder="Explain why this answer is correct..."
                  className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add / Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingUserId ? 'Edit User Details' : 'Create New User'}</h3>
              <button onClick={() => setShowUserModal(false)} className="text-white hover:opacity-80 text-xl font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {/* Avatar Uploader / Preview */}
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="relative w-14 h-14 shrink-0">
                  {userForm.avatar ? (
                    <img
                      src={userForm.avatar}
                      alt="Preview"
                      className="w-14 h-14 rounded-full object-cover border border-red-400"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                      {userForm.name ? userForm.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <label
                    htmlFor="user-modal-avatar"
                    className="absolute -bottom-1 -right-1 p-1.5 bg-gray-900 hover:bg-black text-white rounded-full text-xs shadow-md cursor-pointer"
                    title="Upload Avatar"
                  >
                    <FontAwesomeIcon icon={faCamera} className="w-2.5 h-2.5" />
                    <input
                      id="user-modal-avatar"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            showToast('Image must be under 2MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setUserForm({ ...userForm, avatar: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-xs text-gray-500">
                  <p className="font-bold text-gray-800">Profile Photo</p>
                  <p>Click camera icon to upload user photo (PNG/JPG &lt; 2MB)</p>
                  {userForm.avatar && (
                    <button
                      type="button"
                      onClick={() => setUserForm({ ...userForm, avatar: '' })}
                      className="text-red-500 font-bold hover:underline text-[11px] mt-0.5"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">College / Institution</label>
                <input
                  type="text"
                  value={userForm.college}
                  onChange={(e) => setUserForm({ ...userForm, college: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Password {editingUserId && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingUserId}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Semester</label>
                  <select
                    value={userForm.semester_id}
                    onChange={(e) => setUserForm({ ...userForm, semester_id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm outline-none"
                  >
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Semester Modal */}
      {showSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border p-6">
            <h3 className="font-bold text-lg mb-4">Add Academic Semester</h3>
            <form onSubmit={handleCreateSemester} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Semester Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sem VII"
                  value={semesterForm.name}
                  onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SEM_VII"
                  value={semesterForm.code}
                  onChange={(e) => setSemesterForm({ ...semesterForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowSemesterModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border p-6">
            <h3 className="font-bold text-lg mb-4">Add Course Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Semester</label>
                <select
                  value={subjectForm.semester_id}
                  onChange={(e) => setSubjectForm({ ...subjectForm, semester_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
                >
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Computing"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="Overview of syllabus..."
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Create Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border p-6">
            <h3 className="font-bold text-lg mb-4">Add Chapter to Subject</h3>
            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject</label>
                <select
                  value={chapterForm.subject_id}
                  onChange={(e) => setChapterForm({ ...chapterForm, subject_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ch #</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={chapterForm.chapter_number}
                    onChange={(e) => setChapterForm({ ...chapterForm, chapter_number: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Chapter Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Microservices"
                    value={chapterForm.chapter_name}
                    onChange={(e) => setChapterForm({ ...chapterForm, chapter_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowChapterModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Add Chapter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
