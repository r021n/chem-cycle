import { create } from 'zustand';
import {
  ExtendedMaterial,
  ActivityModule,
  QuizPackage,
  QuizQuestion,
  SiteSettings,
  ContentLog,
  MaterialComment,
} from '../types/app';
import { authApi } from '../api/auth';
import { materialsApi } from '../api/materials';
import { activitiesApi } from '../api/activities';
import { quizzesApi } from '../api/quizzes';
import { commentsApi } from '../api/comments';
import { apiClient, getStoredToken } from '../api/client';

interface DataStoreState {
  materials: ExtendedMaterial[];
  activities: ActivityModule[];
  quizzes: QuizPackage[];
  settings: SiteSettings;
  logs: ContentLog[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Initial fetch
  fetchAllData: () => Promise<void>;
  fetchMaterials: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchQuizzes: () => Promise<void>;
  fetchQuizById: (id: string) => Promise<QuizPackage | null>;
  fetchLogs: () => Promise<void>;

  // Auth actions
  login: (identity: string, pass: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;

  // Materials CRUD
  addMaterial: (item: Omit<ExtendedMaterial, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ExtendedMaterial>;
  updateMaterial: (id: string, updates: Partial<ExtendedMaterial>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  togglePublishMaterial: (id: string) => Promise<void>;
  reorderMaterials: (orderedIds: string[]) => Promise<void>;
  addMaterialComment: (
    materialId: string,
    comment: Omit<MaterialComment, 'id' | 'createdAt'>
  ) => Promise<MaterialComment>;

  // Activities CRUD
  addActivity: (item: Omit<ActivityModule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ActivityModule>;
  updateActivity: (id: string, updates: Partial<ActivityModule>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  togglePublishActivity: (id: string) => Promise<void>;

  // Quizzes CRUD
  addQuiz: (item: Omit<QuizPackage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<QuizPackage>;
  updateQuiz: (id: string, updates: Partial<QuizPackage>) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  togglePublishQuiz: (id: string) => Promise<void>;
  addQuestion: (quizId: string, question: Omit<QuizQuestion, 'id'>) => Promise<void>;
  updateQuestion: (quizId: string, questionId: string, updates: Partial<QuizQuestion>) => Promise<void>;
  deleteQuestion: (quizId: string, questionId: string) => Promise<void>;
  duplicateQuestion: (quizId: string, questionId: string) => Promise<void>;

  // Site Settings
  updateAdminProfile: (profile: Partial<SiteSettings['adminProfile']>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<boolean>;

  // Logs
  pushLog: (action: ContentLog['action'], entityType: ContentLog['entityType'], entityTitle: string) => void;
}

export const useDataStore = create<DataStoreState>((set, get) => ({
  materials: [],
  activities: [],
  quizzes: [],
  settings: {
    adminProfile: {
      username: 'admin',
      email: 'admin@ecoinclusive.edu',
      name: 'Pengelola Pembelajaran',
      role: 'admin',
      avatarUrl: '',
    },
  },
  logs: [],
  isAuthenticated: !!getStoredToken(),
  isLoading: false,
  error: null,

  fetchAllData: async () => {
    set({ isLoading: true, error: null });
    try {
      const isAuth = get().isAuthenticated;
      const [materialsRes, activitiesRes, quizzesRes] = await Promise.all([
        isAuth ? materialsApi.getAdminMaterials() : materialsApi.getMaterials(),
        isAuth ? activitiesApi.getAdminActivities() : activitiesApi.getActivities(),
        isAuth ? quizzesApi.getAdminQuizzes() : quizzesApi.getQuizzes(),
      ]);

      set({
        materials: materialsRes,
        activities: activitiesRes,
        quizzes: quizzesRes,
        isLoading: false,
      });

      if (isAuth) {
        get().fetchLogs();
      }
    } catch (err: any) {
      console.warn('Failed to fetch initial data from backend:', err);
      set({ isLoading: false, error: err.message || 'Gagal memuat data' });
    }
  },

  fetchMaterials: async () => {
    try {
      const isAuth = get().isAuthenticated;
      const data = isAuth
        ? await materialsApi.getAdminMaterials()
        : await materialsApi.getMaterials();
      set({ materials: data });
    } catch (err) {
      console.warn('Failed to fetch materials:', err);
    }
  },

  fetchActivities: async () => {
    try {
      const isAuth = get().isAuthenticated;
      const data = isAuth
        ? await activitiesApi.getAdminActivities()
        : await activitiesApi.getActivities();
      set({ activities: data });
    } catch (err) {
      console.warn('Failed to fetch activities:', err);
    }
  },

  fetchQuizzes: async () => {
    try {
      const isAuth = get().isAuthenticated;
      const data = isAuth
        ? await quizzesApi.getAdminQuizzes()
        : await quizzesApi.getQuizzes();
      set({ quizzes: data });
    } catch (err) {
      console.warn('Failed to fetch quizzes:', err);
    }
  },

  fetchQuizById: async (id: string) => {
    try {
      const fullQuiz = await quizzesApi.getQuiz(id);
      if (fullQuiz) {
        set((state) => {
          const exists = state.quizzes.some((q) => q.id === id);
          const updated = exists
            ? state.quizzes.map((q) => (q.id === id ? fullQuiz : q))
            : [...state.quizzes, fullQuiz];
          return { quizzes: updated };
        });
      }
      return fullQuiz;
    } catch (err) {
      console.warn(`Failed to fetch quiz ${id}:`, err);
      return null;
    }
  },

  fetchLogs: async () => {
    try {
      const res = await apiClient<{ success: boolean; data: ContentLog[] }>('/admin/logs');
      if (res.success && res.data) {
        set({ logs: res.data });
      }
    } catch (err) {
      console.warn('Failed to fetch logs:', err);
    }
  },

  checkAuth: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }
    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        set({
          isAuthenticated: true,
          settings: {
            adminProfile: {
              username: res.user.username,
              email: res.user.email,
              name: res.user.name,
              role: res.user.role,
              avatarUrl: res.user.avatarUrl,
            },
          },
        });
        return true;
      }
    } catch {
      authApi.logout();
      set({ isAuthenticated: false });
    }
    return false;
  },

  login: async (identity, pass) => {
    try {
      const res = await authApi.login(identity, pass);
      if (res.success && res.token) {
        set({
          isAuthenticated: true,
          settings: {
            adminProfile: {
              username: res.user.username,
              email: res.user.email,
              name: res.user.name,
              role: res.user.role,
              avatarUrl: res.user.avatarUrl,
            },
          },
        });
        // Refresh admin data
        get().fetchAllData();
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  },

  logout: () => {
    authApi.logout();
    set({ isAuthenticated: false });
    // Refetch public data
    get().fetchAllData();
  },

  pushLog: (action, entityType, entityTitle) => {
    const author = get().settings.adminProfile?.name || 'Admin';
    const newLog: ContentLog = {
      id: `log-${Date.now()}`,
      action,
      entityType,
      entityTitle,
      timestamp: new Date().toISOString(),
      author,
    };
    set({ logs: [newLog, ...get().logs].slice(0, 50) });
  },

  // Materials Actions
  addMaterial: async (item) => {
    const res = await materialsApi.createMaterial(item);
    const newMaterial: ExtendedMaterial = {
      ...item,
      id: res.id,
      slug: res.slug,
      comments: item.comments ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ materials: [...get().materials, newMaterial] });
    get().pushLog('create', 'Materi', newMaterial.title);
    return newMaterial;
  },

  updateMaterial: async (id, updates) => {
    await materialsApi.updateMaterial(id, updates);
    const updated = get().materials.map((m) => {
      if (m.id === id) {
        return { ...m, ...updates, updatedAt: new Date().toISOString() };
      }
      return m;
    });
    set({ materials: updated });
    const target = updated.find((m) => m.id === id);
    if (target) {
      get().pushLog('update', 'Materi', target.title);
    }
  },

  deleteMaterial: async (id) => {
    const target = get().materials.find((m) => m.id === id);
    await materialsApi.deleteMaterial(id);
    set({ materials: get().materials.filter((m) => m.id !== id) });
    if (target) {
      get().pushLog('delete', 'Materi', target.title);
    }
  },

  togglePublishMaterial: async (id) => {
    const newStatus = await materialsApi.togglePublish(id);
    const updated = get().materials.map((m) =>
      m.id === id ? { ...m, isPublished: newStatus, updatedAt: new Date().toISOString() } : m
    );
    set({ materials: updated });
    const target = updated.find((m) => m.id === id);
    if (target) {
      get().pushLog(
        newStatus ? 'publish' : 'update',
        'Materi',
        `${target.title} (${newStatus ? 'Terbit' : 'Draf'})`
      );
    }
  },

  reorderMaterials: async (orderedIds) => {
    const prevMaterials = get().materials;
    const map = new Map(prevMaterials.map((m) => [m.id, m]));
    const updated: ExtendedMaterial[] = [];
    orderedIds.forEach((id, idx) => {
      const item = map.get(id);
      if (item) {
        updated.push({ ...item, orderIndex: idx + 1 });
      }
    });
    set({ materials: updated });

    try {
      await materialsApi.reorderMaterials(orderedIds);
    } catch (err) {
      console.error('Failed to reorder materials:', err);
      set({ materials: prevMaterials });
      throw err;
    }
  },

  addMaterialComment: async (materialId, comment) => {
    const created = await commentsApi.postComment(materialId, comment);
    const updated = get().materials.map((m) =>
      m.id === materialId
        ? { ...m, comments: [...(m.comments ?? []), created] }
        : m
    );
    set({ materials: updated });
    return created;
  },

  // Activities Actions
  addActivity: async (item) => {
    const res = await activitiesApi.createActivity(item);
    const newAct: ActivityModule = {
      ...item,
      id: res.id,
      slug: res.slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ activities: [...get().activities, newAct] });
    get().pushLog('create', 'Aktivitas', newAct.title);
    return newAct;
  },

  updateActivity: async (id, updates) => {
    await activitiesApi.updateActivity(id, updates);
    const updated = get().activities.map((a) => {
      if (a.id === id) {
        return { ...a, ...updates, updatedAt: new Date().toISOString() };
      }
      return a;
    });
    set({ activities: updated });
    const target = updated.find((a) => a.id === id);
    if (target) {
      get().pushLog('update', 'Aktivitas', target.title);
    }
  },

  deleteActivity: async (id) => {
    const target = get().activities.find((a) => a.id === id);
    await activitiesApi.deleteActivity(id);
    set({ activities: get().activities.filter((a) => a.id !== id) });
    if (target) {
      get().pushLog('delete', 'Aktivitas', target.title);
    }
  },

  togglePublishActivity: async (id) => {
    const newStatus = await activitiesApi.togglePublish(id);
    const updated = get().activities.map((a) =>
      a.id === id ? { ...a, isPublished: newStatus, updatedAt: new Date().toISOString() } : a
    );
    set({ activities: updated });
    const target = updated.find((a) => a.id === id);
    if (target) {
      get().pushLog(
        newStatus ? 'publish' : 'update',
        'Aktivitas',
        `${target.title} (${newStatus ? 'Terbit' : 'Draf'})`
      );
    }
  },

  // Quizzes Actions
  addQuiz: async (item) => {
    const res = await quizzesApi.createQuiz(item);
    const newQuiz: QuizPackage = {
      ...item,
      id: res.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ quizzes: [...get().quizzes, newQuiz] });
    get().pushLog('create', 'Kuis', newQuiz.title);
    return newQuiz;
  },

  updateQuiz: async (id, updates) => {
    await quizzesApi.updateQuiz(id, updates);
    const updated = get().quizzes.map((q) => {
      if (q.id === id) {
        return { ...q, ...updates, updatedAt: new Date().toISOString() };
      }
      return q;
    });
    set({ quizzes: updated });
    const target = updated.find((q) => q.id === id);
    if (target) {
      get().pushLog('update', 'Kuis', target.title);
    }
  },

  deleteQuiz: async (id) => {
    const target = get().quizzes.find((q) => q.id === id);
    await quizzesApi.deleteQuiz(id);
    set({ quizzes: get().quizzes.filter((q) => q.id !== id) });
    if (target) {
      get().pushLog('delete', 'Kuis', target.title);
    }
  },

  togglePublishQuiz: async (id) => {
    const newStatus = await quizzesApi.togglePublish(id);
    const updated = get().quizzes.map((q) =>
      q.id === id ? { ...q, isPublished: newStatus, updatedAt: new Date().toISOString() } : q
    );
    set({ quizzes: updated });
    const target = updated.find((q) => q.id === id);
    if (target) {
      get().pushLog(
        newStatus ? 'publish' : 'update',
        'Kuis',
        `${target.title} (${newStatus ? 'Terbit' : 'Draf'})`
      );
    }
  },

  addQuestion: async (quizId, question) => {
    const quiz = get().quizzes.find((q) => q.id === quizId);
    if (!quiz) return;
    const newQ: QuizQuestion = {
      ...question,
      id: `q-${Date.now()}`,
    };
    const currentQuestions = quiz.questions || [];
    const updatedQuestions = [...currentQuestions, newQ];
    await quizzesApi.updateQuiz(quizId, { questions: updatedQuestions });
    get().updateQuiz(quizId, { questions: updatedQuestions });
  },

  updateQuestion: async (quizId, questionId, updates) => {
    const quiz = get().quizzes.find((q) => q.id === quizId);
    if (!quiz) return;
    const currentQuestions = quiz.questions || [];
    const updatedQuestions = currentQuestions.map((qn) =>
      qn.id === questionId ? { ...qn, ...updates } : qn
    );
    await quizzesApi.updateQuiz(quizId, { questions: updatedQuestions });
    get().updateQuiz(quizId, { questions: updatedQuestions });
  },

  deleteQuestion: async (quizId, questionId) => {
    const quiz = get().quizzes.find((q) => q.id === quizId);
    if (!quiz) return;
    const currentQuestions = quiz.questions || [];
    const updatedQuestions = currentQuestions.filter((qn) => qn.id !== questionId);
    await quizzesApi.updateQuiz(quizId, { questions: updatedQuestions });
    get().updateQuiz(quizId, { questions: updatedQuestions });
  },

  duplicateQuestion: async (quizId, questionId) => {
    const quiz = get().quizzes.find((q) => q.id === quizId);
    if (!quiz) return;
    const currentQuestions = quiz.questions || [];
    const targetQ = currentQuestions.find((qn) => qn.id === questionId);
    if (!targetQ) return;
    const dupQ: QuizQuestion = {
      ...targetQ,
      id: `q-${Date.now()}`,
      questionText: `${targetQ.questionText} (Salinan)`,
    };
    const updatedQuestions = [...currentQuestions, dupQ];
    await quizzesApi.updateQuiz(quizId, { questions: updatedQuestions });
    get().updateQuiz(quizId, { questions: updatedQuestions });
  },

  // Settings Actions
  updateAdminProfile: async (profile) => {
    await authApi.updateProfile(profile);
    const updated: SiteSettings = {
      ...get().settings,
      adminProfile: { ...get().settings.adminProfile, ...profile },
    };
    set({ settings: updated });
    get().pushLog('update', 'Pengaturan', 'Pembaruan Profil Administrator');
  },

  changePassword: async (newPassword) => {
    try {
      const res = await authApi.changePassword(newPassword);
      if (res.success) {
        get().pushLog('update', 'Pengaturan', 'Perubahan Kata Sandi Administrator');
        return true;
      }
    } catch (err) {
      console.error('Change password failed:', err);
    }
    return false;
  },
}));

// Automatic fetch on store initialization
if (typeof window !== 'undefined') {
  useDataStore.getState().fetchAllData();

  window.addEventListener('chem_cycle:unauthorized', () => {
    useDataStore.setState({ isAuthenticated: false });
  });
}
