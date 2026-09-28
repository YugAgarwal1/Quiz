import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCheckCircle, faTimesCircle, faForward, faChartLine, faBullseye, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import QuestionWiseChart from './Question_Wise_Chart.jsx';
import TimeWiseChart from './Time_Wise_Chart.jsx';
import { SecondsToString } from '../utils/SeondsToMinute.js';

export default function DetailedAnalytics({ quizData }) {
    const {
        testName = 'Test',
        subject = 'Subject',
        difficulty = 'medium',
        chapters = [],
        totalQuestions = 0,
        timeTaken = 0,
        score = 0,
        correctAnswers = 0,
        incorrectAnswers = 0,
        answers = {}
    } = quizData;

    // Calculate performance metrics
    const totalAnswered = correctAnswers + incorrectAnswers;
    const skipped = totalQuestions - totalAnswered;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    const avgTimePerQuestion = totalAnswered > 0 ? Math.round(timeTaken / totalAnswered) : 0;
    const maxScore = totalQuestions * 10;
    const scorePercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    // Calculate analytics data
    const calculateAnalytics = () => {
        let correctTime = 0, incorrectTime = 0, skippedTime = 0;
        let correctCount = 0, incorrectCount = 0, skippedCount = 0;

        Object.values(answers).forEach(answer => {
            const timeSpent = answer.timeSpent || 0;
            
            if (answer.status === 'correct') {
                correctTime += timeSpent;
                correctCount++;
            } else if (answer.status === 'incorrect') {
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

    return (
        <div className="w-full space-y-6">
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
                <div className="bg-gray-50 border border-green-500 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-red)] flex items-center justify-center">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-black-700">Correct</h3>
                            <p className="text-sm text-gray-600">{correctAnswers} questions</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-500">
                        {Math.round((correctAnswers / totalQuestions) * 100)}%
                    </div>
                </div>

                {/* Incorrect */}
                <div className="bg-gray-50 border border-red-500 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-red)] flex items-center justify-center">
                            <FontAwesomeIcon icon={faTimesCircle} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-black-700">Incorrect</h3>
                            <p className="text-sm text-gray-600">{incorrectAnswers} questions</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-600">
                        {Math.round((incorrectAnswers / totalQuestions) * 100)}%
                    </div>
                </div>

                {/* Skipped */}
                <div className="bg-gray-50 border border-yellow-500 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-red)] flex items-center justify-center">
                            <FontAwesomeIcon icon={faForward} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-black-700">Skipped</h3>
                            <p className="text-sm text-gray-600">{skipped} questions</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-600">
                        {Math.round((skipped / totalQuestions) * 100)}%
                    </div>
                </div>
            </div>

            {/* Analytics Charts */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <QuestionWiseChart 
                        title="Question Performance" 
                        labels={['Correct', 'Incorrect', 'Skipped']} 
                        data={analyticsData.questionPerformance} 
                    />
                    <TimeWiseChart 
                        title="Time Wise Breakdown" 
                        labels={['Correct', 'Incorrect', 'Skipped']} 
                        data={analyticsData.timeWiseBreakdown} 
                    />
                    <TimeWiseChart 
                        title="Avg Time per Question" 
                        labels={['Correct', 'Incorrect', 'Skipped']} 
                        data={analyticsData.questionWiseAverageTime} 
                    />
                </div>
            </div>

            {/* Detailed Metrics */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{correctAnswers}</p>
                        <p className="text-xs text-gray-500">Correct Answers</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{incorrectAnswers}</p>
                        <p className="text-xs text-gray-500">Incorrect Answers</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{skipped}</p>
                        <p className="text-xs text-gray-500">Skipped Questions</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
                        <p className="text-xs text-gray-500">Total Questions</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
