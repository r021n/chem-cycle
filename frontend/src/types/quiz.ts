import { Module } from './material';

export interface QuestionOption {
  id: string;
  questionId?: string;
  optionKey: string;
  content: string;
  imageUrl?: string | null;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  quizId?: string;
  promptJson: string; // Block AST
  questionType: 'multiple_choice' | 'essay';
  scoreWeight: number;
  orderIndex: number;
  explanationJson?: string | null;
  options: QuestionOption[];
}

export interface Quiz {
  id: string;
  moduleId?: string | null;
  title: string;
  slug: string;
  description?: string | null;
  timeLimitMinutes?: number | null;
  passingScore: number;
  maxAttempts?: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  module?: Module | null;
  totalQuestions?: number;
  questions?: Question[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  attemptNumber: number;
  totalScore: number;
  maxScore: number;
  isPassed: boolean;
  startedAt: string;
  completedAt?: string | null;
  userName?: string;
  userEmail?: string;
  identityNumber?: string | null;
  quizTitle?: string;
  studentName?: string;
}

export interface QuizResultData {
  attempt: QuizAttempt;
  totalScore: number;
  maxScore: number;
  isPassed: boolean;
  quiz: Quiz;
  questions?: Question[];
  userAnswers?: Record<string, string>;
}

export interface StudentAnswerDetail {
  selectedOptionId?: string | null;
  essayAnswer?: string | null;
  isCorrect: boolean;
  scoreEarned: number;
}

export interface QuestionWithDetail extends Question {
  studentAnswer?: StudentAnswerDetail | null;
}

export interface AttemptDetailResponse {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: QuestionWithDetail[];
}

export interface StudentMonitoringRecap {
  userId: string;
  fullName: string;
  email: string;
  identityNumber?: string | null;
  attemptsCount: number;
  highestScore: number;
  latestScore: number;
  isPassedLatest: boolean;
  lastAttemptDate: string | null;
  attempts: QuizAttempt[];
}

export interface QuizMonitoringData {
  quiz: Quiz;
  totalStudentsAttempted: number;
  totalAttempts: number;
  studentRecap: StudentMonitoringRecap[];
}

export interface SubmitAnswerItem {
  questionId: string;
  selectedOptionId?: string;
  essayAnswer?: string;
}

export interface SubmitQuizPayload {
  answers: SubmitAnswerItem[];
}

export interface QuestionPayload {
  promptJson?: string;
  questionType?: 'multiple_choice' | 'essay';
  scoreWeight?: number;
  explanationJson?: string | null;
  options?: {
    optionKey: string;
    content: string;
    isCorrect?: boolean;
    imageUrl?: string | null;
  }[];
}

export interface QuizPayload {
  title?: string;
  description?: string | null;
  moduleId?: string | null;
  passingScore?: number;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  isPublished?: boolean;
}
