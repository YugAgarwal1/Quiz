import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QuizPage from "./QuizPage";
import Header from '../components/Header.jsx';
import DetailedAnalytics from '../components/DetailedAnalytics.jsx';
import api from '../services/api.js';

export default function ResultPage() {
    const { subject, testId } = useParams();
    const [activeTab, setActiveTab] = useState('scorecard');
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'scorecard', name: 'Scorecard' },
        { id: 'analytics', name: 'Analytics' },
        { id: 'quiz', name: 'Question Review' }
    ];

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                let loaded = null;

                // 1. Try local storage first for instant feedback if available
                const existingData = JSON.parse(localStorage.getItem("quiz")) || [];
                const found = existingData.find(item => String(item.quizId) === String(testId));
                if (found && found.data && found.data.length > 0) {
                    loaded = found;
                }

                // 2. Always fetch backend authoritative attempt data to guarantee solutions and options
                try {
                    const res = await api.getAttemptById(testId);
                    if (res && res.success && res.attempt) {
                        const att = res.attempt;
                        const answersMap = {};
                        const questionsList = [];

                        (att.detailedAnswers || []).forEach((ans, idx) => {
                            const qId = ans.question_id || idx + 1;
                            const isCorrect = ans.is_correct === 1;
                            const status = isCorrect ? 'correct' : (ans.status === 'skip' || ans.status === 'skipped' ? 'skip' : (ans.selected_option ? 'incorrect' : 'unvisited'));
                            
                            const ansObj = {
                                selectedOption: ans.selected_option,
                                isCorrect,
                                status,
                                timeSpent: ans.time_spent_seconds || 0
                            };
                            answersMap[qId] = ansObj;
                            answersMap[idx] = ansObj;
                            answersMap[String(qId)] = ansObj;

                            questionsList.push({
                                id: qId,
                                question: ans.question_text || 'Question Text',
                                difficulty: ans.difficulty || 'Easy',
                                solution: ans.solution_explanation || '',
                                solution_explanation: ans.solution_explanation || '',
                                options: ans.options || [],
                                answer: ans.correct_answer || ''
                            });
                        });

                        loaded = {
                            quizId: att.id,
                            score: att.score || att.correct_count || 0,
                            subject: att.subject_name || subject,
                            testName: att.test_title || `${att.subject_name || 'Practice'} Test`,
                            totalQuestions: att.total_questions || questionsList.length,
                            correctAnswers: att.correct_count || 0,
                            incorrectAnswers: att.incorrect_count || 0,
                            skippedAnswers: att.skipped_count || 0,
                            timeTaken: att.time_taken_seconds || 0,
                            status: att.status || 'completed',
                            answers: answersMap,
                            data: questionsList
                        };

                        // Store in localStorage for offline resiliency
                        const updatedQuiz = existingData.filter(item => String(item.quizId) !== String(testId));
                        updatedQuiz.push(loaded);
                        localStorage.setItem("quiz", JSON.stringify(updatedQuiz));
                    }
                } catch (apiErr) {
                    console.warn('[ResultPage] API fetch attempt failed, using local storage fallback:', apiErr.message);
                }

                if (loaded) {
                    setQuizData(loaded);
                    localStorage.setItem('currentTestConfig', JSON.stringify({
                        testId: loaded.quizId,
                        subject: loaded.subject || subject,
                        testName: loaded.testName || 'Practice Test',
                        numOfQuestions: loaded.totalQuestions || (loaded.data || []).length
                    }));
                }
            } catch (err) {
                console.error('[ResultPage] Error loading quiz data:', err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [testId, subject]);

    const getSectionClass = (tabId) => {
        return activeTab === tabId ? 'block md:block' : 'hidden md:block';
    };

    return (
        <>
            <div className="bg-white min-h-screen lg:mt-16">
                {/* Header */}
                <Header activePage="practise" />

                {/* Mobile Tabs */}
                <div className='sticky top-[64px] bg-white border-b border-gray-200 shadow-sm md:hidden mb-8 z-10'>
                    <div className='flex justify-around items-center py-2'>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 text-center py-2 text-sm font-semibold transition-all duration-200 rounded-lg hover:rounded ${activeTab === tab.id
                                        ? 'bg-[var(--primary-red)] text-white'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Layout */}
                <div className='sm:px-6 py-8 flex flex-col lg:flex-row'>

                    {/* LEFT SECTION - Desktop Tabs (20% on desktop) */}
                    <div className='w-full lg:w-[20%] pr-0 lg:pr-6 mb-6 lg:mb-0 hidden lg:block'>
                        <div className='flex flex-col gap-2'>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${activeTab === tab.id
                                            ? 'bg-[var(--primary-red)] text-white shadow-md'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SECTION - Content */}
                    <div className='w-full lg:w-[80%]'>
                        {loading ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
                                <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-sm font-semibold text-gray-600">Loading test results and scorecard...</p>
                            </div>
                        ) : activeTab === "scorecard" ? (
                            <div className={`${getSectionClass('scorecard')} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                <div className='flex flex-col w-full p-2 sm:p-5'>
                                    <h5 className="text-2xl sm:text-3xl font-bold text-heading mb-6">
                                        Test Scorecard & Summary
                                    </h5>
                                    {quizData ? (
                                        <DetailedAnalytics quizData={quizData} activeSection="scorecard" />
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                            <p className="text-base text-gray-600">No scorecard data available for this test.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : activeTab === "analytics" ? (
                            <div className={`${getSectionClass('analytics')} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                <div className='flex flex-col w-full p-2 sm:p-5'>
                                    <h5 className="text-2xl sm:text-3xl font-bold text-heading mb-6">
                                        Performance Analytics
                                    </h5>
                                    {quizData ? (
                                        <DetailedAnalytics quizData={quizData} activeSection="analytics" />
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                            <p className="text-base text-gray-600">No analytics data available for this test.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className={`${getSectionClass('quiz')} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                <div className='flex flex-col w-full p-2 sm:p-5'>
                                    <h5 className="text-2xl sm:text-3xl font-bold text-heading mb-6">
                                        Question Review & Solutions
                                    </h5>
                                    <QuizPage testIdProp={testId} quizDataProp={quizData} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}