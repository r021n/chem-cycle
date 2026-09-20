export interface DiscussionComment {
  id: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string;
    role: 'admin' | 'student';
    avatarUrl?: string | null;
  };
  replies: DiscussionComment[];
}

export interface DiscussionPost {
  id: string;
  content: string;
  mediaUrl?: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  hasLiked: boolean;
  author: {
    id: string;
    fullName: string;
    role: 'admin' | 'student';
    avatarUrl?: string | null;
  };
}

export interface CreatePostPayload {
  content: string;
  mediaUrl?: string | null;
}

export interface CreateCommentPayload {
  content: string;
  parentCommentId?: string | null;
}
