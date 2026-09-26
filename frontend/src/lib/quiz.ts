import {
  QuizChoice,
  QuizQuestion,
  QuizSection,
  QuizSectionType,
} from '../types/app';

export interface EditorQuestion {
  id: string;
  sections: QuizSection[];
  chemicalFormula: string;
  choices: QuizChoice[];
  correctAnswerIds: string[];
  explanation: string;
  wrongAnswerExplanation: string;
  conceptSummary: string;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSection(type: QuizSectionType): QuizSection {
  switch (type) {
    case 'text':
      return { id: uid('sec'), type: 'text', text: '' };
    case 'image':
      return { id: uid('sec'), type: 'image', dataUrl: '', caption: '' };
    case 'youtube':
      return { id: uid('sec'), type: 'youtube', url: '' };
    case 'orderedList':
      return { id: uid('sec'), type: 'orderedList', items: [''] };
    case 'unorderedList':
      return { id: uid('sec'), type: 'unorderedList', items: [''] };
  }
}

export function createChoice(): QuizChoice {
  return { id: uid('opt'), text: '' };
}

export function deriveQuestionText(sections: QuizSection[]): string {
  const text = sections
    .filter((s): s is Extract<QuizSection, { type: 'text' }> => s.type === 'text')
    .map((s) => s.text.trim())
    .filter(Boolean)
    .join(' ');
  if (text) return text;
  const imageCaption = sections.find(
    (s): s is Extract<QuizSection, { type: 'image' }> => s.type === 'image' && !!s.caption
  );
  return imageCaption?.caption?.trim() || 'Soal tanpa teks';
}

export function getCorrectAnswerIds(question: QuizQuestion): string[] {
  const choiceIds = new Set(question.choices.map((c) => c.id));
  if (question.correctAnswerIds?.length) {
    return question.correctAnswerIds.filter((id) => choiceIds.has(id));
  }
  if (question.correctAnswerId && choiceIds.has(question.correctAnswerId)) {
    return [question.correctAnswerId];
  }
  return [];
}

function legacySections(question: QuizQuestion): QuizSection[] {
  const sections: QuizSection[] = [];
  if (question.stimulusImage) {
    sections.push({ id: uid('sec'), type: 'image', dataUrl: question.stimulusImage, caption: '' });
  }
  if (question.questionText?.trim()) {
    sections.push({ id: uid('sec'), type: 'text', text: question.questionText });
  }
  if (sections.length === 0) {
    sections.push({ id: uid('sec'), type: 'text', text: '' });
  }
  return sections;
}

export function toEditorQuestion(question: QuizQuestion): EditorQuestion {
  const sections =
    question.sections && question.sections.length > 0
      ? question.sections.map((s) => ({ ...s }) as QuizSection)
      : legacySections(question);

  const correctIds = getCorrectAnswerIds(question);

  return {
    id: question.id,
    sections,
    chemicalFormula: question.chemicalFormula || '',
    choices:
      question.choices.length > 0
        ? question.choices.map((c) => ({ ...c }))
        : [createChoice(), createChoice()],
    correctAnswerIds: correctIds,
    explanation: question.explanation || '',
    wrongAnswerExplanation: question.wrongAnswerExplanation || '',
    conceptSummary: question.conceptSummary || '',
  };
}

export function createEditorQuestion(): EditorQuestion {
  return {
    id: uid('q'),
    sections: [{ id: uid('sec'), type: 'text', text: '' }],
    chemicalFormula: '',
    choices: [createChoice(), createChoice(), createChoice(), createChoice()],
    correctAnswerIds: [],
    explanation: '',
    wrongAnswerExplanation: '',
    conceptSummary: '',
  };
}

export function toQuizQuestion(question: EditorQuestion): QuizQuestion {
  const correctAnswerIds = question.correctAnswerIds.filter((id) =>
    question.choices.some((c) => c.id === id)
  );
  return {
    id: question.id,
    sections: question.sections,
    questionText: deriveQuestionText(question.sections),
    chemicalFormula: question.chemicalFormula.trim() || undefined,
    choices: question.choices,
    correctAnswerIds,
    correctAnswerId: correctAnswerIds[0],
    explanation: question.explanation,
    wrongAnswerExplanation: question.wrongAnswerExplanation.trim() || undefined,
    conceptSummary: question.conceptSummary,
  };
}
