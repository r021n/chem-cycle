import { create } from 'zustand';
import {
  ExtendedMaterial,
  ActivityModule,
  QuizPackage,
  QuizQuestion,
  SiteSettings,
  ContentLog,
} from '../types/app';

import rawMaterials from '../data/materials.json';
import rawActivities from '../data/activities.json';
import rawQuizzes from '../data/quizzes.json';
import rawSettings from '../data/siteSettings.json';
import rawLogs from '../data/activityLogs.json';

const STORAGE_KEY_PREFIX = 'chem_cycle_data_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Failed to parse localStorage for ${key}:`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save localStorage for ${key}:`, e);
  }
}

interface DataStoreState {
  materials: ExtendedMaterial[];
  activities: ActivityModule[];
  quizzes: QuizPackage[];
  settings: SiteSettings;
  logs: ContentLog[];
  isAuthenticated: boolean;

  // Auth actions
  login: (identity: string, pass: string) => boolean;
  logout: () => void;

  // Materials CRUD
  addMaterial: (item: Omit<ExtendedMaterial, 'id' | 'createdAt' | 'updatedAt'>) => ExtendedMaterial;
  updateMaterial: (id: string, updates: Partial<ExtendedMaterial>) => void;
  deleteMaterial: (id: string) => void;
  togglePublishMaterial: (id: string) => void;
  reorderMaterials: (orderedIds: string[]) => void;

  // Activities CRUD
  addActivity: (item: Omit<ActivityModule, 'id' | 'createdAt' | 'updatedAt'>) => ActivityModule;
  updateActivity: (id: string, updates: Partial<ActivityModule>) => void;
  deleteActivity: (id: string) => void;
  togglePublishActivity: (id: string) => void;

  // Quizzes CRUD
  addQuiz: (item: Omit<QuizPackage, 'id' | 'createdAt' | 'updatedAt'>) => QuizPackage;
  updateQuiz: (id: string, updates: Partial<QuizPackage>) => void;
  deleteQuiz: (id: string) => void;
  togglePublishQuiz: (id: string) => void;
  addQuestion: (quizId: string, question: Omit<QuizQuestion, 'id'>) => void;
  updateQuestion: (quizId: string, questionId: string, updates: Partial<QuizQuestion>) => void;
  deleteQuestion: (quizId: string, questionId: string) => void;
  duplicateQuestion: (quizId: string, questionId: string) => void;

  // Site Settings
  updateHero: (hero: Partial<SiteSettings['hero']>) => void;
  updateSdgImpact: (sdgImpact: Partial<SiteSettings['sdgImpact']>) => void;
  updateAccessibilityDefaults: (defaults: Partial<SiteSettings['accessibilityDefaults']>) => void;
  updateAdminProfile: (profile: Partial<SiteSettings['adminProfile']>) => void;
  resetAllDataToDefaults: () => void;

  // Logs
  pushLog: (action: ContentLog['action'], entityType: ContentLog['entityType'], entityTitle: string) => void;
}

export const useDataStore = create<DataStoreState>((set, get) => ({
  materials: loadFromStorage<ExtendedMaterial[]>('materials', rawMaterials as unknown as ExtendedMaterial[]),
  activities: loadFromStorage<ActivityModule[]>('activities', rawActivities as unknown as ActivityModule[]),
  quizzes: loadFromStorage<QuizPackage[]>('quizzes', rawQuizzes as unknown as QuizPackage[]),
  settings: loadFromStorage<SiteSettings>('settings', rawSettings as unknown as SiteSettings),
  logs: loadFromStorage<ContentLog[]>('logs', rawLogs as unknown as ContentLog[]),
  isAuthenticated: !!localStorage.getItem(`${STORAGE_KEY_PREFIX}auth_token`),

  login: (identity, pass) => {
    // Admin credentials demo: admin or admin@ecoinclusive.edu with password 'admin123'
    if (
      (identity === 'admin' || identity === 'admin@ecoinclusive.edu') &&
      pass === 'admin123'
    ) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}auth_token`, 'demo_token_' + Date.now());
      set({ isAuthenticated: true });
      get().pushLog('update', 'Pengaturan', 'Administrator Sesi Masuk Berhasil');
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}auth_token`);
    set({ isAuthenticated: false });
  },

  pushLog: (action, entityType, entityTitle) => {
    const author = get().settings.adminProfile.name || 'Admin';
    const newLog: ContentLog = {
      id: `log-${Date.now()}`,
      action,
      entityType,
      entityTitle,
      timestamp: new Date().toISOString(),
      author,
    };
    const updated = [newLog, ...get().logs].slice(0, 50);
    set({ logs: updated });
    saveToStorage('logs', updated);
  },

  // Material Actions
  addMaterial: (item) => {
    const now = new Date().toISOString();
    const id = `mat-${Date.now()}`;
    const newMaterial: ExtendedMaterial = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...get().materials, newMaterial];
    set({ materials: updated });
    saveToStorage('materials', updated);
    get().pushLog('create', 'Materi', newMaterial.title);
    return newMaterial;
  },

  updateMaterial: (id, updates) => {
    const updated = get().materials.map((m) => {
      if (m.id === id) {
        return { ...m, ...updates, updatedAt: new Date().toISOString() };
      }
      return m;
    });
    set({ materials: updated });
    saveToStorage('materials', updated);
    const target = updated.find((m) => m.id === id);
    if (target) {
      get().pushLog('update', 'Materi', target.title);
    }
  },

  deleteMaterial: (id) => {
    const target = get().materials.find((m) => m.id === id);
    const updated = get().materials.filter((m) => m.id !== id);
    set({ materials: updated });
    saveToStorage('materials', updated);
    if (target) {
      get().pushLog('delete', 'Materi', target.title);
    }
  },

  togglePublishMaterial: (id) => {
    const updated = get().materials.map((m) =>
      m.id === id ? { ...m, isPublished: !m.isPublished, updatedAt: new Date().toISOString() } : m
    );
    set({ materials: updated });
    saveToStorage('materials', updated);
    const target = updated.find((m) => m.id === id);
    if (target) {
      get().pushLog(
        target.isPublished ? 'publish' : 'update',
        'Materi',
        `${target.title} (${target.isPublished ? 'Terbit' : 'Draf'})`
      );
    }
  },

  reorderMaterials: (orderedIds) => {
    const map = new Map(get().materials.map((m) => [m.id, m]));
    const updated: ExtendedMaterial[] = [];
    orderedIds.forEach((id, idx) => {
      const item = map.get(id);
      if (item) {
        updated.push({ ...item, orderIndex: idx + 1 });
      }
    });
    set({ materials: updated });
    saveToStorage('materials', updated);
  },

  // Activities Actions
  addActivity: (item) => {
    const now = new Date().toISOString();
    const id = `act-${Date.now()}`;
    const newAct: ActivityModule = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...get().activities, newAct];
    set({ activities: updated });
    saveToStorage('activities', updated);
    get().pushLog('create', 'Aktivitas', newAct.title);
    return newAct;
  },

  updateActivity: (id, updates) => {
    const updated = get().activities.map((a) => {
      if (a.id === id) {
        return { ...a, ...updates, updatedAt: new Date().toISOString() };
      }
      return a;
    });
    set({ activities: updated });
    saveToStorage('activities', updated);
    const target = updated.find((a) => a.id === id);
    if (target) {
      get().pushLog('update', 'Aktivitas', target.title);
    }
  },

  deleteActivity: (id) => {
    const target = get().activities.find((a) => a.id === id);
    const updated = get().activities.filter((a) => a.id !== id);
    set({ activities: updated });
    saveToStorage('activities', updated);
    if (target) {
      get().pushLog('delete', 'Aktivitas', target.title);
    }
  },

  togglePublishActivity: (id) => {
    const updated = get().activities.map((a) =>
      a.id === id ? { ...a, isPublished: !a.isPublished, updatedAt: new Date().toISOString() } : a
    );
    set({ activities: updated });
    saveToStorage('activities', updated);
    const target = updated.find((a) => a.id === id);
    if (target) {
      get().pushLog(
        target.isPublished ? 'publish' : 'update',
        'Aktivitas',
        `${target.title} (${target.isPublished ? 'Terbit' : 'Draf'})`
      );
    }
  },

  // Quizzes Actions
  addQuiz: (item) => {
    const now = new Date().toISOString();
    const id = `quiz-${Date.now()}`;
    const newQuiz: QuizPackage = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...get().quizzes, newQuiz];
    set({ quizzes: updated });
    saveToStorage('quizzes', updated);
    get().pushLog('create', 'Kuis', newQuiz.title);
    return newQuiz;
  },

  updateQuiz: (id, updates) => {
    const updated = get().quizzes.map((q) => {
      if (q.id === id) {
        return { ...q, ...updates, updatedAt: new Date().toISOString() };
      }
      return q;
    });
    set({ quizzes: updated });
    saveToStorage('quizzes', updated);
    const target = updated.find((q) => q.id === id);
    if (target) {
      get().pushLog('update', 'Kuis', target.title);
    }
  },

  deleteQuiz: (id) => {
    const target = get().quizzes.find((q) => q.id === id);
    const updated = get().quizzes.filter((q) => q.id !== id);
    set({ quizzes: updated });
    saveToStorage('quizzes', updated);
    if (target) {
      get().pushLog('delete', 'Kuis', target.title);
    }
  },

  togglePublishQuiz: (id) => {
    const updated = get().quizzes.map((q) =>
      q.id === id ? { ...q, isPublished: !q.isPublished, updatedAt: new Date().toISOString() } : q
    );
    set({ quizzes: updated });
    saveToStorage('quizzes', updated);
    const target = updated.find((q) => q.id === id);
    if (target) {
      get().pushLog(
        target.isPublished ? 'publish' : 'update',
        'Kuis',
        `${target.title} (${target.isPublished ? 'Terbit' : 'Draf'})`
      );
    }
  },

  addQuestion: (quizId, question) => {
    const newQ: QuizQuestion = {
      ...question,
      id: `q-${Date.now()}`,
    };
    const updated = get().quizzes.map((q) => {
      if (q.id === quizId) {
        return {
          ...q,
          questions: [...q.questions, newQ],
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    set({ quizzes: updated });
    saveToStorage('quizzes', updated);
  },

  updateQuestion: (quizId, questionId, updates) => {
    const updated = get().quizzes.map((q) => {
      if (q.id === quizId) {
        const questions = q.questions.map((qn) =>
          qn.id === questionId ? { ...qn, ...updates } : qn
        );
        return { ...q, questions, updatedAt: new Date().toISOString() };
      }
      return q;
    });
    set({ quizzes: updated });
    saveToStorage('quizzes', updated);
  },

  deleteQuestion: (quizId, questionId) => {
    const updated = get().quizzes.map((q) => {
      if (q.id === quizId) {
        return {
          ...q,
          questions: q.questions.filter((qn) => qn.id !== questionId),
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    set({ quizzes: updated });
    saveToStorage('quizzes', updated);
  },

  duplicateQuestion: (quizId, questionId) => {
    const quiz = get().quizzes.find((q) => q.id === quizId);
    if (!quiz) return;
    const targetQ = quiz.questions.find((qn) => qn.id === questionId);
    if (!targetQ) return;

    const dupQ: QuizQuestion = {
      ...targetQ,
      id: `q-${Date.now()}`,
      questionText: `${targetQ.questionText} (Salinan)`,
    };
    const updated = get().quizzes.map((q) => {
      if (q.id === quizId) {
        return {
          ...q,
          questions: [...q.questions, dupQ],
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    set({ quizzes: updated });
    saveToStorage('quizzes', updated);
  },

  // Settings Actions
  updateHero: (hero) => {
    const updated: SiteSettings = {
      ...get().settings,
      hero: { ...get().settings.hero, ...hero },
    };
    set({ settings: updated });
    saveToStorage('settings', updated);
    get().pushLog('update', 'Pengaturan', 'Pembaruan Hero & Banner Beranda');
  },

  updateSdgImpact: (sdgImpact) => {
    const updated: SiteSettings = {
      ...get().settings,
      sdgImpact: { ...get().settings.sdgImpact, ...sdgImpact },
    };
    set({ settings: updated });
    saveToStorage('settings', updated);
    get().pushLog('update', 'Pengaturan', 'Pembaruan Orientasi SDGs');
  },

  updateAccessibilityDefaults: (defaults) => {
    const updated: SiteSettings = {
      ...get().settings,
      accessibilityDefaults: { ...get().settings.accessibilityDefaults, ...defaults },
    };
    set({ settings: updated });
    saveToStorage('settings', updated);
    get().pushLog('update', 'Pengaturan', 'Pembaruan Konfigurasi Standar Aksesibilitas');
  },

  updateAdminProfile: (profile) => {
    const updated: SiteSettings = {
      ...get().settings,
      adminProfile: { ...get().settings.adminProfile, ...profile },
    };
    set({ settings: updated });
    saveToStorage('settings', updated);
    get().pushLog('update', 'Pengaturan', 'Pembaruan Profil Administrator');
  },

  resetAllDataToDefaults: () => {
    set({
      materials: rawMaterials as unknown as ExtendedMaterial[],
      activities: rawActivities as unknown as ActivityModule[],
      quizzes: rawQuizzes as unknown as QuizPackage[],
      settings: rawSettings as unknown as SiteSettings,
      logs: rawLogs as unknown as ContentLog[],
    });
    saveToStorage('materials', rawMaterials);
    saveToStorage('activities', rawActivities);
    saveToStorage('quizzes', rawQuizzes);
    saveToStorage('settings', rawSettings);
    saveToStorage('logs', rawLogs);
    get().pushLog('update', 'Pengaturan', 'Reset Database ke Kondisi Default JSON');
  },
}));
