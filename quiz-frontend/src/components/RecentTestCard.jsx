import { useNavigate } from 'react-router-dom';

export default function RecentTestCard({ 
    testName = 'Completed Test', 
    subject = 'Subject', 
    difficulty = 'medium',
    chapters = [], 
    totalQuestions = 10,
    correct = 0, 
    incorrect = 0, 
    skipped = 0,
    timeTaken = 0,
    score = 0,
    quizId
}) {
    
    const navigate = useNavigate();
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const handleCardClick = () => {
        if (quizId) {
            navigate(`/practise/${subject}/test/${quizId}/result`);
        }
    };

    return (
        <div className="bg-neutral-primary-soft border border-default rounded-base shadow-xs p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}>
            {/* Header: Test Name and Time Taken */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h6 className="text-base sm:text-lg font-semibold text-heading truncate flex-1 pr-2">{testName}</h6>
                <span className="text-xs sm:text-sm text-gray-500 font-medium flex-shrink-0">
                    {formatTime(timeTaken)}
                </span>
            </div>

            {/* Subject Name */}
            <p className="text-xs sm:text-sm text-gray-600 mb-2">{subject}</p>

            {/* Left: Difficulty and Chapters | Right: Total Questions */}
            <div className="flex items-center justify-between mb-2 sm:mb-3 text-xs text-gray-500">
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="bg-gray-200 px-2 py-1 rounded-full capitalize text-xs">{difficulty}</span>
                    <span className="hidden sm:inline">{chapters?.length || 0} Chapters</span>
                    <span className="sm:hidden">{chapters?.length || 0} Ch</span>
                </div>
                <span className="font-medium text-xs">Total: {totalQuestions}</span>
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
                    Score: {score}
                </span>
            </div>
        </div>
    )
}