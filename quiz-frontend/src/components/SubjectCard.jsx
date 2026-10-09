import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faArrowRight, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

export default function SubjectCard({ subject, chapters = 5, state = 'Active' }) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/practise/${encodeURIComponent(subject)}/syllabus`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="w-full bg-white hover:bg-red-50/20 border border-gray-200 hover:border-red-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
        >
            {/* Top Row: Icon + Subject Title & Badge */}
            <div className="flex items-start gap-3.5 mb-4">
                {/* Subject Icon Box */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <FontAwesomeIcon icon={faBookOpen} />
                </div>

                {/* Subject Info (flex-1 with min-w-0 prevents text overflow) */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Course Module
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md border border-emerald-200 flex-shrink-0">
                            {state}
                        </span>
                    </div>

                    <h5 className="text-base sm:text-lg font-bold text-gray-900 mt-1 leading-snug break-words group-hover:text-red-600 transition-colors">
                        {subject}
                    </h5>
                </div>
            </div>

            {/* Bottom Row: Chapters Count & Action CTA */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5 font-medium text-gray-600">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-red-500" />
                    <span>{chapters} Chapters</span>
                </div>

                <div className="flex items-center gap-1 font-bold text-red-600 group-hover:translate-x-1 transition-transform">
                    <span>View Syllabus</span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </div>
            </div>
        </div>
    );
}