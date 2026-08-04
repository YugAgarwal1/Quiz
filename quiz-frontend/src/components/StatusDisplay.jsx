export default function StatusDisplay() {
    return (
        <>
            <div className="hidden lg:block bg-base block h-[max] w-full px-10 py-3 border border-default rounded-base shadow-xs lg:mb-3 mb-3 md:hiden lg:block">
                        <h5 className="mb-1 text-2xl font-semibold tracking-tight text-heading leading-8">Status : </h5>
                        <div className="flex flex-wrap gap-3">
                            <span className="flex items-center bg-base text-fg-default text-sm lg:text-md md:text-lg font-medium px-1.5 py-2 rounded">
                                <span className="h-3 w-3 bg-green-500 rounded-full me-2"></span>
                                Correct
                            </span>
                            <span className="flex items-center bg-base text-fg-default text-sm lg:text-md md:text-lg font-medium px-1.5 py-2 rounded">
                                <span className="h-3 w-3 bg-[var(--primary-red)] rounded-full me-2"></span>
                                Incorrect
                            </span>
                            <span className="flex items-center bg-base text-fg-default text-sm lg:text-md md:text-lg font-medium px-1.5 py-2 rounded">
                                <span className="h-3 w-3 bg-yellow-500 rounded-full me-2"></span>
                                Skipped
                            </span>
                            <span className="flex items-center bg-base text-fg-default text-sm lg:text-md md:text-lg font-medium px-1.5 py-2 rounded">
                                <span className="h-3 w-3 bg-blue-500 rounded-full me-2"></span>
                                Current
                            </span>
                        </div>
                    </div>
        </>
    );
}