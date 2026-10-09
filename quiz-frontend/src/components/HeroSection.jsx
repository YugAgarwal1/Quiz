import React, { useContext, useEffect, useState } from 'react';
import Logo from '../images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faBook, faChartArea, faCheckCircle, faAward } from '@fortawesome/free-solid-svg-icons';
import { DemoChart } from '../components/DemoChart.jsx';
import PausedTests from './PausedTests.jsx';
import UpcomingTest from './UpcomingTest.jsx';
import { TimerContext } from '../App';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function HeroSection() {
    const { timerDisplay } = useContext(TimerContext);
    const { user, currentSemester } = useAuth();
    const [testCount, setTestCount] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [weeklyData, setWeeklyData] = useState([]);

    useEffect(() => {
        async function fetchStats() {
            try {
                const semId = currentSemester?.id;
                const [meRes, analyticsRes] = await Promise.all([
                    api.getMe(semId),
                    api.getAnalytics(semId)
                ]);

                if (meRes.success && meRes.stats) {
                    setTestCount(meRes.stats.completed_tests || 0);
                    setAccuracy(meRes.stats.average_accuracy || 0);
                }

                if (analyticsRes.success && analyticsRes.analytics?.weeklyActivity) {
                    setWeeklyData(analyticsRes.analytics.weeklyActivity);
                }
            } catch (e) {
                const localTests = JSON.parse(localStorage.getItem('quiz')) || [];
                setTestCount(localTests.length);
            }
        }
        fetchStats();
    }, [currentSemester, user]);

    return (
        <div className="flex flex-col min-h-screen px-4 sm:px-8 lg:px-20 pt-20">
            {/* Welcome Section */}
            <div className="mt-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-heading">
                    Welcome Back 👋, {user?.name || 'Student'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Here is your daily quiz activity and progress tracker for {currentSemester?.name || 'your semester'}.</p>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full">
                {/* Profile Card */}
                <div className="bg-neutral-primary-soft lg:w-[60%] p-6 rounded-2xl shadow-xs border border-gray-200">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-red-500 shadow-md"
                            />
                        ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-400 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'Y'}
                            </div>
                        )}

                        {/* Name & College */}
                        <div>
                            <h5 className="text-xl sm:text-2xl font-bold text-heading">
                                {user?.name || 'Yug Agarwal'}
                            </h5>
                            <p className="text-gray-500 text-sm font-medium">{user?.college || 'Studylink'}</p>
                            <p className="text-xs text-gray-400">{user?.email || 'student@quizbird.com'}</p>
                        </div>
                    </div>

                    {/* Semester & Role Badges */}
                    <div className="mt-4 flex gap-2">
                        <span className="bg-red-100 text-red-700 font-bold text-xs px-3.5 py-1 rounded-full border border-red-200">
                            {currentSemester?.name || user?.semester_name || 'Sem VI'}
                        </span>
                        <span className="bg-gray-100 text-gray-700 font-semibold text-xs px-3 py-1 rounded-full">
                            Role: {user?.role || 'student'}
                        </span>
                    </div>
                </div>

                {/* Time Spent and Progress cards together */}
                <div className="flex justify-start gap-4 lg:w-[40%]">
                    {/* Time Spent Card */}
                    <div className="bg-neutral-primary-soft w-[50%] p-6 rounded-2xl shadow-xs border border-gray-200">
                        <div className="flex flex-col gap-3">
                            <div className="rounded-2xl bg-red-100 w-12 h-12 flex items-center justify-center">
                                <FontAwesomeIcon
                                    icon={faClock}
                                    className="text-red-600 text-xl"
                                />
                            </div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Time Spent</p>
                            <p className="text-black text-xl font-bold lg:text-2xl">
                                {timerDisplay}
                            </p>
                        </div>
                    </div>

                    {/* Tests Given Card */}
                    <div className="bg-neutral-primary-soft w-[50%] p-6 rounded-2xl shadow-xs border border-gray-200">
                        <div className="flex flex-col gap-3">
                            <div className="rounded-2xl bg-blue-100 w-12 h-12 flex items-center justify-center">
                                <FontAwesomeIcon
                                    icon={faBook}
                                    className="text-blue-600 text-xl"
                                />
                            </div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Tests Taken</p>
                            <p className="text-black text-xl lg:text-2xl font-bold">
                                {testCount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Tests */}
            <UpcomingTest />

            {/* Paused Tests */}
            <PausedTests PageStatus="home" />

            {/* Weekly Performance Section */}
            <div className="mt-8 mb-12">
                <div className="mb-4">
                    <h5 className="text-xl sm:text-2xl font-bold text-heading">
                        Weekly Performance & Practice Progress
                    </h5>
                </div>

                <div className="flex justify-start gap-6 flex-wrap">
                    {/* Progress Chart */}
                    <div className="rounded-2xl border bg-white border-gray-200 shadow-xs lg:w-[100%] h-96 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FontAwesomeIcon icon={faChartArea} className="text-xl text-red-500" />
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">Practice Progress Over Time</h3>
                        </div>
                        <DemoChart weeklyData={weeklyData} />
                    </div>
                </div>
            </div>
        </div>
    );
}