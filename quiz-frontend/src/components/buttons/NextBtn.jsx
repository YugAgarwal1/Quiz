export default function NextBtn({ setQuestionNumber, questionNumber, filteredIndices }) {
    const currentIndex = filteredIndices.indexOf(questionNumber);
    const hasNext = currentIndex < filteredIndices.length - 1;

    const handleNext = () => {
        if (hasNext) {
            setQuestionNumber(filteredIndices[currentIndex + 1]);
        }
    };

    return (
        <>
            {/* Next button */}
            <button 
                type="button" 
                className="text-[var(--primary-red)] bg-neutral-primary border border-[var(--primary-red)] hover:bg-[var(--primary-red)] hover:text-white focus:ring-4 focus:ring-[var(--primary-red)-subtle] font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none" 
                onClick={handleNext}
                disabled={!hasNext}
            >
                Next
            </button>
        </>
    )
}