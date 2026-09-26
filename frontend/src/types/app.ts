import { BlockAstNode } from './material';

export interface PracticeExample {
  id: string;
  question: string;
  chemicalFormula?: string;
  contextHint: string;
  solutionSteps: string[];
  finalAnswer: string;
}

interface ContextualSection {
  title: string;
  caseStudyTag: string;
  content: string;
  impactHighlight: string;
  relatedSdg?: number;
}

export interface MaterialComment {
  id: string;
  name: string;
  email?: string;
  body: string;
  createdAt: string;
}

export interface ExtendedMaterial {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  coverUrl?: string;
  estimatedReadTime?: number;
  orderIndex: number;
  isPublished: boolean;
  contentJson: string | BlockAstNode[];
  category?: string;
  learningObjectives?: string[];
  contextualSection?: ContextualSection;
  practiceExamples?: PracticeExample[];
  comments?: MaterialComment[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityCategory = 'studi_kasus' | 'simulasi' | 'analisis_data';

export interface ActivityAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: 'file' | 'link' | 'image';
}

interface PhenomenonIntro {
  title: string;
  narrative: string;
  triggerQuestions: string[];
  imageUrl?: string;
}

export interface InteractiveModuleConfig {
  type: 'carbon_cycle_simulator' | 'reaction_kinetics' | 'equilibrium_shift' | 'embed_iframe';
  embedUrl?: string;
  title: string;
  description: string;
  initialState?: Record<string, number | string | boolean>;
}

export interface WorksheetQuestion {
  id: string;
  prompt: string;
  placeholder: string;
  sampleExpectedInsight: string;
}

export interface ActivityModule {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  contentJson?: string | BlockAstNode[];
  attachments?: ActivityAttachment[];
  orderIndex: number;
  isPublished: boolean;
  topicRelation?: string;
  category?: ActivityCategory;
  estimatedTime?: number;
  phenomenonIntro?: PhenomenonIntro;
  interactiveModule?: InteractiveModuleConfig;
  worksheet?: WorksheetQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizChoice {
  id: string;
  text: string;
  subtext?: string;
}

export type QuizSectionType =
  | 'text'
  | 'formula'
  | 'callout'
  | 'heading'
  | 'image'
  | 'youtube'
  | 'orderedList'
  | 'unorderedList'
  | 'divider';

export interface QuizSectionText {
  id: string;
  type: 'text';
  text: string;
}

export interface QuizSectionFormula {
  id: string;
  type: 'formula';
  formula: string;
  caption?: string;
}

export interface QuizSectionCallout {
  id: string;
  type: 'callout';
  text: string;
  emoji?: string;
}

export interface QuizSectionHeading {
  id: string;
  type: 'heading';
  text: string;
  level?: 2 | 3;
}

export interface QuizSectionDivider {
  id: string;
  type: 'divider';
}

export interface QuizSectionImage {
  id: string;
  type: 'image';
  dataUrl: string;
  caption?: string;
}

export interface QuizSectionYoutube {
  id: string;
  type: 'youtube';
  url: string;
}

export interface QuizSectionList {
  id: string;
  type: 'orderedList' | 'unorderedList';
  items: string[];
}

export type QuizSection =
  | QuizSectionText
  | QuizSectionFormula
  | QuizSectionCallout
  | QuizSectionHeading
  | QuizSectionDivider
  | QuizSectionImage
  | QuizSectionYoutube
  | QuizSectionList;

export interface QuizQuestion {
  id: string;
  sections?: QuizSection[];
  questionText: string;
  chemicalFormula?: string;
  stimulusImage?: string;
  choices: QuizChoice[];
  correctAnswerId?: string;
  correctAnswerIds?: string[];
  explanation: string;
  wrongAnswerExplanation?: string;
  conceptSummary: string;
}

export interface QuizPackage {
  id: string;
  title: string;
  topic: string;
  description: string;
  durationMinutes: number;
  difficulty: 'Dasar' | 'Menengah' | 'Lanjutan';
  isPublished: boolean;
  orderIndex: number;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  adminProfile: {
    username: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
  };
}

export interface ContentLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'publish';
  entityType: 'Materi' | 'Aktivitas' | 'Kuis' | 'Pengaturan';
  entityTitle: string;
  timestamp: string;
  author: string;
}
