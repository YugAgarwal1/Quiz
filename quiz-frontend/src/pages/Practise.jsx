import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import SubjectCard from '../components/SubjectCard.jsx';
import RecentTestCard from '../components/RecentTestCard.jsx';
import QuestionWiseChart from '../components/Question_Wise_Chart.jsx';
import TimeWiseChart from '../components/Time_Wise_Chart.jsx';
import ChapterData from '../json/ChapterData.json';

export default function Practise() {
    const [activeTab, setActiveTab] = useState('subjects');
    const [completedTests, setCompletedTests] = useState([]);

    useEffect(() => {
        const existingData = JSON.parse(localStorage.getItem("quiz")) || [];
        const completed = existingData.filter(item => item.status === "completed");
        setCompletedTests(completed);
    }, []);

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

    // Helper function to handle conditional visibility
    const getSectionClass = (tabId) => {
        return activeTab === tabId ? 'block md:block' : 'hidden md:block';
    };

    return (
        <div className="bg-slate-50 min-h-screen mt-20">
            {/* Header section */}
            <Header activePage="practise"/>

            {/* Sub-Navbar: Only visible on mobile (hidden from md upwards) */}
            <div className='sticky top-[64px] z-20 bg-white border-b border-gray-200 shadow-sm md:hidden'>
                <div className='max-w-8xl mx-auto flex justify-around items-center px-2 py-2'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 text-center py-2 text-sm font-semibold transition-all duration-200 rounded-lg mx-1 ${
                                activeTab === tab.id 
                                ? 'bg-[var(--primary-red)] text-white shadow-md' 
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>

                {/* 1. Subjects Section */}
                <div className={`${getSectionClass('subjects')} animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12`}>
                    <h5 className="text-xl sm:text-2xl font-semibold text-heading mb-6">
                        My Subjects
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ChapterData.map((subject) => (
                            <SubjectCard 
                                key={subject.SubjectID}
                                subject={subject.Subject}
                                chapters={subject.Chapters.length}
                                state="Active"
                                percentage={0}
                            />
                        ))}
                    </div>
                </div>

                {/* 2. Recent Tests Section */}
                <div className={`${getSectionClass('recent-tests')} animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12`}>
                    <h5 className="text-xl sm:text-2xl font-semibold text-heading mb-2">
                        Recent Performance
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {completedTests.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <span className="text-3xl text-gray-400">📊</span>
                                </div>
                                <p className="text-gray-600 font-medium">No Completed Tests</p>
                                <p className="text-sm text-gray-400 mt-1">Complete a test to see it here</p>
                            </div>
                        ) : (
                            completedTests.map((test) => {
                                const { correct, incorrect, skipped } = getStatusCounts(test.answers || {});
                                
                                return (
                                    <RecentTestCard
                                        key={test.quizId}
                                        quizId={test.quizId}
                                        testName={test.testName || 'Completed Test'}
                                        subject={test.subject}
                                        difficulty={test.difficulty}
                                        chapters={test.chapters}
                                        totalQuestions={test.totalQuestions}
                                        correct={correct}
                                        incorrect={incorrect}
                                        skipped={skipped}
                                        timeTaken={test.timeTaken}
                                        score={test.score}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 3. Analytics Section */}
                <div className={`${getSectionClass('analytics')} animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12`}>
                    <h5 className="text-xl sm:text-2xl font-semibold text-heading mb-6">
                        Analytics
                    </h5>
                    <div className="flex justify-between flex-wrap">
                        <QuestionWiseChart title="Question Performance" labels={['Correct', 'Wrong', 'Skipped']} data={[3, 7, 0]} />
                        <TimeWiseChart title="Time Wise Breakdown" labels={['Correct', 'Wrong', 'Skipped']} data={[3, 7, 0]} /> 
                        <TimeWiseChart title="Question Wise Average Time" labels={['Correct', 'Wrong', 'Skipped']} data={[3, 7, 0]} />  
                    </div>
                </div>


            </div>
        </div>
    );
}