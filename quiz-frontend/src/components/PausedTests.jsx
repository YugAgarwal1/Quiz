import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPauseCircle, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PausedTests({ subjectFilter = null, PageStatus = "home" }) {
    const navigate = useNavigate();
    const [pausedTests, setPausedTests] = useState([]);

    useEffect(() => {
        const existingData = JSON.parse(localStorage.getItem("quiz")) || [];
        let paused = existingData.filter(item => item.status === "paused");
        
        // Filter by subject if subjectFilter is provided
        if (subjectFilter) {
            paused = paused.filter(item => item.subject === subjectFilter);
        }
        
        setPausedTests(paused);
    }, [subjectFilter]);

    const handleResumeTest = (test) => {
        // Restore test config
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
       <>
         {/* Saved Tests */}
            <div className='mt-8'>
                {/* Title */}
                <div>
                    <h5 className="text-xl sm:text-2xl font-semibold text-heading mb-2">
                        Paused Tests
                    </h5>
                </div>
                {/* Tests List */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 ${(PageStatus === 'home' ? 'lg:grid-cols-3' : 'lg:grid-cols-1')}`}>
                    {pausedTests.length === 0 ? (
                        <div className="w-full flex flex-col items-center justify-center py-12 text-center sm:col-span-2 lg:col-span-3">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <FontAwesomeIcon icon={faPause} className='text-3xl text-gray-400' />
                            </div>
                            <p className="text-gray-600 font-medium">No Paused Tests</p>
                            <p className="text-sm text-gray-400 mt-1">Start a test to see it here</p>
                        </div>
                    ) : (
                        pausedTests.map((test) => {
                            const { correct, incorrect, skipped } = getStatusCounts(test.answers || {});
                            return (
                                <div key={test.quizId} className="bg-neutral-primary-soft border border-default rounded-base shadow-xs p-3 sm:p-4 hover:shadow-md transition-shadow">
                                    {/* Header: Test Name and Pause Icon */}
                                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                                        <h6 className="text-base sm:text-lg font-semibold text-heading truncate flex-1 pr-2">{test.testName || 'Untitled Test'}</h6>
                                        <FontAwesomeIcon icon={faPlay} className='text-[var(--primary-red)] ml-2 cursor-pointer text-lg sm:text-xl flex-shrink-0' onClick={() => handleResumeTest(test)}/>
                                    </div>

                                    {/* Subject Name */}
                                    <p className="text-xs sm:text-sm text-gray-600 mb-2">{test.subject}</p>

                                    {/* Left: Difficulty and Chapters | Right: Total Questions */}
                                    <div className="flex items-center justify-between mb-2 sm:mb-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <span className="bg-gray-200 px-2 py-1 rounded-full capitalize text-xs">{test.difficulty}</span>
                                            <span className="hidden sm:inline">{test.chapters?.length || 0} Chapters</span>
                                            <span className="sm:hidden">{test.chapters?.length || 0} Ch</span>
                                        </div>
                                        <span className="font-medium text-xs">Total: {test.totalQuestions}</span>
                                    </div>

                                    {/* Status Pills with Counts */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <span className="bg-green-500 text-white text-sm sm:text-xl px-[4px] sm:px-[6px] py-[4px] sm:py-[6px] rounded-full">
                                            </span>
                                            <span className="text-xs sm:text-sm font-medium">{correct}</span>
                                            <span className="bg-red-500 text-white text-sm sm:text-xl px-[4px] sm:px-[6px] py-[4px] sm:py-[6px] rounded-full"> 
                                            </span>
                                            <span className="text-xs sm:text-sm font-medium">{incorrect}</span>
                                            <span className="bg-yellow-500 text-white text-sm sm:text-xl px-[4px] sm:px-[6px] py-[4px] sm:py-[6px] rounded-full">                                      
                                            </span>
                                            <span className="text-xs sm:text-sm font-medium">{skipped}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            Q: {test.questionNumber + 1}/{test.totalQuestions}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
       </>
    );
}