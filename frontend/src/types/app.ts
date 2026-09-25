import { BlockAstNode } from './material';

export interface LearningObjective {
  id: string;
  text: string;
}

export interface PracticeExample {
  id: string;
  question: string;
  chemicalFormula?: string;
  contextHint: string;
  solutionSteps: string[];
  finalAnswer: string;
}

export interface ContextualSection {
  title: string;
  caseStudyTag: string;
  content: string;
  impactHighlight: string;
  relatedSdg?: number;
}

export interface ExtendedMaterial {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  coverUrl: string;
  estimatedReadTime: number;
  orderIndex: number;
  isPublished: boolean;
  learningObjectives: string[];
  contentJson: string | BlockAstNode[];
  contextualSection: ContextualSection;
  practiceExamples: PracticeExample[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityCategory = 'studi_kasus' | 'simulasi' | 'analisis_data';

export interface PhenomenonIntro {
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
  topicRelation: string;
  category: ActivityCategory;
  badgeLabel: string;
  summary: string;
  estimatedTime: number;
  orderIndex: number;
  isPublished: boolean;
  phenomenonIntro: PhenomenonIntro;
  interactiveModule: InteractiveModuleConfig;
  worksheet: WorksheetQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizChoice {
  id: string;
  text: string;
  subtext?: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  chemicalFormula?: string;
  stimulusImage?: string;
  choices: QuizChoice[];
  correctAnswerId: string;
  explanation: string;
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

export interface SdgGoal {
  number: number;
  title: string;
  description: string;
  color: string;
  iconName: string;
}

export interface LearningFlowStep {
  step: number;
  title: string;
  desc: string;
  iconName: string;
  route: string;
}

export interface SiteSettings {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    bannerImage: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
  };
  learningFlow: LearningFlowStep[];
  sdgImpact: {
    tagline: string;
    description: string;
    goals: SdgGoal[];
  };
  accessibilityDefaults: {
    contrastScheme: string;
    interfaceLanguage: 'id' | 'en';
    dyslexiaFontEnabled: boolean;
  };
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
