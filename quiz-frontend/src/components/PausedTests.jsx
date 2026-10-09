import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function PausedTests({ subjectFilter = null, PageStatus = "home" }) {
    const navigate = useNavigate();
    const { currentSemester, user } = useAuth();
    const [pausedTests, setPausedTests] = useState([]);

    useEffect(() => {
        async function loadPausedTests() {
            try {
                // Fetch semester subjects to filter properly
                const subRes = await api.getSubjects(currentSemester?.id);
                const semesterSubjectNames = (subRes.subjects || []).map(s => s.name.toLowerCase());

                // Try fetching from backend first
                const historyRes = await api.getQuizHistory('paused');
                let paused = [];

                if (historyRes.success && Array.isArray(historyRes.history)) {
                    paused = historyRes.history.map(att => {
                        const state = att.savedState || {};
                        return {
                            quizId: att.id,
                            subject: att.subject_name || state.subject || 'Course Test',
                            testName: att.test_title || `${att.subject_name || 'Practice'} Paused Test`,
                            chapters: state.chapters || [1],
                            difficulty: state.difficulty || 'Mixed',
                            totalQuestions: att.total_questions || state.questionsCount || 10,
                            timeTaken: att.time_taken_seconds || state.timeTaken || 0,
                            answers: state.answers || {},
                            questionNumber: state.currentQuestionIndex || 0,
                            status: 'paused'
                        };
                    });
                } else if (!user) {
                    // Fallback to local storage only for guests
                    const localData = JSON.parse(localStorage.getItem("quiz")) || [];
                    paused = localData.filter(item => item.status === "paused");
                }

                // Filter by active semester subjects
                if (semesterSubjectNames.length > 0) {
                    paused = paused.filter(item => {
                        const subName = (item.subject || '').toLowerCase();
                        return semesterSubjectNames.some(sName => subName.includes(sName) || sName.includes(subName));
                    });
                }

                // Filter by specific subject if requested
                if (subjectFilter) {
                    paused = paused.filter(item => (item.subject || '').toLowerCase() === subjectFilter.toLowerCase());
                }

                setPausedTests(paused);
            } catch (err) {
                if (!user) {
                    const localData = JSON.parse(localStorage.getItem("quiz")) || [];
                    let paused = localData.filter(item => item.status === "paused");
                    if (subjectFilter) {
                        paused = paused.filter(item => (item.subject || '').toLowerCase() === subjectFilter.toLowerCase());
                    }
                    setPausedTests(paused);
                } else {
                    setPausedTests([]);
                }
            }
        }

        loadPausedTests();
    }, [currentSemester, subjectFilter, user?.id]);

    const handleResumeTest = (test) => {
        const testConfig = {
            testId: test.quizId,
            subject: test.subject,
            chapters: test.chapters,
            difficulty: test.difficulty,
            testName: test.testName,
            numOfQuestions: test.totalQuestions,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('currentTestConfig', JSON.stringify(testConfig));
        navigate(`/practise/${test.subject}/test/${test.quizId}`);
    };

    const getStatusCounts = (answers) => {
        let correct = 0, incorrect = 0, skipped = 0;
        Object.values(answers).forEach(answer => {
            if (answer.status === 'correct') correct++;
            else if (answer.status === 'incorrect') incorrect++;
            else if (answer.status === 'skip' || answer.status === 'skipped') skipped++;
        });
        return { correct, incorrect, skipped };
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
                <h5 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Paused Tests ({currentSemester?.name || 'Current Sem'})
                </h5>
                <span className="text-xs text-gray-500">{pausedTests.length} In Progress</span>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${PageStatus === 'home' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
                {pausedTests.length === 0 ? (
                    <div className="w-full col-span-full bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <FontAwesomeIcon icon={faPause} className="text-xl text-gray-400" />
                        </div>
                        <p className="text-gray-700 font-bold text-sm">No Paused Tests in {currentSemester?.name || 'this Semester'}</p>
                        <p className="text-xs text-gray-400 mt-1">Tests you pause will appear here for easy resumption.</p>
                    </div>
                ) : (
                    pausedTests.map((test) => {
                        const { correct, incorrect, skipped } = getStatusCounts(test.answers || {});
                        return (
                            <div key={test.quizId} className="bg-white border border-gray-200 rounded-2xl shadow-2xs p-4 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <h6 className="text-sm font-bold text-gray-900 truncate flex-1 pr-2">
                                        {test.testName || 'Practice Test'}
                                    </h6>
                                    <button
                                        onClick={() => handleResumeTest(test)}
                                        className="p-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition cursor-pointer flex-shrink-0"
                                        title="Resume Test"
                                    >
                                        <FontAwesomeIcon icon={faPlay} className="text-xs" />
                                    </button>
                                </div>

                                <p className="text-xs font-semibold text-gray-600 mb-3">{test.subject}</p>

                                <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                                    <span className="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-md capitalize">
                                        {test.difficulty}
                                    </span>
                                    <span className="font-semibold text-gray-700">Total: {test.totalQuestions} Qs</span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                                    <div className="flex items-center gap-2 font-medium">
                                        <span className="text-green-600 font-bold">✓ {correct}</span>
                                        <span className="text-red-500 font-bold">✗ {incorrect}</span>
                                        <span className="text-amber-500 font-bold">↷ {skipped}</span>
                                    </div>
                                    <span className="text-gray-400 text-[11px]">
                                        Q: {(test.questionNumber || 0) + 1}/{test.totalQuestions}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}