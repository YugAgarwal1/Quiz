export default function SkipBtn({setQuestionNumber, onSkip, id, timeSpent}) {
    const handleSkip = () => {
        setQuestionNumber(prev => prev + 1);
        if (onSkip) {
            onSkip(id, timeSpent);
        }
    }
    return (
        <>
        {/* Skip button */}
        <button type="button" className="text-[var(--primary-red)] bg-neutral-primary border border-[var(--primary-red)] hover:bg-[var(--primary-red)] hover:text-white focus:ring-4 focus:ring-[var(--primary-red)-subtle] font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none" onClick={handleSkip}>Skip</button>
        </>
    )
}