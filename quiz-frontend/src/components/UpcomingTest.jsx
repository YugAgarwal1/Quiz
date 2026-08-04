import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

export default function UpcomingTest() {
    return (
       <>
         {/* Saved Tests */}
            <div className='mt-8'>
                {/* Title */}
                <div>
                    <h5 className="text-xl sm:text-2xl font-semibold text-heading">
                        Upcoming Tests
                    </h5>
                </div>
                {/* Tests List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <div className="w-full flex flex-col items-center justify-center py-12 text-center md:col-span-2 lg:col-span-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faCalendar} className='text-3xl text-gray-400' />
                        </div>
                        <p className="text-gray-600 font-medium">No Upcoming Tests</p>
                        <p className="text-sm text-gray-400 mt-1">Start a test to see it here</p>
                    </div>
                </div>
            </div>
       </>
    );
}