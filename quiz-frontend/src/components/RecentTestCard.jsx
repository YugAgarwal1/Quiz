export default function RecentTestCard({ subject, chapters, score = 3, correct = 3, wrong = 7, skipped = 0 }) {
    return (
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">

            {/* Top Section */}
            <div className="flex justify-between items-start">

                {/* Left */}
                <div>
                    <h5 className="text-lg font-semibold text-heading">
                        {subject}
                    </h5>
                    <p className="text-sm text-gray-500 mt-1">
                        Study Link
                    </p>

                    <div className="mt-3 flex justify-evenly flex-wrap gap-4">
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded-md">
                            {chapters} Questions
                        </span>
                        {/* Tag */}
                        <div>
                            <span className="text-sm px-3 py-1 rounded-md bg-purple-100 text-purple-600">
                                {subject}
                            </span>
                        </div>
                    </div>

                </div>

                {/* Right (Score) */}
                <div className="text-right">
                    <p className="text-sm text-gray-500">Score</p>
                    <h2 className="text-xl text-heading">
                        {score}
                    </h2>
                </div>
            </div>

            {/* Middle Divider */}
            <div className="my-4"></div>

            {/* Bottom Section */}
            <div className="flex justify-between items-center flex-wrap">

                {/* Stats */}
                <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {correct} Correct
                    </span>

                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {wrong} Wrong
                    </span>

                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        {skipped} Skipped
                    </span>
                </div>
            </div>
        </div>
    )
}