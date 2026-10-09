import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Quiz_Nav from "../components/Quiz_Nav";
import DifficultyBadge from "../components/DifficultyBadge";
import { GiveSetOfQuestions, FetchQuestionsFromApi } from "../utils/Questions.js";
import { useEffect, useState, useRef, useMemo } from "react";
import StatusDisplay from "../components/StatusDisplay";
import PreviousBtn from "../components/buttons/PreviousBtn.jsx";
import SkipBtn from "../components/buttons/SkipBtn.jsx";
import EndTestBtn from "../components/buttons/EndTestBtn.jsx";
import NextBtn from "../components/buttons/NextBtn.jsx";
import { SecondsToString } from "../utils/SeondsToMinute.js";
import PauseTestBtn from "../components/buttons/PauseTestBtn.jsx";
import ResultStatusDisplay from '../components/ResultStatusDisplay.jsx';
import api from '../services/api.js';

export default function QuizPage({ testIdProp, quizDataProp }) {
    const navigate = useNavigate();
    const location = useLocation();
    const routeParams = useParams();

    const isResultPage = location.pathname.includes("result");

    const testConfig = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('currentTestConfig')) || {};
        } catch {
            return {};
        }
    }, []);

    const effectiveTestId = testIdProp || routeParams.testId || testConfig.testId || '';

    const {
        subject = routeParams.subject || "Adv Java",
        chapters = [1, 2],
        difficulty = "easy",
        testName = "Practice Test",
        numOfQuestions = 10
    } = testConfig;

    const chaptersKey = useMemo(() => {
        return Array.isArray(chapters) ? chapters.join(',') : String(chapters || '');
    }, [chapters]);

    const [numOfQuestionsState, setNumOfQuestionsState] = useState(numOfQuestions || 10);
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
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    
    const questionsLoadedRef = useRef(false);

    // ⏱ Timer (disable in result page)
    useEffect(() => {
        if (isResultPage) return;

        const interval = setInterval(() => {
            setTimeTakenState(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isResultPage]);

    // Handle quizDataProp if provided directly
    useEffect(() => {
        if (quizDataProp && quizDataProp.data && quizDataProp.data.length > 0) {
            setNumOfQuestionsState(quizDataProp.totalQuestions || quizDataProp.data.length);
            setTimeTakenState(quizDataProp.timeTaken || 0);
            setCorrectAnswers(quizDataProp.correctAnswers || 0);
            setIncorrectAnswers(quizDataProp.incorrectAnswers || 0);
            setScore(quizDataProp.score || 0);
            setData(quizDataProp.data);
            setCurrentQuestion(quizDataProp.data[0] || {});
            setAnswers(quizDataProp.answers || {});
            setIsResumed(true);
            questionsLoadedRef.current = true;
        }
    }, [quizDataProp]);

    // Load from localStorage or API if needed
    useEffect(() => {
        if (quizDataProp && quizDataProp.data && quizDataProp.data.length > 0) return;

        const existingData = JSON.parse(localStorage.getItem("quiz")) || [];
        const found = existingData.find(item => String(item.quizId) === String(effectiveTestId));

        if (found && found.data && found.data.length > 0) {
            if (!isResultPage) {
                const updated = existingData.filter(item => String(item.quizId) !== String(effectiveTestId));
                localStorage.setItem("quiz", JSON.stringify(updated));
            }
            
            setNumOfQuestionsState(found.totalQuestions || found.data.length);
            setTimeTakenState(found.timeTaken || 0);
            setCorrectAnswers(found.correctAnswers || 0);
            setIncorrectAnswers(found.incorrectAnswers || 0);
            setQuestionNumber(found.questionNumber || 0);
            setScore(found.score || 0);
            setCurrentQuestion(found.currentQuestion || found.data[0] || {});
            setAnswers(found.answers || {});
            setData(found.data || []);

            setIsResumed(true);
            questionsLoadedRef.current = true;
        } else if (isResultPage && effectiveTestId) {
            // Fetch from backend for result view
            api.getAttemptById(effectiveTestId).then(res => {
                if (res && res.success && res.attempt) {
                    const att = res.attempt;
                    const answersMap = {};
                    const questionsList = [];

                    (att.detailedAnswers || []).forEach((ans, idx) => {
                        const qId = ans.question_id || idx + 1;
                        const isCorrect = ans.is_correct === 1;
                        const status = isCorrect ? 'correct' : (ans.status === 'skip' || ans.status === 'skipped' ? 'skip' : (ans.selected_option ? 'incorrect' : 'unvisited'));
                        const ansObj = {
                            selectedOption: ans.selected_option,
                            isCorrect,
                            status,
                            timeSpent: ans.time_spent_seconds || 0
                        };
                        answersMap[qId] = ansObj;
                        answersMap[idx] = ansObj;
                        answersMap[String(qId)] = ansObj;

                        questionsList.push({
                            id: qId,
                            question: ans.question_text || 'Question Text',
                            difficulty: ans.difficulty || 'Easy',
                            solution: ans.solution_explanation || '',
                            solution_explanation: ans.solution_explanation || '',
                            options: ans.options || [],
                            answer: ans.correct_answer || ''
                        });
                    });

                    setNumOfQuestionsState(att.total_questions || questionsList.length);
                    setTimeTakenState(att.time_taken_seconds || 0);
                    setCorrectAnswers(att.correct_count || 0);
                    setIncorrectAnswers(att.incorrect_count || 0);
                    setScore(att.score || 0);
                    setData(questionsList);
                    if (questionsList.length > 0) setCurrentQuestion(questionsList[0]);
                    setAnswers(answersMap);
                    setIsResumed(true);
                    questionsLoadedRef.current = true;
                }
            }).catch(e => console.warn('[QuizPage] Could not load attempt by ID:', e));
        } else {
            setNumOfQuestionsState(numOfQuestions || 10);
        }
    }, [effectiveTestId, isResultPage, quizDataProp]);

    const [runningTestId, setRunningTestId] = useState(effectiveTestId);

    // Generate questions for new test session
    useEffect(() => {
        if (isResumed || questionsLoadedRef.current || isResultPage) return;

        async function loadQuizQuestions() {
            const count = numOfQuestionsState || numOfQuestions || 10;
            questionsLoadedRef.current = true;
            try {
                const res = await FetchQuestionsFromApi(subject, chapters, difficulty, count);
                if (res && res.questions && res.questions.length > 0) {
                    setData(res.questions);
                    if (res.testId) {
                        setRunningTestId(res.testId);
                    }
                } else {
                    const fallback = GiveSetOfQuestions(subject, chapters, difficulty, count);
                    setData(fallback);
                }
            } catch (err) {
                const fallback = GiveSetOfQuestions(subject, chapters, difficulty, count);
                setData(fallback);
            }
        }
        
        loadQuizQuestions();
    }, [subject, chaptersKey, difficulty, isResumed, isResultPage]);

    // Set current question
    useEffect(() => {
        if (data.length > 0 && questionNumber < data.length) {
            setCurrentQuestion(data[questionNumber]);
            setQuestionStartTime(Date.now()); // Reset timer for new question
        }
    }, [data, questionNumber]);

    // Initialize answers for live test
    useEffect(() => {
        if (isResumed || isResultPage) return;

        if (data.length > 0 && Object.keys(answers).length === 0) {
            const initialAnswers = {};
            data.forEach((q, idx) => {
                const initObj = {
                    selectedOption: null,
                    status: "unvisited",
                    timeSpent: 0
                };
                initialAnswers[q.id] = initObj;
                initialAnswers[idx] = initObj;
            });
            setAnswers(initialAnswers);
        }
    }, [data, isResumed, isResultPage]);

    function OptionFunction(option) {
        if (isResultPage) return;

        const currentQId = currentQuestion.id;
        if (answers[currentQId]?.status === "incorrect" || answers[currentQId]?.status === "correct") {
            return;
        }

        const isCorrect = String(currentQuestion.answer).trim() === String(option).trim();
        const status = isCorrect ? "correct" : "incorrect";
        const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));

        if (status === "correct") {
            setCorrectAnswers(prev => prev + 1);
            setScore(prev => prev + 10);
        } else {
            setIncorrectAnswers(prev => prev + 1);
        }

        const newAns = {
            selectedOption: option,
            status: status,
            isCorrect: isCorrect,
            timeSpent: timeSpent
        };

        setAnswers(prev => ({
            ...prev,
            [currentQId]: newAns,
            [questionNumber]: newAns
        }));
    }

    function handleSkip(id, timeSpent) {
        const skipAns = {
            selectedOption: null,
            status: "skip",
            isCorrect: false,
            timeSpent: timeSpent
        };
        setAnswers(prev => ({
            ...prev,
            [id]: skipAns,
            [questionNumber]: skipAns
        }));
    }

    function handleQuestionNavigation(currentQuestionId, timeSpent) {
        if (answers[currentQuestionId]?.status === "unvisited") {
            const skipAns = {
                selectedOption: null,
                status: "skip",
                isCorrect: false,
                timeSpent: timeSpent
            };
            setAnswers(prev => ({
                ...prev,
                [currentQuestionId]: skipAns,
                [questionNumber]: skipAns
            }));
        }
    }

    function selectedColor(option) {
        const userAns = answers[currentQuestion?.id] || answers[questionNumber];
        const selected = userAns?.selectedOption;
        const correctAns = currentQuestion?.answer || currentQuestion?.correct_answer;

        if (isResultPage) {
            const isThisOptionCorrect = String(option).trim() === String(correctAns).trim();
            const isThisOptionSelected = selected && String(option).trim() === String(selected).trim();

            if (isThisOptionCorrect) {
                return "bg-green-100 border-2 border-green-500 font-semibold text-green-900";
            }
            if (isThisOptionSelected && !isThisOptionCorrect) {
                return "bg-red-100 border-2 border-red-500 font-semibold text-red-900";
            }
            return "bg-gray-50 border border-gray-200 text-gray-700";
        }

        if (!userAns || userAns?.status === "unvisited" || userAns?.status === "skip") {
            return "bg-gray-100 border border-gray-300";
        } else if (String(option).trim() === String(correctAns).trim()) {
            return "bg-green-200 border border-green-300";
        } else if (selected && String(option).trim() === String(selected).trim()) {
            return "bg-red-200 border border-red-300";
        }
        return "bg-gray-100 border border-gray-300";
    }

    function badgeColor(i) {
        const q = data[i];
        if (!q) return "bg-gray-200 text-gray-700";
        const userAns = answers[q.id] || answers[i];
        const status = userAns?.status;
        if (status === "correct" || userAns?.isCorrect || userAns?.is_correct === 1) return "bg-green-500 text-white";
        if (status === "incorrect" || (userAns?.selectedOption && !userAns?.isCorrect)) return "bg-red-500 text-white";
        if (status === "skip" || status === "skipped") return "bg-yellow-500 text-white";
        return "bg-gray-200 text-gray-700";
    }

    function storeToLocalStorage(obj) {
        const existing = JSON.parse(localStorage.getItem("quiz")) || [];
        const updated = existing.filter(item => String(item.quizId) !== String(effectiveTestId));
        updated.push(obj);
        localStorage.setItem("quiz", JSON.stringify(updated));
    }

    async function endTestObject(status) {
        const finalAnswers = { ...answers };
        const answeredQuestions = Object.values(finalAnswers).filter(a => a.status !== "unvisited").length;
        const avgTimePerQuestion = answeredQuestions > 0 ? Math.round(timeTakenState / answeredQuestions) : 0;
        
        data.forEach((question, idx) => {
            if (!finalAnswers[question.id] || finalAnswers[question.id].status === "unvisited") {
                const sAns = {
                    selectedOption: null,
                    status: "skip",
                    isCorrect: false,
                    timeSpent: avgTimePerQuestion
                };
                finalAnswers[question.id] = sAns;
                finalAnswers[idx] = sAns;
            }
        });

        const localObj = {
            quizId: effectiveTestId,
            score,
            answers: finalAnswers,
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
            status,
            testName
        };

        storeToLocalStorage(localObj);

        // Sync to backend API if authenticated
        const formattedAnswers = data.map((q, idx) => {
            const ans = finalAnswers[q.id] || finalAnswers[idx] || {};
            return {
                questionId: Number(q.id) || q.id,
                selectedOption: ans.selectedOption,
                status: ans.status || 'unvisited',
                timeSpent: ans.timeSpent || 0
            };
        });

        const activeId = runningTestId || effectiveTestId;
        let targetTestId = activeId;

        if (status === "completed") {
            try {
                const res = await api.submitQuiz({
                    testId: activeId,
                    subject: subject,
                    score: score,
                    totalQuestions: data.length,
                    timeTaken: timeTakenState,
                    answers: formattedAnswers,
                    questions: data
                });
                if (res && (res.testId || res.attemptId)) {
                    targetTestId = res.testId || res.attemptId;
                    localObj.quizId = targetTestId;
                    storeToLocalStorage(localObj);
                }
            } catch (err) {
                console.warn('[QuizPage] Could not sync submission to backend:', err.message);
            }
        } else if (status === "paused") {
            try {
                const res = await api.pauseQuiz({
                    testId: activeId,
                    subject: subject,
                    timeTaken: timeTakenState,
                    currentQuestionIndex: questionNumber,
                    answers: finalAnswers,
                    questions: data
                });
                if (res && (res.testId || res.attemptId)) {
                    targetTestId = res.testId || res.attemptId;
                    localObj.quizId = targetTestId;
                    storeToLocalStorage(localObj);
                }
            } catch (err) {
                console.warn('[QuizPage] Could not sync pause to backend:', err.message);
            }
        }

        // Increase the practise test given count
        const practiseTestGiven = JSON.parse(localStorage.getItem('practise_test_given')) || 0;
        localStorage.setItem('practise_test_given', JSON.stringify(practiseTestGiven + 1));

        if (status === "completed") {
            navigate(`/practise/${encodeURIComponent(subject)}/test/${targetTestId}/result`);
        } else {
            navigate(`/practise/${encodeURIComponent(subject)}/syllabus`);
        }
    }

    // Filter question indices based on current status
    const filteredIndices = data
        .map((q, i) => {
            const userAns = answers[q.id] || answers[i];
            return { index: i, status: userAns?.status || 'unvisited' };
        })
        .filter(item => {
            if (currentStatus === 'all') return true;
            if (currentStatus === 'skip') return item.status === 'skip' || item.status === 'skipped';
            return item.status === currentStatus;
        })
        .map(item => item.index);

    return (
         <>
           {isResultPage ? null : <Quiz_Nav title={`${subject} - ${testName}`} endTestOnPause={endTestObject}/>}
            <div className="w-full px-2 py-4 gap-4 flex flex-col lg:flex-row md:flex-col lg:px-10 md:px-5">

                <div className="w-full lg:w-[30%] md:w-full">

                    {/* Return the interactive status display if result page for the filter option */}
                    {isResultPage ? 
                        <ResultStatusDisplay currentStatus={currentStatus} setCurrentStatus={setCurrentStatus} /> : 
                        <StatusDisplay/>
                    }

                    <div className="bg-neutral-primary-soft block h-[max-content] w-full px-2 py-5 border border-default rounded-base shadow-xs">
                        <h5 className="mb-1 text-2xl font-semibold tracking-tight text-heading leading-8">Question : </h5>
                        <div className="w-full py-4 flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-x-hidden md:overflow-y-auto h-[max-content] md:h-[max-content]">

                            {filteredIndices.map((actualIndex) => (
                                <div key={actualIndex} className="flex-shrink-0 md:flex-shrink flex items-center px-2 py-2">
                                    <button 
                                        type="button" 
                                        className="cursor-pointer"
                                        onClick={() => setQuestionNumber(actualIndex)}
                                    >
                                        <span className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold
                                            ${actualIndex === questionNumber ? 'ring-3 ring-red-500 ring-offset-2' : ''} ${badgeColor(actualIndex)}`}
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
                            {filteredIndices.length > 0 && <PreviousBtn setQuestionNumber={setQuestionNumber} questionNumber={questionNumber} filteredIndices={filteredIndices} onNavigate={handleQuestionNavigation} currentQuestionId={currentQuestion?.id} timeSpent={Math.round((Date.now() - questionStartTime) / 1000)} />}
                            {!isResultPage && questionNumber < data.length - 1 && (answers[currentQuestion?.id]?.status === "unvisited" || !answers[currentQuestion?.id]) &&
                                <SkipBtn setQuestionNumber={setQuestionNumber} onSkip={handleSkip} id={data[questionNumber]?.id} timeSpent={Math.round((Date.now() - questionStartTime) / 1000)} />}
                            {filteredIndices.length > 0 && <NextBtn setQuestionNumber={setQuestionNumber} questionNumber={questionNumber} filteredIndices={filteredIndices} onNavigate={handleQuestionNavigation} currentQuestionId={currentQuestion?.id} timeSpent={Math.round((Date.now() - questionStartTime) / 1000)} />}
                        </div>

                    </div>

                    <div className="col-span-9 my-1 px-3 md:px-5 pt-2 pb-16 md:py-3 border border-default rounded-base shadow-xs">

                        <div className="mb-6 md:mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-lg md:text-xl font-medium text-gray-800 mr-2">
                                        Q.{questionNumber + 1} of {data.length || numOfQuestionsState}
                                    </span>
                                </div>
                                <DifficultyBadge difficulty={currentQuestion?.difficulty || "easy"} />
                            </div>

                            <p className="mt-3 text-base md:text-lg leading-relaxed font-medium text-gray-900">
                                {currentQuestion?.question || currentQuestion?.question_text || "Loading question..."}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {currentQuestion?.options?.map((option, index) => (
                                <div key={index}
                                    className={`p-3 md:p-4 rounded-lg cursor-pointer transition ${selectedColor(option)}`}
                                    onClick={() => OptionFunction(option)}>
                                    <span className="font-bold mr-2">({String.fromCharCode(65 + index)})</span>
                                    {option}
                                </div>
                            ))}
                        </div>

                        {/* Result mode Solution / Explanation Box */}
                        {isResultPage && (currentQuestion?.solution || currentQuestion?.solution_explanation) && (
                            <div className="mt-6 p-4 bg-red-50/60 border border-red-200 rounded-xl text-sm">
                                <h6 className="font-bold text-[var(--primary-red)] mb-1">💡 Solution & Explanation:</h6>
                                <p className="text-gray-800 leading-relaxed">{currentQuestion.solution || currentQuestion.solution_explanation}</p>
                            </div>
                        )}

                        {isResultPage ? null : <PauseTestBtn onClick={() => endTestObject("paused")} /> }
                        {
                            isResultPage ? null  
                            : questionNumber === numOfQuestionsState - 1 &&
                            <EndTestBtn onClick={() => endTestObject("completed")} />
                        }

                    </div>
                </div>
            </div>
        </>
    );
}