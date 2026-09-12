import { useLocation, useNavigate } from 'react-router-dom';
import Quiz_Nav from "../components/Quiz_Nav";
import DifficultyBadge from "../components/DifficultyBadge";
import { GiveSetOfQuestions } from "../utils/Questions.js";
import { useEffect, useState } from "react";
import StatusDisplay from "../components/StatusDisplay";
import PreviousBtn from "../components/buttons/PreviousBtn.jsx";
import SkipBtn from "../components/buttons/SkipBtn.jsx";
import EndTestBtn from "../components/buttons/EndTestBtn.jsx";
import NextBtn from "../components/buttons/NextBtn.jsx";
import { SecondsToString } from "../utils/SeondsToMinute.js";
import PauseTestBtn from "../components/buttons/PauseTestBtn.jsx";
import ResultStatusDisplay from '../components/ResultStatusDisplay.jsx';

export default function QuizPage() {

    const navigate = useNavigate();
    const location = useLocation();

    const isResultPage = location.pathname.includes("result");

    const testConfig = JSON.parse(localStorage.getItem('currentTestConfig')) || {};
    const {
        subject = "Adv Java",
        chapters = [1, 2],
        difficulty = "easy",
        testName = "Practice Test",
        numOfQuestions = 50,
        testId = ''
    } = testConfig;

    //  setNumOfQuestionsState, 
    const [numOfQuestionsState, setNumOfQuestionsState] = useState(0);
    const [timeTakenState, setTimeTakenState] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [score, setScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState({});
    const [answers, setAnswers] = useState({});
    const [data, setData] = useState([]);
    const [isResumed, setIsResumed] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('all');

    // ⏱ Timer (disable in result page)
    useEffect(() => {
        if (isResultPage) return;

        const interval = setInterval(() => {
            setTimeTakenState(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isResultPage]);

    // Load from localStorage
    useEffect(() => {
        const existingData = JSON.parse(localStorage.getItem("quiz")) || [];
        const found = existingData.find(item => item.quizId === testId);

        if (found) {
            // remove only if NOT result page
            if (!isResultPage) {
                const updated = existingData.filter(item => item.quizId !== testId);
                localStorage.setItem("quiz", JSON.stringify(updated));
            }
            
            setNumOfQuestionsState(found.totalQuestions);
            setTimeTakenState(found.timeTaken);
            setCorrectAnswers(found.correctAnswers);
            setIncorrectAnswers(found.incorrectAnswers);
            setQuestionNumber(found.questionNumber || 0);
            setScore(found.score);
            setCurrentQuestion(found.currentQuestion || {});
            setAnswers(found.answers || {});
            setData(found.data || []);

            setIsResumed(true);
        } else {
            setNumOfQuestionsState(numOfQuestions);
        }
    }, [testId, numOfQuestions, isResultPage]);

    // Generate questions
    useEffect(() => {
        if (isResumed) return;

        if (numOfQuestionsState > 0) {
            const questions = GiveSetOfQuestions(subject, chapters, difficulty, numOfQuestionsState);
            setData(questions);
        }
    }, [subject, difficulty, numOfQuestionsState, isResumed]);

    // Set current question
    useEffect(() => {
        if (data.length > 0) {
            setCurrentQuestion(data[questionNumber]);
        }
    }, [data, questionNumber]);

    // Initialize answers
    useEffect(() => {
        if (isResumed) return;

        if (data.length > 0) {
            const initialAnswers = {};
            data.forEach((q) => {
                initialAnswers[q.id] = {
                    selectedOption: null,
                    status: "unvisited"
                };
            });
            setAnswers(initialAnswers);
        }
    }, [data, isResumed]);

    function OptionFunction(option) {
        if (isResultPage) return;

        if (answers[currentQuestion.id]?.status === "incorrect" || answers[currentQuestion.id]?.status == "correct") {
            return;
        }

        const status = currentQuestion.answer == option ? "correct" : "incorrect";

        if (status == "correct") {
            setCorrectAnswers(prev => prev + 1);
            setScore(prev => prev + 10);
        } else {
            setIncorrectAnswers(prev => prev + 1);
        }

        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: {
                selectedOption: option,
                status: status
            }
        }));
    }

    function selectedColor(option) {
        if (answers[currentQuestion.id]?.status == "unvisited" || answers[currentQuestion.id]?.status == "skip") {
            return "bg-gray-200 border border-gray-300";
        }
        else if (option == currentQuestion.answer) {
            return "bg-green-200 border border-green-300";
        }
        else if (option == answers[currentQuestion.id]?.selectedOption) {
            return "bg-red-200 border border-red-300";
        }
        return "bg-gray-200 border border-gray-300";
    }

    function badgeColor(i) {
        const id = data[i]?.id;
        const status = answers[id]?.status;
        if (status == "correct") return "bg-green-500";
        if (status == "incorrect") return "bg-red-500";
        if (status == "skip") return "bg-yellow-500";
        return "bg-gray-200";
    }

    function storeToLocalStorage(obj) {
        const existing = JSON.parse(localStorage.getItem("quiz")) || [];
        const updated = existing.filter(item => item.quizId !== testId);
        updated.push(obj);
        localStorage.setItem("quiz", JSON.stringify(updated));
    }

    function endTestObject(status) {
        const obj = {
            quizId: testId,
            score,
            answers,
            subject,
            chapters,
            data,
            difficulty,
            correctAnswers,
            incorrectAnswers,
            totalQuestions: data.length,
            timeTaken: timeTakenState,
            questionNumber,
            currentQuestion,
            status
        };

        storeToLocalStorage(obj);

        if (status === "completed") {
            navigate(`/practise/${subject}/test/${testId}/result`);
        } else {
            navigate(`/practise/${subject}/syllabus`);
        }
    }

    // Filter question indices based on current status
    const filteredIndices = data
        .map((q, i) => ({ index: i, status: answers[q.id]?.status }))
        .filter(item => {
            if (currentStatus === 'all') return true;
            if (currentStatus === 'skip') return item.status === 'skip' || item.status === 'skipped';
            return item.status === currentStatus;
        })
        .map(item => item.index);

    return (
         <>
           {isResultPage ? null : <Quiz_Nav title={`${subject} - ${testName}`} />}
            <div className="w-full px-2 py-4 gap-4 flex flex-col lg:flex-row md:flex-col lg:px-10 md:px-5">

                <div className="w-full lg:w-[30%] md:w-full">

                    {/* Return the interactive status display if result page for the filer option */}
                    {isResultPage ? 
                        <ResultStatusDisplay currentStatus={currentStatus} setCurrentStatus={setCurrentStatus} /> : 
                        <StatusDisplay/>
                    }

                    <div className="bg-neutral-primary-soft block h-[max-content] w-full px-2 py-5 border border-default rounded-base shadow-xs">
                        <h5 className="mb-1 text-2xl font-semibold tracking-tight text-heading leading-8">Question : </h5>
                        <div className="w-full py-4 flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-x-hidden md:overflow-y-auto h-[max-content] md:h-[max-content]">

                            {filteredIndices.map((actualIndex) => (
                                <div key={actualIndex} className="flex-shrink-0 md:flex-shrink flex items-center px-2 py-2">
                                    <button className="cursor-pointer">
                                        <span className={`h-10 w-10 rounded-full flex items-center justify-center text-sm
                                            ${actualIndex == questionNumber ? 'bg-brand' : badgeColor(actualIndex)}`}
                                            onClick={() => setQuestionNumber(actualIndex)}
                                        >
                                            {actualIndex + 1}
                                        </span>
                                    </button>
                                </div>
                            ))}

                        </div>
                    </div>

                </div>

                <div className="w-full lg:w-[70%] md:w-full">

                    <div className="flex flex-col sm:flex-row justify-between items-center border border-default rounded-base shadow-xs px-2 mb-2 md:mb-4 lg:mb-6 pb-3 lg:pb-1 md:pb-1">

                        <div className="bg-neutral-primary-soft block px-10 py-5">
                            <h5 className="text-2xl font-[400] tracking-tight text-[var(--primary-red)]">
                                Time Taken : <span className="text-black font-normal">{SecondsToString(timeTakenState)}</span>
                            </h5>
                        </div>

                        <div className="flex items-center gap-6">
                            {filteredIndices.length > 0 && <PreviousBtn setQuestionNumber={setQuestionNumber} questionNumber={questionNumber} filteredIndices={filteredIndices} />}
                            {questionNumber < data.length - 1 && answers[currentQuestion.id]?.status == "unvisited" &&
                                <SkipBtn setQuestionNumber={setQuestionNumber} answers={answers} id={data[questionNumber].id} />}
                            {filteredIndices.length > 0 && <NextBtn setQuestionNumber={setQuestionNumber} questionNumber={questionNumber} filteredIndices={filteredIndices} />}
                        </div>

                    </div>

                    <div className="col-span-9 my-1 px-3 md:px-5 pt-2 pb-28 md:py-3 border border-default rounded-base shadow-xs">

                        <div className="mb-6 md:mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-lg md:text-xl font-medium text-gray-800 mr-2">
                                        Q.{questionNumber + 1}
                                    </span>
                                </div>
                                <DifficultyBadge difficulty="easy" />
                            </div>

                            <p className="mt-3 text-base md:text-lg leading-relaxed">
                                {currentQuestion?.question}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {currentQuestion?.options?.map((option, index) => (
                                <div key={index}
                                    className={`p-3 md:p-4 border border-black rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[var(--primary-red)] ${selectedColor(option)}`}
                                    onClick={() => OptionFunction(option)}>
                                    ({String.fromCharCode(65 + index)}) {option}
                                </div>
                            ))}
                        </div>

                        {isResultPage ? null : <PauseTestBtn onClick={() => endTestObject("paused")} /> }
                        {
                            isResultPage ? null  
                            : questionNumber == numOfQuestionsState - 1 &&
                            <EndTestBtn onClick={() => endTestObject("completed")} />
                        }

                    </div>
                </div>
            </div>
        </>
    );
}