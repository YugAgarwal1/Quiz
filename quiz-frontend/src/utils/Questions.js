import ChapterData from "../json/ChapterData.json";
import temp_questions from "../json/temp_questions.json";
import api from "../services/api.js";

// Async API-first question fetcher with fallback to local JSON
export async function FetchQuestionsFromApi(subject, chapters, difficulty, numberOfQuestions) {
    try {
        const res = await api.generateQuestions({
            subject,
            chapters,
            difficulty,
            numberOfQuestions
        });
        if (res.success && res.questions && res.questions.length > 0) {
            return {
                testId: res.testId,
                questions: res.questions
            };
        }
    } catch (err) {
        console.warn("[Questions] Backend API request failed, falling back to local JSON:", err.message);
    }

    // Fallback
    const localQuestions = GiveSetOfQuestions(subject, chapters, difficulty, numberOfQuestions);
    return {
        testId: `local_${Date.now()}`,
        questions: localQuestions
    };
}

export function GiveSetOfQuestions(subject, chapters, difficulty, numberOfQuestions) {
    console.log("Generating questions for:", { subject, chapters, difficulty, numberOfQuestions });
    
    // return the subjects id from the Chapter.json
    const subjectID = ChapterData.find((Subjects) => Subjects.Subject === subject)?.SubjectID || null;

    if (!subjectID) {
        console.error("Subject not found:", subject);
        return [];
    }

    // Return the Chapters - handle both string and number SubjectID
    const subjectData = temp_questions.find((item) => 
        String(item.SubjectID) === String(subjectID)
    );
    const chaptersData = subjectData?.Chapters || [];

    if (!subjectData || chaptersData.length === 0) {
        console.error("No chapters found for subject:", subject);
        return [];
    }

    // Filtering the selected chapters only and questions
    const selectedChapters = chaptersData.filter((chapter) => 
        chapters.includes(parseInt(chapter.ChapterNumber, 10))
    );

    if (selectedChapters.length === 0) {
        console.error("No matching chapters found for:", chapters);
        return [];
    }

    // Extract questions from selected chapters and difficulty
    const allQuestions = [];
    selectedChapters.forEach((chapter) => {
        const difficultyLevel = chapter.Difficulty.find(
            (level) => level.Level.toLowerCase() === difficulty.toLowerCase()
        );
        
        if (difficultyLevel && difficultyLevel.Questions && difficultyLevel.Questions.length > 0) {
            allQuestions.push(...difficultyLevel.Questions);
        }
    });

    if (allQuestions.length === 0) {
        console.error("No questions available for the selected criteria");
        return [];
    }

    // Shuffle the questions
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
    return shuffledQuestions.slice(0, numberOfQuestions);
}

export async function FetchSubjectSyllabusFromApi(subject) {
    try {
        const res = await api.getSubjectSyllabus(subject);
        if (res.success && res.chapters) {
            return res.chapters;
        }
    } catch (err) {
        console.warn("[Syllabus] Backend API request failed, falling back to local JSON:", err.message);
    }
    return GetSubjectSyllabus(subject);
}

export function GetSubjectSyllabus(subject) {
    const subjectID = ChapterData.find((Subjects) => Subjects.Subject === subject)?.SubjectID || null;
    const subjectData = ChapterData.find((item) => item.SubjectID === subjectID);
    return subjectData?.Chapters || [];
}