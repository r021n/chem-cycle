import { apiClient } from './client';
import { ActivityModule } from '../types/app';

export const activitiesApi = {
  async getActivities(): Promise<ActivityModule[]> {
    const res = await apiClient<{ success: boolean; data: ActivityModule[] }>('/activities');
    return res.data;
  },

  async getAdminActivities(): Promise<ActivityModule[]> {
    const res = await apiClient<{ success: boolean; data: ActivityModule[] }>('/activities/admin/all');
    return res.data;
  },

  async getActivity(idOrSlug: string): Promise<ActivityModule> {
    const res = await apiClient<{ success: boolean; data: ActivityModule }>(`/activities/${idOrSlug}`);
    return res.data;
  },

  async createActivity(
    data: Omit<ActivityModule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: string; slug: string }> {
    const res = await apiClient<{ success: boolean; data: { id: string; slug: string } }>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateActivity(id: string, data: Partial<ActivityModule>): Promise<void> {
    await apiClient(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteActivity(id: string): Promise<void> {
    await apiClient(`/activities/${id}`, {
      method: 'DELETE',
    });
  },

  async togglePublish(id: string): Promise<boolean> {
    const res = await apiClient<{ success: boolean; isPublished: boolean }>(`/activities/${id}/publish`, {
      method: 'PATCH',
    });
    return res.isPublished;
  },
};
