import { apiClient } from './client';
import { MaterialComment } from '../types/app';

export interface CommentInput {
  name: string;
  email?: string;
  body: string;
  website_hp?: string; // Honeypot field
}

export const commentsApi = {
  async getComments(materialId: string): Promise<MaterialComment[]> {
    const res = await apiClient<{ success: boolean; data: MaterialComment[] }>(
      `/materials/${materialId}/comments`
    );
    return res.data;
  },

  async postComment(
    materialId: string,
    comment: CommentInput
  ): Promise<MaterialComment> {
    const res = await apiClient<{ success: boolean; data: MaterialComment }>(
      `/materials/${materialId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify(comment),
      }
    );
    return res.data;
  },

  async deleteComment(id: string): Promise<void> {
    await apiClient(`/comments/${id}`, {
      method: 'DELETE',
    });
  },
};
