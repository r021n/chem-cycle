import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes default
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  materials: {
    list: ['materials', 'list'] as const,
    detail: (slug: string) => ['materials', 'detail', slug] as const,
  },
  quizzes: {
    list: ['quizzes', 'list'] as const,
    detail: (id: string) => ['quizzes', id] as const,
    myAttempts: (id: string) => ['quizzes', id, 'my-attempts'] as const,
    attemptDetail: (attemptId: string) => ['quizzes', 'attempts', attemptId, 'details'] as const,
    monitoring: (id: string) => ['quizzes', id, 'monitoring'] as const,
  },
  activities: {
    stream: ['activities', 'stream'] as const,
  },
  discussions: {
    feed: (page = 1) => ['discussions', 'feed', page] as const,
    comments: (postId: string) => ['discussions', postId, 'comments'] as const,
  },
};
