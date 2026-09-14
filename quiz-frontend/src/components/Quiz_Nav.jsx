import '../styles/custom.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'

export default function Quiz_Nav({ title, endTestOnPause }) {
    const navigate = useNavigate();
    function markTestAsPaused() {
        if (endTestOnPause) {
            endTestOnPause("paused");  // status 'pause' represent to be stored in the localstorage
            navigate(-1);
        }
    }
    return (
        <>
            <div className="bg-[var(--primary-red)] h-[70px] w-full">
                <div className="flex items-center justify-start h-full px-5 sm:px-8 md:px-10">
                    
                    {/* Back Button */}
                    <FontAwesomeIcon 
                        icon={faArrowLeft} 
                        onClick={() => markTestAsPaused()}
                        className="text-white text-xl sm:text-2xl cursor-pointer mr-4"
                    />
                    {/* Title */}
                    <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold">
                        {title}
                    </p>

                </div>
            </div>
        </>
    );
}