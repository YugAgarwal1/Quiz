import { faArrowTrendUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
function AccuracyCard({accuracy}) {
    return (
        <>
            {/* Accuracy Card */}
            <div className="rounded-md border bg-white transition-all duration-200 border-gray-200 shadow-sm">
                <div className="sm:p-6 sm:pt-0 p-4 md:p-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div className="p-2 bg-green-100 rounded-md">
                            <FontAwesomeIcon icon={faArrowTrendUp} />
                        </div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">Accuracy</h3>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl md:text-3xl font-bold text-gray-900" data-test-id="pause-test-accuracy">{accuracy}%</span>
                        </div>
                        <div aria-valuemax="100" aria-valuemin="0" role="progressbar" data-state="indeterminate" data-max="100" className="relative w-full overflow-hidden rounded-full bg-gray-200 shadow-inner h-2.5 md:h-3">
                            <div data-state="indeterminate" data-max="100" className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-out rounded-full shadow-sm" style={{ transform: 'translateX(-70%)' }}></div>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600">Correct answers rate</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AccuracyCard