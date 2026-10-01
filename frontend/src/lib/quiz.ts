import {
  QuizChoice,
  QuizQuestion,
  QuizSection,
  QuizSectionType,
} from '../types/app';

export interface EditorQuestion {
  id: string;
  sections: QuizSection[];
  choices: QuizChoice[];
  correctAnswerIds: string[];
  explanation: string;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSection(type: QuizSectionType): QuizSection {
  switch (type) {
    case 'text':
      return { id: uid('sec'), type: 'text', text: '' };
    case 'callout':
      return { id: uid('sec'), type: 'callout', text: '', emoji: '💡' };
    case 'heading':
      return { id: uid('sec'), type: 'heading', text: '', level: 2 };
    case 'divider':
      return { id: uid('sec'), type: 'divider' };
    case 'image':
      return { id: uid('sec'), type: 'image', dataUrl: '', caption: '' };
    case 'youtube':
      return { id: uid('sec'), type: 'youtube', url: '' };
    case 'link':
      return { id: uid('sec'), type: 'link', url: '' };
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
  const textParts = sections
    .filter((s): s is Extract<QuizSection, { type: 'text' | 'heading' | 'callout' }> =>
      s.type === 'text' || s.type === 'heading' || s.type === 'callout'
    )
    .map((s) => s.text.trim())
    .filter(Boolean);

  if (textParts.length > 0) return textParts.join(' ');

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
  const sections: QuizSection[] =
    question.sections && question.sections.length > 0
      ? question.sections.map((s) => ({ ...s }) as QuizSection)
      : legacySections(question);

  const correctIds = getCorrectAnswerIds(question);

  return {
    id: question.id,
    sections,
    choices:
      question.choices.length > 0
        ? question.choices.map((c) => ({ ...c }))
        : [createChoice(), createChoice()],
    correctAnswerIds: correctIds,
    explanation: question.explanation || '',
  };
}

export function createEditorQuestion(): EditorQuestion {
  return {
    id: uid('q'),
    sections: [{ id: uid('sec'), type: 'text', text: '' }],
    choices: [createChoice(), createChoice(), createChoice(), createChoice()],
    correctAnswerIds: [],
    explanation: '',
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
    choices: question.choices,
    correctAnswerIds,
    correctAnswerId: correctAnswerIds[0],
    explanation: question.explanation,
  };
}
