import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { PostCard } from '../../src/features/discussions/post-card';
import { api } from '../../src/lib/api-client';
import { useAuthStore } from '../../src/stores/auth-store';
import { DiscussionPost } from '../../src/types/discussion';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
    },
  });

describe('Discussions Social Feed Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().setAuth(
      {
        id: 'usr-siswa',
        username: 'siswa',
        email: 'siswa@chemcycle.id',
        fullName: 'Budi Pratama',
        role: 'student',
      },
      'token-123'
    );
    vi.restoreAllMocks();
  });

  it('should toggle like optimistically and update like count', async () => {
    const mockPost: DiscussionPost = {
      id: 'post-1',
      content: 'Apakah pencampuran deterjen dengan air reaksi eksoterm?',
      likeCount: 5,
      commentCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasLiked: false,
      author: {
        id: 'usr-siswa',
        fullName: 'Budi Pratama',
        role: 'student',
      },
    };

    const mockLikeApi = vi.spyOn(api, 'post').mockResolvedValueOnce({
      success: true,
      message: 'Postingan disukai',
      data: { hasLiked: true, likeCount: 6 },
    });

    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <BrowserRouter>
          <PostCard post={mockPost} onDeletePost={() => {}} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('5 Suka')).toBeInTheDocument();

    const likeButton = screen.getByRole('button', { name: /5 Suka/i });
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(mockLikeApi).toHaveBeenCalledWith('/discussions/posts/post-1/like');
      expect(screen.getByText('6 Suka')).toBeInTheDocument();
    });
  });

  it('should open comments drawer and render threaded comments', async () => {
    const mockPost: DiscussionPost = {
      id: 'post-2',
      content: 'Bagaimana rumus kalor jenis?',
      likeCount: 3,
      commentCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasLiked: false,
      author: {
        id: 'usr-siswa',
        fullName: 'Budi Pratama',
        role: 'student',
      },
    };

    const mockComments = [
      {
        id: 'c-1',
        postId: 'post-2',
        parentCommentId: null,
        content: 'Rumusnya adalah Q = m * c * ΔT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: 'guru-1',
          fullName: 'Siti Nurhaliza',
          role: 'admin' as const,
        },
        replies: [
          {
            id: 'c-2',
            postId: 'post-2',
            parentCommentId: 'c-1',
            content: 'Terima kasih penjelasannya Bu!',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: {
              id: 'usr-siswa',
              fullName: 'Budi Pratama',
              role: 'student' as const,
            },
            replies: [],
          },
        ],
      },
    ];

    vi.spyOn(api, 'get').mockResolvedValueOnce({
      success: true,
      data: mockComments,
    });

    const testQueryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={testQueryClient}>
        <BrowserRouter>
          <PostCard post={mockPost} onDeletePost={() => {}} />
        </BrowserRouter>
      </QueryClientProvider>
    );

    const commentToggleBtn = screen.getByRole('button', { name: /1 Komentar/i });
    fireEvent.click(commentToggleBtn);

    await waitFor(() => {
      expect(screen.getByText('Rumusnya adalah Q = m * c * ΔT')).toBeInTheDocument();
      expect(screen.getByText('Terima kasih penjelasannya Bu!')).toBeInTheDocument();
    });
  });
});
