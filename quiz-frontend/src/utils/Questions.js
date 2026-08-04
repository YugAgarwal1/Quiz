import ChapterData from "../json/ChapterData.json";
import temp_questions from "../json/temp_questions.json";

export function GiveSetOfQuestions(subject, chapters, difficulty, numberOfQuestions) {
    // return the subjects id from the Chapter.json
    const subjectID = ChapterData.find((Subjects) => Subjects.Subject === subject)?.SubjectID || null;
    //  console.log("SubjectID:", subjectID);

    // Return the Chapters
    const subjectData = temp_questions.find((item) => item.SubjectID === subjectID);
    const chaptersData = subjectData?.Chapters || [];
    // console.log("Chapters Data:", chaptersData);

    // Filtering the selected chapters only and questions
    const selectedChapters = chaptersData.filter((chapter) => chapters.includes(parseInt(chapter.ChapterNumber)));
    // console.log("Selected Chapters:", selectedChapters);

    // Extract questions from selected chapters and difficulty
    const allQuestions = [];
    selectedChapters.forEach((chapter) => {
        const difficultyLevel = chapter.Difficulty.find(
            (level) => level.Level.toLowerCase() === difficulty.toLowerCase()
        );
        if (difficultyLevel && difficultyLevel.Questions) {
            allQuestions.push(...difficultyLevel.Questions);
        }
    });

    // console.log("All Questions:", allQuestions);

    // Shuffle the questions
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
    console.log(shuffledQuestions.slice(0, numberOfQuestions));
    // Return limited number of questions
    return shuffledQuestions.slice(0, numberOfQuestions);
}

export function GetSubjectSyllabus(subject) {
    // return the subjects id from the Chapter.json
    const subjectID = ChapterData.find((Subjects) => Subjects.Subject === subject)?.SubjectID || null;
    //  console.log("SubjectID:", subjectID);

    // Return the Chapters from ChapterData.json (not temp_questions.json)
    const subjectData = ChapterData.find((item) => item.SubjectID === subjectID);
    const chaptersData = subjectData?.Chapters || [];
    // console.log("Chapters Data:", chaptersData);

    return chaptersData;
}