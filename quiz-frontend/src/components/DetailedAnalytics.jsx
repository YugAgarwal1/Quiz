import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCheckCircle, faTimesCircle, faForward, faChartLine, faBullseye, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import QuestionWiseChart from './Question_Wise_Chart.jsx';
import TimeWiseChart from './Time_Wise_Chart.jsx';
import { SecondsToString } from '../utils/SeondsToMinute.js';

export default function DetailedAnalytics({ quizData, activeSection = 'all' }) {
    const rawData = quizData || {};
    const testName = rawData.testName || rawData.test_title || 'Practice Test';
    const subject = rawData.subject || rawData.subject_name || 'Subject';
    const difficulty = rawData.difficulty || 'medium';
    const chapters = rawData.chapters || [];
    const questionsList = Array.isArray(rawData.data) ? rawData.data : [];
    
    const totalQuestions = Number(rawData.totalQuestions || rawData.total_questions || questionsList.length || 0);
    const correctAnswers = Number(rawData.correctAnswers ?? rawData.correct_count ?? 0);
    const incorrectAnswers = Number(rawData.incorrectAnswers ?? rawData.incorrect_count ?? 0);
    const skipped = Number(rawData.skippedAnswers ?? rawData.skipped_count ?? Math.max(0, totalQuestions - (correctAnswers + incorrectAnswers)));
    const timeTaken = Number(rawData.timeTaken || rawData.time_taken_seconds || 0);
    const score = Number(rawData.score ?? correctAnswers * 10);
    const answers = rawData.answers || {};

    // Calculate performance metrics safely
    const totalAnswered = correctAnswers + incorrectAnswers;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : (totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0);
    const avgTimePerQuestion = totalAnswered > 0 ? Math.round(timeTaken / totalAnswered) : (totalQuestions > 0 ? Math.round(timeTaken / totalQuestions) : 0);
    const maxScore = totalQuestions > 0 ? totalQuestions * 10 : 10;
    const scorePercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    // Calculate analytics data
    const calculateAnalytics = () => {
        let correctTime = 0, incorrectTime = 0, skippedTime = 0;
        let correctCount = 0, incorrectCount = 0, skippedCount = 0;

        Object.values(answers).forEach(answer => {
            if (!answer) return;
            const timeSpent = Number(answer.timeSpent || answer.time_spent_seconds || 0);
            
            if (answer.status === 'correct' || answer.isCorrect || answer.is_correct === 1) {
                correctTime += timeSpent;
                correctCount++;
            } else if (answer.status === 'incorrect' || (answer.selectedOption && !answer.isCorrect)) {
                incorrectTime += timeSpent;
                incorrectCount++;
            } else if (answer.status === 'skip' || answer.status === 'skipped') {
                skippedTime += timeSpent;
                skippedCount++;
            }
        });

        // Use fallback if no individual times
        if (correctTime === 0 && incorrectTime === 0 && skippedTime === 0 && totalAnswered > 0) {
            const avgTime = avgTimePerQuestion;
            correctTime = correctAnswers * avgTime;
            incorrectTime = incorrectAnswers * avgTime;
            skippedTime = skipped * avgTime;
        }

        const avgCorrectTime = correctCount > 0 ? Math.round(correctTime / correctCount) : avgTimePerQuestion;
        const avgIncorrectTime = incorrectCount > 0 ? Math.round(incorrectTime / incorrectCount) : avgTimePerQuestion;
        const avgSkippedTime = skippedCount > 0 ? Math.round(skippedTime / skippedCount) : avgTimePerQuestion;

        return {
            questionPerformance: [correctAnswers, incorrectAnswers, skipped],
            timeWiseBreakdown: [correctTime, incorrectTime, skippedTime],
            questionWiseAverageTime: [avgCorrectTime, avgIncorrectTime, avgSkippedTime]
        };
    };

    const analyticsData = calculateAnalytics();

    const getDifficultyColor = (diff) => {
        switch(diff?.toLowerCase()) {
            case 'easy': return 'bg-[var(--primary-red-light)] text-[var(--primary-red)]';
            case 'medium': return 'bg-orange-100 text-orange-700';
            case 'hard': return 'bg-[var(--primary-red)] text-white';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-[var(--primary-red)]';
        if (percentage >= 60) return 'text-orange-600';
        if (percentage >= 40) return 'text-yellow-600';
        return 'text-gray-600';
    };

    const showScorecard = activeSection === 'all' || activeSection === 'scorecard';
    const showAnalytics = activeSection === 'all' || activeSection === 'analytics';

    return (
        <div className="w-full space-y-6">
            {/* 1. Scorecard Section: Quiz Overview, Performance Summary, Question Status */}
            {showScorecard && (
                <>
                    {/* Quiz Overview Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-[var(--primary-red-light)] flex items-center justify-center">
                                <FontAwesomeIcon icon={faBook} className="text-[var(--primary-red)] text-xl" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{testName}</h2>
                                <p className="text-[var(--primary-red)] font-medium">{subject}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Difficulty */}
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                                <span className="text-xs text-gray-500 mb-1">Difficulty</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getDifficultyColor(difficulty)}`}>
                                    {difficulty}
                                </span>
                            </div>

                            {/* Chapters */}
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                                <span className="text-xs text-gray-500 mb-1">Chapters</span>
                                <span className="text-lg font-bold text-gray-900">{chapters?.length || 0}</span>
                            </div>

                            {/* Total Questions */}
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                                <span className="text-xs text-gray-500 mb-1">Questions</span>
                                <span className="text-lg font-bold text-gray-900">{totalQuestions}</span>
                            </div>

                            {/* Time Taken */}
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                                <span className="text-xs text-gray-500 mb-1">Time</span>
                                <span className="text-lg font-bold text-gray-900">{SecondsToString(timeTaken)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Score Card */}
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBullseye} className="text-[var(--primary-red)]" />
                                    <span className="text-sm font-medium text-gray-600">Score</span>
                                </div>
                                <span className={`text-3xl font-bold ${getScoreColor(scorePercentage)}`}>
                                    {scorePercentage}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">{score} / {maxScore} points</span>
                                <span className="text-gray-500">Max: {maxScore}</span>
                            </div>
                        </div>

                        {/* Accuracy Card */}
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faChartLine} className="text-[var(--primary-red)]" />
                                    <span className="text-sm font-medium text-gray-600">Accuracy</span>
                                </div>
                                <span className={`text-3xl font-bold ${getScoreColor(accuracy)}`}>
                                    {accuracy}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">{correctAnswers} correct</span>
                                <span className="text-gray-500">{totalAnswered} answered</span>
                            </div>
                        </div>

                        {/* Avg Time Card */}
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faHourglassHalf} className="text-[var(--primary-red)]" />
                                    <span className="text-sm font-medium text-gray-600">Avg Time</span>
                                </div>
                                <span className="text-3xl font-bold text-gray-900">
                                    {avgTimePerQuestion}s
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Per question</span>
                                <span className="text-gray-500">{SecondsToString(timeTaken)} total</span>
                            </div>
                        </div>
                    </div>

                    {/* Question Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Correct */}
                        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Correct</h3>
                                    <p className="text-xs text-slate-500">{correctAnswers} questions</p>
                                </div>
                            </div>
                            <div className="text-3xl font-black text-emerald-600">
                                {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                            </div>
                        </div>

                        {/* Incorrect */}
                        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faTimesCircle} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Incorrect</h3>
                                    <p className="text-xs text-slate-500">{incorrectAnswers} questions</p>
                                </div>
                            </div>
                            <div className="text-3xl font-black text-rose-600">
                                {totalQuestions > 0 ? Math.round((incorrectAnswers / totalQuestions) * 100) : 0}%
                            </div>
                        </div>

                        {/* Skipped */}
                        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faForward} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Skipped</h3>
                                    <p className="text-xs text-slate-500">{skipped} questions</p>
                                </div>
                            </div>
                            <div className="text-3xl font-black text-amber-600">
                                {totalQuestions > 0 ? Math.round((skipped / totalQuestions) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* 2. Analytics Section: Charts & Detailed Breakdown */}
            {showAnalytics && (
                <>
                    {/* Analytics Charts */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Performance Analytics</h3>
                                <p className="text-xs text-gray-500">Visual breakdown of accuracy, time allocation, and question pacing</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 flex flex-col">
                                <QuestionWiseChart 
                                    title="Question Breakdown" 
                                    labels={['Correct', 'Incorrect', 'Skipped']} 
                                    data={analyticsData.questionPerformance} 
                                />
                            </div>
                            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 flex flex-col">
                                <TimeWiseChart 
                                    title="Time Allocation" 
                                    labels={['Correct', 'Incorrect', 'Skipped']} 
                                    data={analyticsData.timeWiseBreakdown} 
                                />
                            </div>
                            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 flex flex-col">
                                <TimeWiseChart 
                                    title="Avg Time / Question" 
                                    labels={['Correct', 'Incorrect', 'Skipped']} 
                                    data={analyticsData.questionWiseAverageTime} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Detailed Metrics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                                <p className="text-2xl font-black text-emerald-700">{correctAnswers}</p>
                                <p className="text-xs text-emerald-800/80 font-medium mt-0.5">Correct Answers</p>
                            </div>
                            <div className="text-center p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                                <p className="text-2xl font-black text-rose-700">{incorrectAnswers}</p>
                                <p className="text-xs text-rose-800/80 font-medium mt-0.5">Incorrect Answers</p>
                            </div>
                            <div className="text-center p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                                <p className="text-2xl font-black text-amber-700">{skipped}</p>
                                <p className="text-xs text-amber-800/80 font-medium mt-0.5">Skipped Questions</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                <p className="text-2xl font-black text-slate-800">{totalQuestions}</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Total Questions</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
