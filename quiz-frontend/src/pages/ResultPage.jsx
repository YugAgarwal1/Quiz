import { useState } from 'react';
import QuizPage from "./QuizPage";
import Header from '../components/Header.jsx';

export default function ResultPage() {
    const [activeTab, setActiveTab] = useState('analytics');

    const tabs = [
        { id: 'analytics', name: 'Analytics' },
        { id: 'quiz', name: 'Quiz' }
    ];

    const getSectionClass = (tabId) => {
        return activeTab === tabId ? 'block md:block' : 'hidden md:block';
    };

    return (
        <>
            <div className="bg-white min-h-screen lg:mt-16">
                {/* Header */}
                <Header activePage="practise" />

                {/* Mobile Tabs */}
                <div className='sticky top-[64px] bg-white border-b border-gray-200 shadow-sm md:hidden mb-8'>
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

                    {/* LEFT SECTION - Desktop Tabs (30% on desktop) */}
                    <div className='w-full lg:w-[20%] pr-0 lg:pr-6 mb-6 lg:mb-0 hidden lg:block'>
                        <div className='flex flex-col gap-2'>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-[var(--primary-red)] text-white shadow-md'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SECTION - Content (70% on desktop) */}
                    <div className='w-full lg:w-[100%]'>

                        {/* Analytics Section */}
                        <div className={`${getSectionClass('analytics')} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                            <div className='flex flex-col w-full p-5'>
                                <h5 className="text-2xl sm:text-2xl lg:text-3xl font-semibold text-heading mb-6">
                                    Analytics
                                </h5>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                                    <p className="text-xl text-gray-600">This is an analytics page</p>
                                </div>
                            </div>
                        </div>

                        {/* Quiz Section */}
                        <div className={`${getSectionClass('quiz')} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                            <div className='flex flex-col w-full p-5'>
                                <h5 className="text-2xl sm:text-2xl lg:text-3xl font-semibold text-heading mb-6">
                                    Quiz
                                </h5>
                                <QuizPage />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}