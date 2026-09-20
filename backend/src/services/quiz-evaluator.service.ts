import { db } from '../db/index.js';
import { questions, questionOptions, type quizzes } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export interface SubmittedAnswer {
  questionId: string;
  selectedOptionId?: string | null;
  essayAnswer?: string | null;
}

export interface EvaluatedQuestionAnswer {
  questionId: string;
  selectedOptionId: string | null;
  essayAnswer: string | null;
  isCorrect: boolean;
  scoreEarned: number;
}

export interface QuizEvaluationResult {
  totalScore: number;
  maxScore: number;
  isPassed: boolean;
  evaluatedAnswers: EvaluatedQuestionAnswer[];
}

export async function evaluateQuizAnswers(
  quiz: typeof quizzes.$inferSelect,
  submittedAnswers: SubmittedAnswer[]
): Promise<QuizEvaluationResult> {
  // 1. Fetch all questions for this quiz
  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quiz.id));

  if (quizQuestions.length === 0) {
    return {
      totalScore: 0,
      maxScore: 100,
      isPassed: false,
      evaluatedAnswers: [],
    };
  }

  // 2. Fetch all options for these questions
  const optionsList = await db
    .select()
    .from(questionOptions);

  const optionsMap = new Map<string, typeof questionOptions.$inferSelect>();
  for (const opt of optionsList) {
    optionsMap.set(opt.id, opt);
  }

  const answerMap = new Map<string, SubmittedAnswer>();
  for (const ans of submittedAnswers) {
    answerMap.set(ans.questionId, ans);
  }

  let totalWeight = 0;
  let earnedWeight = 0;
  const evaluatedAnswers: EvaluatedQuestionAnswer[] = [];

  for (const q of quizQuestions) {
    const weight = q.scoreWeight || 10;
    totalWeight += weight;

    const studentSubmission = answerMap.get(q.id);
    const selectedOptionId = studentSubmission?.selectedOptionId || null;
    const essayAnswer = studentSubmission?.essayAnswer || null;

    let isCorrect = false;
    let scoreEarned = 0;

    if (q.questionType === 'multiple_choice' && selectedOptionId) {
      const option = optionsMap.get(selectedOptionId);
      if (option && option.questionId === q.id && option.isCorrect) {
        isCorrect = true;
        scoreEarned = weight;
        earnedWeight += weight;
      }
    }

    evaluatedAnswers.push({
      questionId: q.id,
      selectedOptionId,
      essayAnswer,
      isCorrect,
      scoreEarned,
    });
  }

  // Scale score to 100 for standardized grading
  const percentageScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  const isPassed = percentageScore >= (quiz.passingScore ?? 70);

  return {
    totalScore: percentageScore,
    maxScore: 100,
    isPassed,
    evaluatedAnswers,
  };
}
