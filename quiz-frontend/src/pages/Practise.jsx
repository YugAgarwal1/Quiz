import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import SubjectCard from '../components/SubjectCard.jsx';
import RecentTestCard from '../components/RecentTestCard.jsx';
import QuestionWiseChart from '../components/Question_Wise_Chart.jsx';
import TimeWiseChart from '../components/Time_Wise_Chart.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faPlus, faShieldHalved, faGraduationCap } from '@fortawesome/free-solid-svg-icons';

export default function Practise() {
    const { currentSemester, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('subjects');
    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [completedTests, setCompletedTests] = useState([]);
    const [analyticsData, setAnalyticsData] = useState({
        questionPerformance: [0, 0, 0],
        timeWiseBreakdown: [0, 0, 0],
        questionWiseAverageTime: [0, 0, 0]
    });

    // Fetch subjects dynamically based on active semester
    useEffect(() => {
        async function fetchSemesterSubjects() {
            setLoadingSubjects(true);
            try {
                const semId = currentSemester?.id;
                const res = await api.getSubjects(semId);
                if (res.success && Array.isArray(res.subjects)) {
                    setSubjects(res.subjects);
                } else {
                    setSubjects([]);
                }
            } catch (err) {
                console.warn('[Practise] Failed to fetch subjects from API, checking local storage:', err.message);
                setSubjects([]);
            } finally {
                setLoadingSubjects(false);
            }
        }

        fetchSemesterSubjects();
    }, [currentSemester]);

    // Fetch Test History & Analytics for active semester
    useEffect(() => {
        async function fetchTestsAndAnalytics() {
            try {
                const semId = currentSemester?.id;
                
                // Fetch completed tests from backend API for active semester
                const historyRes = await api.getQuizHistory('completed', semId);
                if (historyRes.success && Array.isArray(historyRes.history)) {
                    setCompletedTests(historyRes.history);
                } else {
                    const localData = JSON.parse(localStorage.getItem("quiz")) || [];
                    const currentSubNames = subjects.map(s => s.name?.toLowerCase());
                    const completed = localData.filter(item => 
                        item.status === "completed" && 
                        (currentSubNames.length === 0 || currentSubNames.includes(item.subject?.toLowerCase()))
                    );
                    setCompletedTests(completed);
                }

                // Fetch analytics for active semester
                const analyticsRes = await api.getAnalytics(semId);
                if (analyticsRes.success && analyticsRes.analytics) {
                    setAnalyticsData({
                        questionPerformance: analyticsRes.analytics.questionPerformance || [0, 0, 0],
                        timeWiseBreakdown: analyticsRes.analytics.timeWiseBreakdown || [0, 0, 0],
                        questionWiseAverageTime: analyticsRes.analytics.questionWiseAverageTime || [0, 0, 0]
                    });
                }
            } catch (err) {
                const localData = JSON.parse(localStorage.getItem("quiz")) || [];
                const currentSubNames = subjects.map(s => s.name?.toLowerCase());
                const completed = localData.filter(item => 
                    item.status === "completed" && 
                    (currentSubNames.length === 0 || currentSubNames.includes(item.subject?.toLowerCase()))
                );
                setCompletedTests(completed);
            }
        }

        fetchTestsAndAnalytics();
    }, [currentSemester, subjects]);

    const getStatusCounts = (answers) => {
        let correct = 0, incorrect = 0, skipped = 0;
        Object.values(answers).forEach(answer => {
            if (answer.status === 'correct') correct++;
            else if (answer.status === 'incorrect') incorrect++;
            else if (answer.status === 'skip' || answer.status === 'skipped') skipped++;
        });
        return { correct, incorrect, skipped };
    };

    const tabs = [
        { id: 'subjects', name: 'Subjects' },
        { id: 'recent-tests', name: 'Recent Tests' },
        { id: 'analytics', name: 'Analytics' }
    ];

    const getSectionClass = (tabId) => {
        return activeTab === tabId ? 'block md:block' : 'hidden md:block';
    };

    return (
        <div className="bg-slate-50 min-h-screen pt-20">
            {/* Header section */}
            <Header activePage="practise" />

            {/* Sub-Navbar: Only visible on mobile */}
            <div className="sticky top-[60px] z-20 bg-white border-b border-gray-200 shadow-xs md:hidden">
                <div className="max-w-7xl mx-auto flex justify-around items-center px-2 py-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 text-center py-2 text-sm font-semibold transition-all rounded-lg mx-1 cursor-pointer ${
                                activeTab === tab.id 
                                ? 'bg-red-500 text-white shadow-xs' 
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 1. Subjects Section */}
                <div className={`${getSectionClass('subjects')} mb-12`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h5 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    Curriculum Subjects
                                </h5>
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                    {currentSemester?.name || 'Current Semester'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Subjects configured for {currentSemester?.name || 'the selected semester'}.
                            </p>
                        </div>

                        {isAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faPlus} /> Manage in Admin Portal
                            </button>
                        )}
                    </div>

                    {loadingSubjects ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-44 bg-white rounded-2xl border border-gray-200 animate-pulse p-6">
                                    <div className="w-1/3 h-4 bg-gray-200 rounded mb-4"></div>
                                    <div className="w-2/3 h-6 bg-gray-200 rounded mb-2"></div>
                                    <div className="w-1/2 h-4 bg-gray-100 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : subjects.length === 0 ? (
                        /* Empty State when no subjects are in the selected semester */
                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center shadow-xs">
                            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 text-2xl">
                                <FontAwesomeIcon icon={faBookOpen} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">
                                No Subjects Found for {currentSemester?.name || 'this Semester'}
                            </h4>
                            <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                                No course subjects or chapters have been added to <span className="font-semibold text-gray-700">{currentSemester?.name}</span> yet.
                            </p>

                            {isAdmin ? (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="mt-6 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faShieldHalved} /> Add Subjects to {currentSemester?.name} in Admin Panel
                                </button>
                            ) : (
                                <p className="mt-4 text-xs text-gray-400 font-medium">
                                    Switch to another semester from the top navbar or ask your administrator to upload modules.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjects.map((sub) => (
                                <SubjectCard 
                                    key={sub.id}
                                    subject={sub.name}
                                    chapters={sub.chapters_count || 5}
                                    state="Active"
                                    percentage={0}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Recent Tests Section */}
                <div className={`${getSectionClass('recent-tests')} mb-12`}>
                    <h5 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                        Recent Performance & Attempts
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {completedTests.length === 0 ? (
                            <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <span className="text-2xl text-gray-400">📊</span>
                                </div>
                                <p className="text-gray-700 font-bold">No Completed Tests Yet</p>
                                <p className="text-xs text-gray-400 mt-1">Pick a subject above to launch your first quiz session.</p>
                            </div>
                        ) : (
                            completedTests.map((test, index) => {
                                const { correct, incorrect, skipped } = test.answers ? getStatusCounts(test.answers) : {
                                    correct: test.correct_count || 0,
                                    incorrect: test.incorrect_count || 0,
                                    skipped: test.skipped_count || 0
                                };
                                
                                return (
                                    <RecentTestCard
                                        key={test.id || test.quizId || index}
                                        quizId={test.id || test.quizId}
                                        testName={test.test_title || test.testName || 'Practice Test'}
                                        subject={test.subject_name || test.subject || 'Course Quiz'}
                                        difficulty={test.difficulty || 'Mixed'}
                                        chapters={test.chapters || [1, 2]}
                                        totalQuestions={test.total_questions || test.totalQuestions || 10}
                                        correct={correct}
                                        incorrect={incorrect}
                                        skipped={skipped}
                                        timeTaken={test.time_taken_seconds || test.timeTaken || 0}
                                        score={test.score || 0}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 3. Analytics Section */}
                <div className={`${getSectionClass('analytics')} mb-12`}>
                    <h5 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                        Platform Performance Analytics ({currentSemester?.name || 'Active Semester'})
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <QuestionWiseChart title="Question Performance" labels={['Correct', 'Wrong', 'Skipped']} data={analyticsData.questionPerformance} />
                        <TimeWiseChart title="Time Wise Breakdown" labels={['Correct', 'Wrong', 'Skipped']} data={analyticsData.timeWiseBreakdown} /> 
                        <TimeWiseChart title="Question Wise Average Time" labels={['Correct', 'Wrong', 'Skipped']} data={analyticsData.questionWiseAverageTime} />  
                    </div>
                </div>
            </div>
        </div>
    );
}