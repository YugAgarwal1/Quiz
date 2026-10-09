import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import api from '../services/api.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faEnvelope,
  faBuilding,
  faGraduationCap,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faChartPie,
  faBookOpen,
  faLayerGroup,
  faAward,
  faEdit,
  faChevronDown,
  faChevronUp,
  faCamera,
  faCalendarAlt,
  faCheck,
  faTimes,
  faSlidersH,
  faExclamationCircle,
  faEye,
  faArrowRight,
  faListOl,
  faTimes as faClose
} from '@fortawesome/free-solid-svg-icons';
import QuestionWiseChart from '../components/Question_Wise_Chart.jsx';
import TimeWiseChart from '../components/Time_Wise_Chart.jsx';
import { DemoChart } from '../components/DemoChart.jsx';
import { SecondsToString } from '../utils/SeondsToMinute.js';

export default function AdminUserDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [semestersList, setSemestersList] = useState([]);
  const [activeMobileTab, setActiveMobileTab] = useState('analytics');
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);
  const [notification, setNotification] = useState('');

  const mobileTabs = [
    { id: 'analytics', name: 'Analytics', icon: faChartPie },
    { id: 'subjects', name: 'Subjects', icon: faBookOpen },
    { id: 'tests', name: 'Test History', icon: faAward }
  ];

  const getMobileClass = (tabId) => {
    return activeMobileTab === tabId ? 'block md:block' : 'hidden md:block';
  };

  const getAttemptChapters = (att) => {
    if (Array.isArray(att.chapters_included) && att.chapters_included.length > 0) {
      return att.chapters_included;
    }
    if (Array.isArray(att.detailedAnswers) && att.detailedAnswers.length > 0) {
      const map = new Map();
      att.detailedAnswers.forEach(ans => {
        if (ans.chapter_name) {
          const key = ans.chapter_number ? `Ch ${ans.chapter_number}` : ans.chapter_name;
          if (!map.has(key)) {
            map.set(key, { chapter_number: ans.chapter_number, chapter_name: ans.chapter_name });
          }
        }
      });
      if (map.size > 0) return Array.from(map.values());
    }
    if (att.savedState?.chapters && Array.isArray(att.savedState.chapters)) {
      return att.savedState.chapters.map(c => typeof c === 'object' ? c : { chapter_number: c, chapter_name: `Chapter ${c}` });
    }
    return [];
  };

  // Interactive Quiz Viewer Modal State
  const [activeQuizModalAttempt, setActiveQuizModalAttempt] = useState(null);
  const [modalQuestionIndex, setModalQuestionIndex] = useState(0);
  const [modalFilterStatus, setModalFilterStatus] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'skipped'

  // Edit User Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    semester_id: '1',
    college: 'Studylink',
    avatar: ''
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Load User Detailed Report
  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const [res, semRes] = await Promise.all([
        api.admin.getUserDetails(userId, selectedSemesterId || null),
        api.getSemesters()
      ]);

      if (res.success) {
        setUserData(res);
        if (res.user) {
          setEditForm({
            name: res.user.name || '',
            email: res.user.email || '',
            password: '',
            role: res.user.role || 'student',
            semester_id: String(res.user.semester_id || '1'),
            college: res.user.college || 'Studylink',
            avatar: res.user.avatar || ''
          });
        }
      }
      if (semRes.success && Array.isArray(semRes.semesters)) {
        setSemestersList(semRes.semesters);
      }
    } catch (err) {
      showToast('Error loading user report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserDetails();
  }, [userId, selectedSemesterId]);

  // Handle Save User Details
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      await api.admin.updateUser(userId, editForm);
      showToast('User profile updated successfully!');
      setShowEditModal(false);
      loadUserDetails();
    } catch (err) {
      showToast('Failed to update user: ' + err.message);
    }
  };

  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading user report...</span>
        </div>
      </div>
    );
  }

  const user = userData?.user;
  const stats = userData?.stats || {};
  const answerStats = userData?.answerStats || {};
  const subjectBreakdown = (userData?.subjectBreakdown || []).filter(s => (s.total_tests || 0) > 0);
  const chapterBreakdown = (userData?.chapterBreakdown || []).filter(c => (c.total_answered || 0) > 0);
  const attempts = userData?.attempts || [];
  const weeklyActivity = userData?.weeklyActivity || [];

  // Question & Time charts data calculated from actual attempts/answers
  const attemptsCorrect = attempts.reduce((a, c) => a + (Number(c.correct_count) || 0), 0);
  const attemptsIncorrect = attempts.reduce((a, c) => a + (Number(c.incorrect_count) || 0), 0);
  const attemptsSkipped = attempts.reduce((a, c) => a + (Number(c.skipped_count) || 0), 0);

  const qCorrect = (answerStats.correct !== undefined && answerStats.correct !== null && answerStats.correct > 0) ? answerStats.correct : attemptsCorrect;
  const qIncorrect = (answerStats.incorrect !== undefined && answerStats.incorrect !== null && answerStats.incorrect > 0) ? answerStats.incorrect : attemptsIncorrect;
  const qSkipped = (answerStats.skipped !== undefined && answerStats.skipped !== null && answerStats.skipped > 0) ? answerStats.skipped : attemptsSkipped;
  const hasQuestionData = (qCorrect + qIncorrect + qSkipped) > 0;

  const questionPerformance = [qCorrect, qIncorrect, qSkipped];

  const totalAnswerTime = (answerStats.correct_time || 0) + (answerStats.incorrect_time || 0) + (answerStats.skipped_time || 0);
  const totalAttemptTime = attempts.reduce((a, c) => a + (Number(c.time_taken_seconds) || 0), 0);
  const totalQuestionsSum = (qCorrect + qIncorrect + qSkipped) || 1;

  const timeWiseBreakdown = totalAnswerTime > 0
    ? [answerStats.correct_time || 0, answerStats.incorrect_time || 0, answerStats.skipped_time || 0]
    : [
        Math.round(totalAttemptTime * (qCorrect / totalQuestionsSum)),
        Math.round(totalAttemptTime * (qIncorrect / totalQuestionsSum)),
        Math.round(totalAttemptTime * (qSkipped / totalQuestionsSum))
      ];
  const hasTimeData = timeWiseBreakdown.reduce((a, b) => a + b, 0) > 0;

  // Active question in quiz viewer modal
  const modalQuestions = activeQuizModalAttempt?.detailedAnswers || [];
  const filteredModalQuestions = modalQuestions.filter(q => {
    if (modalFilterStatus === 'all') return true;
    if (modalFilterStatus === 'correct') return q.is_correct === 1;
    if (modalFilterStatus === 'incorrect') return q.is_correct === 0 && q.status !== 'skip' && q.status !== 'skipped';
    if (modalFilterStatus === 'skipped') return q.status === 'skip' || q.status === 'skipped';
    return true;
  });
  const currentModalQuestion = modalQuestions[modalQuestionIndex] || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans antialiased">
      <Header activePage="admin" />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24">
        {/* Top Navigation & Action Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-slate-400" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              <FontAwesomeIcon icon={faEdit} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="mb-5 p-3.5 bg-slate-900 text-white rounded-xl shadow-md flex items-center justify-between text-xs font-medium animate-fade-in">
            <span>{notification}</span>
            <button onClick={() => setNotification('')} className="text-slate-400 hover:text-white ml-3">✕</button>
          </div>
        )}

        {/* Mobile Sub-Navbar: 3 Tabs (Only visible on mobile) */}
        <div className="sticky top-[64px] z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-2xs md:hidden mb-6 -mx-4 px-3 py-2">
          <div className="flex justify-around items-center gap-1.5">
            {mobileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMobileTab(tab.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMobileTab === tab.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TAB GROUP 1: OVERVIEW & ANALYTICS */}
        <div className={getMobileClass('analytics')}>
          {/* 1. User Profile Hero Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-7 shadow-xs mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* User Identity Info */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 w-full lg:w-auto">
              {/* Avatar */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-2xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 text-[9px] font-bold rounded-md uppercase border border-white shadow-2xs ${
                  user?.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {user?.role}
                </span>
              </div>

              {/* Text Meta */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                    {user?.name}
                  </h1>
                  <span className="text-xs font-mono text-slate-400">#{user?.id}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                  <FontAwesomeIcon icon={faEnvelope} className="text-slate-400 text-xs shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                    <FontAwesomeIcon icon={faBuilding} className="text-slate-400 text-[10px]" />
                    {user?.college || 'Studylink'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold border border-red-100">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-[10px]" />
                    {user?.semester_name || 'Sem VI'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid (2x2 on mobile, 4 columns on desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Tests Given</span>
                <span className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block">{stats.total_tests || 0}</span>
                <span className="text-[10px] text-emerald-600 font-medium">{stats.completed_tests || 0} done</span>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Accuracy</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-600 mt-0.5 block">{stats.average_accuracy || 0}%</span>
                <span className="text-[10px] text-slate-400 font-medium">Average</span>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Points</span>
                <span className="text-lg sm:text-xl font-bold text-red-600 mt-0.5 block">{stats.total_score || 0}</span>
                <span className="text-[10px] text-slate-400 font-medium">Scored</span>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Study Time</span>
                <span className="text-xs sm:text-sm font-bold text-blue-600 mt-1 block truncate">
                  {SecondsToString(stats.total_study_time_seconds || 0)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Semester Filter Section (Horizontal scroll on mobile) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faSlidersH} className="text-red-500" />
                <span>Semester Filter</span>
              </h2>
              <p className="text-xs text-slate-500">Filter all subject data and tests by semester</p>
            </div>

            {/* Scrollable Pills */}
            <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex gap-1.5 bg-slate-100/80 p-1 rounded-xl">
              <button
                onClick={() => setSelectedSemesterId('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedSemesterId === ''
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Semesters
              </button>
              {semestersList.map((sem) => (
                <button
                  key={sem.id}
                  onClick={() => setSelectedSemesterId(String(sem.id))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    String(selectedSemesterId) === String(sem.id)
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sem.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Performance Analytics Section (Mobile Responsive) */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartPie} className="text-red-500" />
              <span>Performance Analytics</span>
            </h3>
          </div>

          {!hasQuestionData && !hasTimeData && (attempts.length === 0) ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-slate-300 text-2xl mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-slate-600">No test data given yet for this user.</p>
              <p className="text-xs text-slate-400 mt-0.5">Charts will populate automatically once the user attempts quizzes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Question Outcome Chart */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 sm:p-5 flex flex-col">
                <QuestionWiseChart 
                  title="Question Answers Breakdown" 
                  labels={['Correct', 'Incorrect', 'Skipped']} 
                  data={questionPerformance} 
                />
              </div>

              {/* Time Allocation Chart */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 sm:p-5 flex flex-col">
                <TimeWiseChart 
                  title="Time Spent on Questions" 
                  labels={['Correct', 'Incorrect', 'Skipped']} 
                  data={timeWiseBreakdown} 
                />
              </div>

              {/* 7-Day Activity Bar */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 sm:p-5 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-red-500 text-xs" />
                    <span>Recent 7-Day Activity</span>
                  </h5>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                    Activity Trend
                  </span>
                </div>
                <DemoChart weeklyData={weeklyActivity} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAB GROUP 2: SUBJECTS */}
      <div className={getMobileClass('subjects')}>
        {/* 4. Subject-Wise Breakdown (ONLY SHOW ATTEMPTED SUBJECTS) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faBookOpen} className="text-red-500" />
                <span>Subject-Wise Performance</span>
              </h3>
              <p className="text-xs text-slate-500">Only subjects with active test records are shown</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
              {subjectBreakdown.length} {subjectBreakdown.length === 1 ? 'Subject' : 'Subjects'} Attempted
            </span>
          </div>

          {subjectBreakdown.length === 0 ? (
            <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs sm:text-sm font-semibold text-slate-500">No subject tests recorded yet for this semester.</p>
              <p className="text-xs text-slate-400 mt-0.5">Subject performance cards will appear here once the user gives a test.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {subjectBreakdown.map((sub) => {
                const subAcc = Math.round(sub.average_accuracy || 0);
                return (
                  <div key={sub.subject_id} className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 flex flex-col justify-between hover:border-slate-300 transition">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-slate-200/70 text-slate-700 text-[10px] font-bold rounded">
                          {sub.semester_name}
                        </span>
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${
                          subAcc >= 70 ? 'bg-emerald-100 text-emerald-800' :
                          subAcc >= 40 ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {subAcc}% Accuracy
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{sub.subject_name}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-200/60 text-center">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Tests</span>
                        <span className="text-xs font-bold text-slate-800">{sub.completed_tests || sub.total_tests || 0}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-emerald-600 font-bold block uppercase">Correct</span>
                        <span className="text-xs font-bold text-emerald-600">{sub.correct_questions || 0}</span>
                      </div>
                      <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-blue-600 font-bold block uppercase">Time</span>
                        <span className="text-[11px] font-bold text-blue-600 truncate block mt-0.5">
                          {SecondsToString(sub.time_spent_seconds || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TAB GROUP 3: TEST HISTORY & RESPONSES */}
      <div className={getMobileClass('tests')}>
        {/* Test Attempts with Clean Header & Expandable Dropdown with Chapters Included */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faAward} className="text-red-500" />
                <span>Test Attempts & Responses</span>
              </h3>
              <p className="text-xs text-slate-500">
                Click details dropdown on any test to see chapters included, full metrics, or open quiz page
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
              {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'}
            </span>
          </div>

          {attempts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs sm:text-sm font-semibold text-slate-500">No test attempts recorded for this user yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((att) => {
                const acc = att.total_questions > 0 ? Math.round((att.correct_count / att.total_questions) * 100) : 0;
                const isExpanded = expandedAttemptId === att.id;
                const chapters = getAttemptChapters(att);
                
                return (
                  <div 
                    key={att.id} 
                    className="border border-slate-200/90 hover:border-red-300 rounded-2xl p-4 bg-slate-50/70 hover:bg-slate-50 transition shadow-2xs"
                  >
                    {/* Clean Header: NO DATE, NO SEM PILL, NO EXTRA CLUTTER */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg">
                            {att.subject_name || 'Subject'}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                            att.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {att.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                          {att.test_title || 'Quiz Test'}
                        </h4>
                      </div>

                      {/* Header Right Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-xs font-extrabold text-slate-900 block">
                            {att.score || 0} pts
                          </span>
                          <span className={`text-[11px] font-bold ${
                            acc >= 70 ? 'text-emerald-600' : acc >= 40 ? 'text-amber-600' : 'text-red-500'
                          }`}>
                            {acc}% Accuracy
                          </span>
                        </div>

                        {/* Clickable Dropdown Details Toggle */}
                        <button
                          type="button"
                          onClick={() => setExpandedAttemptId(isExpanded ? null : att.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                            isExpanded
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Toggle Detailed Information"
                        >
                          <span>Details</span>
                          <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-[10px]" />
                        </button>

                        {/* Open Quiz Page Direct Button */}
                        <button
                          type="button"
                          onClick={() => navigate(`/practise/${encodeURIComponent(att.subject_name || 'General')}/test/${att.id}/result`)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                          title="Open Quiz Page"
                        >
                          <FontAwesomeIcon icon={faEye} />
                          <span className="hidden sm:inline">Open Quiz</span>
                          <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                        </button>
                      </div>
                    </div>

                    {/* EXPANDABLE DROPDOWN DETAILS CONTAINER */}
                    {isExpanded && (
                      <div className="mt-3.5 pt-3.5 border-t border-slate-200/80 space-y-3.5 animate-in fade-in duration-200">
                        {/* 1. Chapters Included with Names */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80">
                          <div className="flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={faBookOpen} className="text-red-500 text-xs" />
                            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              Chapters Included ({chapters.length > 0 ? chapters.length : 'All'})
                            </h5>
                          </div>

                          {chapters.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {chapters.map((ch, cIdx) => (
                                <span 
                                  key={cIdx} 
                                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs flex items-center gap-2"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  <span>{ch.chapter_number ? `Ch ${ch.chapter_number}: ` : ''}{ch.chapter_name || ch.name || `Chapter ${ch}`}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">
                              All curriculum chapters for {att.subject_name || 'this course'} were included in this attempt.
                            </p>
                          )}
                        </div>

                        {/* 2. Test Details & Performance Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Semester</span>
                            <span className="font-bold text-slate-800">{att.semester_name || 'Current Sem'}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Date Taken</span>
                            <span className="font-bold text-slate-800">
                              {att.completed_at ? new Date(att.completed_at).toLocaleDateString() : (att.created_at ? new Date(att.created_at).toLocaleDateString() : 'Recent')}
                            </span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Duration</span>
                            <span className="font-bold text-slate-800">{SecondsToString(att.time_taken_seconds || 0)}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Questions</span>
                            <span className="font-bold text-slate-800">{att.total_questions || 0} Total</span>
                          </div>
                        </div>

                        {/* 3. Question Response Counts Pill Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-700 font-bold">
                              ✓ {att.correct_count} Correct
                            </span>
                            <span className="text-rose-700 font-bold">
                              ✗ {att.incorrect_count} Incorrect
                            </span>
                            <span className="text-amber-700 font-bold">
                              ⊘ {att.skipped_count} Skipped
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigate(`/practise/${encodeURIComponent(att.subject_name || 'General')}/test/${att.id}/result`)}
                            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faEye} />
                            <span>View Full Quiz Solutions</span>
                            <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </main>

      {/* Edit User Modal (Mobile Responsive) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm sm:text-base">Edit User Account</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              {/* Avatar */}
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="relative w-12 h-12 shrink-0">
                  {editForm.avatar ? (
                    <img
                      src={editForm.avatar}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border border-red-400"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-base">
                      {editForm.name ? editForm.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <label
                    htmlFor="admin-edit-avatar"
                    className="absolute -bottom-1 -right-1 p-1 bg-slate-900 hover:bg-black text-white rounded-full text-[10px] shadow-sm cursor-pointer"
                    title="Upload Photo"
                  >
                    <FontAwesomeIcon icon={faCamera} className="w-2.5 h-2.5" />
                    <input
                      id="admin-edit-avatar"
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
                            setEditForm({ ...editForm, avatar: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-[11px] text-slate-500">
                  <p className="font-bold text-slate-800">Profile Picture</p>
                  <p>JPG or PNG &lt; 2MB</p>
                  {editForm.avatar && (
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, avatar: '' })}
                      className="text-red-500 font-bold hover:underline text-[10px]"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">College / Institution</label>
                <input
                  type="text"
                  value={editForm.college}
                  onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Semester</label>
                  <select
                    value={editForm.semester_id}
                    onChange={(e) => setEditForm({ ...editForm, semester_id: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                  >
                    {semestersList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-2xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
