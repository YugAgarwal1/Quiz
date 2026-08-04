import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function StartModal({ modalOpen, setModalOpen, selectedChapter, setTestName, setDifficulty, difficulty,subject }) {
    const navigate = useNavigate();
    function getNumberOfQuestion(difficulty){
            if(difficulty.toLowerCase() === 'easy'){
                return 10;
            }else if(difficulty.toLowerCase() === 'medium'){
                return 25;
            }else if(difficulty.toLowerCase() === 'hard'){
                return 25;
            }
    }
    function handleModalStart(e) {
        e.preventDefault(); // Prevent form submission
        
        // Create test configuration object
        const testConfig = {
            testId: uuidv4(),
            subject: subject,
            chapters: selectedChapter,
            difficulty: localDifficulty,
            testName: localTestName,
            numOfQuestions: getNumberOfQuestion(localDifficulty),
            createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('currentTestConfig', JSON.stringify(testConfig));
        
        // Update parent state
        setModalOpen(false);
        setTestName(localTestName);
        setDifficulty(localDifficulty);
        
        // Navigate without state
        navigate(`/practise/${subject}/test/${testConfig.testId}`);
    }
    const [localTestName, setLocalTestName] = useState('');
    const [localDifficulty, setLocalDifficulty] = useState('easy');
    return (
        <>
            {/* <!-- Main modal --> */}
            <div id="crud-modal" tabIndex="-1" aria-hidden="true" className={`${modalOpen ? '' : 'hidden'} overflow-y-auto overflow-x-hidden w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
                <div className="relative p-4 w-full max-w-md max-h-full">
                    {/* <!-- Modal content --> */}
                    <div className="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
                        {/* <!-- Modal header --> */}
                        <div className="flex items-center justify-between border-b border-default pb-4 md:pb-5">
                            <h3 className="text-lg font-medium text-heading">
                                Select Test Details
                            </h3>
                            <button type="button" className="text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center" data-modal-hide="crud-modal"
                                onClick={() => setModalOpen(false)}
                            >
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" /></svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/* <!-- Modal body --> */}
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="grid gap-4 grid-cols-2 py-4 md:py-6">
                                <div className="col-span-2">
                                    <label htmlFor="name" className="block mb-2.5 text-sm font-medium text-heading">Name</label>
                                    <input type="text" name="name" id="name" className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body" placeholder="Type test name" required=""
                                     onChange={(e) => setLocalTestName(e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="category" className="block mb-2.5 text-sm font-medium text-heading">Select Difficulty</label>
                                    <select id="category" className="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand px-3 py-2.5 shadow-xs placeholder:text-body"
                                     onChange={(e) => setLocalDifficulty(e.target.value)}>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                {/* Selected Chapters */}
                                <div className="col-span-2">
                                    <label htmlFor="name" className="block mb-2.5 text-sm font-medium text-heading">Selected Chapters</label>
                                    <div className="flex flex-wrap">
                                         {
                                        selectedChapter?.map((chapter) => (
                                            <div key={chapter} className="items-center px-2 py-2">
                                                <button className="cursor-pointer">
                                                    <span className={`h-10 w-10 rounded-full flex items-center justify-center text-sm bg-yellow-400`}>
                                                        {chapter}
                                                    </span>
                                                </button>
                                            </div>
                                        ))
                                    }
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 border-t border-default pt-4 md:pt-6">
                                <button type="button" className="inline-flex items-center  text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none" onClick={(e) => {
                                    handleModalStart(e);
                                }}>
                                    Start Test
                                </button>
                                <button data-modal-hide="crud-modal" type="button" className="text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none" onClick={() => setModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </>
    )
}