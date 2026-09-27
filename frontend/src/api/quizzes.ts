import { apiClient } from './client';
import { QuizPackage } from '../types/app';

export const quizzesApi = {
  async getQuizzes(): Promise<QuizPackage[]> {
    const res = await apiClient<{ success: boolean; data: QuizPackage[] }>('/quizzes');
    return res.data;
  },

  async getAdminQuizzes(): Promise<QuizPackage[]> {
    const res = await apiClient<{ success: boolean; data: QuizPackage[] }>('/quizzes/admin/all');
    return res.data;
  },

  async getQuiz(id: string): Promise<QuizPackage> {
    const res = await apiClient<{ success: boolean; data: QuizPackage }>(`/quizzes/${id}`);
    return res.data;
  },

  async createQuiz(
    data: Omit<QuizPackage, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: string }> {
    const res = await apiClient<{ success: boolean; data: { id: string } }>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateQuiz(id: string, data: Partial<QuizPackage>): Promise<void> {
    await apiClient(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteQuiz(id: string): Promise<void> {
    await apiClient(`/quizzes/${id}`, {
      method: 'DELETE',
    });
  },

  async togglePublish(id: string): Promise<boolean> {
    const res = await apiClient<{ success: boolean; isPublished: boolean }>(`/quizzes/${id}/publish`, {
      method: 'PATCH',
    });
    return res.isPublished;
  },
};
