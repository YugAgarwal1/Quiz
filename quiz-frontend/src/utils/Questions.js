import ChapterData from "../json/ChapterData.json";
import temp_questions from "../json/temp_questions.json";

export function GiveSetOfQuestions(subject, chapters, difficulty, numberOfQuestions) {
    console.log("Generating questions for:", { subject, chapters, difficulty, numberOfQuestions });
    
    // return the subjects id from the Chapter.json
    const subjectID = ChapterData.find((Subjects) => Subjects.Subject === subject)?.SubjectID || null;
    console.log("SubjectID:", subjectID, "Type:", typeof subjectID);

    if (!subjectID) {
        console.error("Subject not found:", subject);
        return [];
    }

    // Return the Chapters - handle both string and number SubjectID
    const subjectData = temp_questions.find((item) => 
        String(item.SubjectID) === String(subjectID)
    );
    const chaptersData = subjectData?.Chapters || [];
    console.log("SubjectData found:", !!subjectData);
    console.log("Chapters Data:", chaptersData);

    if (!subjectData || chaptersData.length === 0) {
        console.error("No chapters found for subject:", subject);
        return [];
    }

    // Filtering the selected chapters only and questions
    const selectedChapters = chaptersData.filter((chapter) => 
        chapters.includes(parseInt(chapter.ChapterNumber))
    );
    console.log("Selected Chapters:", selectedChapters);

    if (selectedChapters.length === 0) {
        console.error("No matching chapters found for:", chapters);
        return [];
    }

    // Extract questions from selected chapters and difficulty
    const allQuestions = [];
    selectedChapters.forEach((chapter) => {
        console.log(`Chapter ${chapter.ChapterNumber} difficulties:`, chapter.Difficulty.map(d => d.Level));
        const difficultyLevel = chapter.Difficulty.find(
            (level) => level.Level.toLowerCase() === difficulty.toLowerCase()
        );
        console.log(`Found difficulty level for ${difficulty}:`, !!difficultyLevel);
        
        if (difficultyLevel && difficultyLevel.Questions && difficultyLevel.Questions.length > 0) {
            allQuestions.push(...difficultyLevel.Questions);
            console.log(`Found ${difficultyLevel.Questions.length} questions in Chapter ${chapter.ChapterNumber} for ${difficulty}`);
        } else {
            console.log(`No questions found in Chapter ${chapter.ChapterNumber} for ${difficulty}`);
        }
    });

    console.log("Total questions found:", allQuestions.length);

    if (allQuestions.length === 0) {
        console.error("No questions available for the selected criteria");
        return [];
    }

    // Shuffle the questions
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
    const finalQuestions = shuffledQuestions.slice(0, numberOfQuestions);
    console.log("Returning questions:", finalQuestions.length);
    
    return finalQuestions;
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