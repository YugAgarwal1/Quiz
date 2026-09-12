export default function ResultStatusDisplay({currentStatus, setCurrentStatus}) {
    // Allowed values for the status : {'all', 'correct', 'incorrect', 'skip'}
    return (
        <>
            <div className="block bg-base h-[max] w-full px-10 py-3 border border-default rounded-base shadow-xs lg:mb-3 mb-3">
                        <div className="flex items-center justify-between">
                            <h5 className="mb-3 text-2xl font-semibold tracking-tight text-heading leading-8">Status <span className="text-[15px] font-body tracking-tight text-gray-500">(Filter the Status)</span></h5>
                            {currentStatus !== 'all' && (
                                <button 
                                    className="text-gray-500 hover:text-gray-700 cursor-pointer text-2xl font-bold"
                                    onClick={() => setCurrentStatus('all')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        {/* <p className="mb-1 text-[15px] font-body tracking-tight text-heading leading-8"></p> */}
                        <div className="flex flex-wrap gap-3">
                            <span className={`flex items-center bg-base text-fg-default text-sm lg:text-md md:text-lg font-medium px-1.5 py-2 hover:rounded-3xl border border-2 rounded-3xl cursor-pointer ${currentStatus === 'correct' ? 'border-green-500' : 'border-transparent hover:border-green-500'}`}
                                  onClick={() => setCurrentStatus('correct')}>
                                <span className="h-3 w-3 bg-green-500 rounded-full me-2"></span>
                                Correct
                            </span>
                            <span className={`flex items-center bg-base text-fg-default text-sm lg:text-md md:text-lg font-medium px-1.5 py-2 hover:rounded-3xl border border-2 rounded-3xl cursor-pointer ${currentStatus === 'incorrect' ? 'border-[var(--primary-red)]' : 'border-transparent hover:border-[var(--primary-red)]'}`}
                                  onClick={() => setCurrentStatus('incorrect')}>
                                <span className="h-3 w-3 bg-[var(--primary-red)] rounded-full me-2"></span>
                                Incorrect
                            </span>
                            <span className={`flex items-center bg-base text-fg-default text-sm lg:text-md md:text-lg font-medium px-1.5 py-2 hover:rounded-3xl border border-2 rounded-3xl cursor-pointer ${currentStatus === 'skip' ? 'border-yellow-500' : 'border-transparent hover:border-yellow-500'}`}
                                  onClick={() => setCurrentStatus('skip')}>
                                <span className="h-3 w-3 bg-yellow-500 rounded-full me-2"></span>
                                Skipped
                            </span>
                            <span className="flex items-center bg-base text-fg-default text-sm lg:text-md md:text-lg font-medium px-1.5 py-2 hover:rounded-3xl border border-2 border-transparent hover:border-blue-500 cursor-pointer">
                                <span className="h-3 w-3 bg-blue-500 rounded-full me-2"></span>
                                Current
                            </span>
                        </div>
                    </div>
        </>
    );
}