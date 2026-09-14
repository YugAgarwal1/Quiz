import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import PausedTests from '../components/PausedTests.jsx';
import UpcomingTest from '../components/UpcomingTest.jsx';
import ChaptersAccordian from '../components/ChaptersAccordian.jsx';
import QuestionWiseChart from '../components/Question_Wise_Chart.jsx';
import TimeWiseChart from '../components/Time_Wise_Chart.jsx';
import StartModal from '../components/StartModal.jsx';
import { GetSubjectSyllabus } from '../utils/Questions.js';

export default function SyllabusPage() {
    const { subject } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('test');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState([]);
    const [subjectSyllabus, setSubjectSyllabus] = useState([]);
    const [difficulty, setDifficulty] = useState('' || 'easy');
    const [testName, setTestName] = useState('');

    const tabs = [
        { id: 'test', name: 'Test' },
        { id: 'saved', name: 'Saved' },
        { id: 'analytics', name: 'Analytics' }
    ];

    const getSectionClass = (tabId) => {
        return activeTab === tabId ? 'block md:block' : 'hidden md:block';
    };

    const formattedSubject = subject
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    function handleStartTest() {
        setModalOpen(true);
    }

    useEffect(() => {
        setSubjectSyllabus(GetSubjectSyllabus(subject));
    }, [subject]);

    return (
        <>
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <StartModal modalOpen={modalOpen} setModalOpen={setModalOpen} selectedChapter={selectedChapter} setTestName={setTestName} setDifficulty={setDifficulty} difficulty={difficulty} subject={subject}/>
                </div>
            )}

            <div className="bg-white min-h-screen lg:mt-16">
                {/* Header */}
                <Header activePage="practise" />

                {/* Mobile Tabs */}
                <div className='sticky top-[64px] bg-white border-b border-gray-200 shadow-sm md:hidden mb-8'>
                    <div className='max-w-8xl mx-auto flex justify-around items-center px-2 py-2'>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 text-center py-2 text-sm font-semibold transition-all duration-200 rounded-lg mx-1 ${activeTab === tab.id
                                        ? 'bg-[var(--primary-red)] text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Layout */}
                <div className='max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row'>

                    {/* LEFT SECTION (70% on desktop) */}
                    <div className={`w-full lg:w-[70%] pr-0 lg:pr-6 mb-6 lg:mb-0 ${getSectionClass('test')} animate-in fade-in slide-in-from-bottom-4 duration-500`}>

                        <div className='flex flex-col w-full p-5'>

                            {/* Title + Button */}
                            <div className='flex justify-between w-full mb-8 flex-wrap gap-4'>

                                <div>
                                    <h5 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-heading mb-2">
                                        {formattedSubject}
                                    </h5>
                                    <p className="text-base sm:text-lg text-gray-600">
                                        Select chapter to create your own custom test
                                    </p>
                                </div>

                                <div>
                                    <button data-modal-target="crud-modal" data-modal-toggle="crud-modal" className={`bg-[var(--primary-red)] text-white px-5 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors ${selectedChapter.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => handleStartTest()}>
                                        Start Test
                                    </button>
                                </div>
                            </div>

                            {/* Accordion */}
                            <ChaptersAccordian data={subjectSyllabus} selectedChapter={selectedChapter} setSelectedChapter={setSelectedChapter} />
                        </div>
                    </div>

                    {/* RIGHT SECTION (30% on desktop) */}
                    <div className={`w-full lg:w-[30%] ${getSectionClass('saved')} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                        <div className='w-full'>
                            <PausedTests subjectFilter={formattedSubject} />
                            <UpcomingTest />
                        </div>
                    </div>
                </div>

                {/* Analytics */}
                <div className={`sm:px-6 px-6 lg:px-20 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12 ${getSectionClass('analytics')}`}>

                    <h5 className="text-xl sm:text-2xl font-semibold text-heading mb-6">
                        Analytics
                    </h5>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <QuestionWiseChart
                            title="Question Performance"
                            labels={['Correct', 'Wrong', 'Skipped']}
                            data={[3, 7, 0]}
                        />

                        <TimeWiseChart
                            title="Time Wise Breakdown"
                            labels={['Correct', 'Wrong', 'Skipped']}
                            data={[3, 7, 0]}
                        />

                        <TimeWiseChart
                            title="Question Wise Average Time"
                            labels={['Correct', 'Wrong', 'Skipped']}
                            data={[3, 7, 0]}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}