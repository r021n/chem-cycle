import { apiClient } from './client';
import { ExtendedMaterial } from '../types/app';

export const materialsApi = {
  async getMaterials(): Promise<ExtendedMaterial[]> {
    const res = await apiClient<{ success: boolean; data: ExtendedMaterial[] }>('/materials');
    return res.data;
  },

  async getAdminMaterials(): Promise<ExtendedMaterial[]> {
    const res = await apiClient<{ success: boolean; data: ExtendedMaterial[] }>('/materials/admin/all');
    return res.data;
  },

  async getMaterial(idOrSlug: string): Promise<ExtendedMaterial> {
    const res = await apiClient<{ success: boolean; data: ExtendedMaterial }>(`/materials/${idOrSlug}`);
    return res.data;
  },

  async createMaterial(
    data: Omit<ExtendedMaterial, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ id: string; slug: string }> {
    const res = await apiClient<{ success: boolean; data: { id: string; slug: string } }>('/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateMaterial(id: string, data: Partial<ExtendedMaterial>): Promise<void> {
    await apiClient(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMaterial(id: string): Promise<void> {
    await apiClient(`/materials/${id}`, {
      method: 'DELETE',
    });
  },

  async togglePublish(id: string): Promise<boolean> {
    const res = await apiClient<{ success: boolean; isPublished: boolean }>(`/materials/${id}/publish`, {
      method: 'PATCH',
    });
    return res.isPublished;
  },

  async reorderMaterials(orderedIds: string[]): Promise<void> {
    await apiClient('/materials/reorder', {
      method: 'PUT',
      body: JSON.stringify({ orderedIds }),
    });
  },
};
