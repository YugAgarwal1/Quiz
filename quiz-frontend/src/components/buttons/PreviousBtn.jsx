export default function PreviousBtn({ setQuestionNumber, questionNumber, filteredIndices, onNavigate, currentQuestionId, timeSpent }) {
    const currentIndex = filteredIndices.indexOf(questionNumber);
    const hasPrevious = currentIndex > 0;

    const handlePrevious = () => {
        if (hasPrevious) {
            // Call the navigation handler to update time spent
            if (onNavigate) {
                onNavigate(currentQuestionId, timeSpent);
            }
            setQuestionNumber(filteredIndices[currentIndex - 1]);
        }
    };

    return (
        <>
            {/* PRevious button */}
            <button 
                type="button" 
                className="text-[var(--primary-red)] bg-neutral-primary border border-[var(--primary-red)] hover:bg-[var(--primary-red)] hover:text-white focus:ring-4 focus:ring-[var(--primary-red)-subtle] font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none" 
                onClick={handlePrevious}
                disabled={!hasPrevious}
            >
                Previous
            </button>
        </>
    )
}