import Logo from '../images/logo.png'
import { Link, useNavigate } from 'react-router-dom'
export default function SubjectCard({subject, chapters, state, percentage}){
    const navigate = useNavigate();
    
    const handleCardClick = () => {
        navigate(`/practise/${subject}/syllabus`);
    };
    
    return (
      <>
         {/* First card code */}
         <button onClick={handleCardClick}>
             <div className='flex flex-col justify-between p-3 bg-white rounded-lg shadow-sm gap-4 cursor-pointer'>
                                {/* Details section */}
                                <div className='flex justify-between'>
                                    <div className="flex items-center gap-4">
                                        {/* Image */}
                                        <img
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
                                            src={Logo}
                                            alt="User"
                                        />
        
                                        {/* Name */}
                                        <div>
                                            <h5 className="text-lg sm:text-lg font-semibold text-heading">
                                                {subject}
                                            </h5>
                                            <p className="text-sm text-start">{chapters} Chapters</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span class="bg-neutral-primary-soft text-heading text-xs font-medium px-1.5 py-0.5 rounded">{state}</span>
                                    </div>
                                </div>
                                {/* Progress details */}
                                <div>
                                    <div class="flex justify-between mb-1">
                                        <span class="text-sm font-medium text-body">{percentage}%</span>
                                    </div>
                                    <div class="w-full bg-neutral-quaternary rounded-full h-2">
                                        <div class="bg-[var(--primary-red)] h-2 rounded-full" style={{width: `${percentage}%`}}></div>
                                    </div>
                                </div>
                            </div>
         </button>
      </>
    )
}