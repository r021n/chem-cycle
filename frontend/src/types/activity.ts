export interface ActivityAttachment {
  id: string;
  activityId?: string;
  type: 'document' | 'link';
  title: string;
  url: string;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
}

export interface ActivitySubmission {
  id: string;
  activityId: string;
  userId: string;
  status: 'pending' | 'completed';
  completedAt?: string | null;
}

export interface Activity {
  id: string;
  title: string;
  instruction: string;
  dueDate?: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string;
    role: 'admin' | 'student';
    avatarUrl?: string | null;
  };
  attachments: ActivityAttachment[];
  isDone: boolean;
  submission?: ActivitySubmission | null;
}

export interface CreateActivityPayload {
  title: string;
  instruction: string;
  dueDate?: string | null;
  isPinned?: boolean;
  attachments?: {
    type: 'document' | 'link';
    title: string;
    url: string;
    fileSize?: number;
    mimeType?: string;
  }[];
}
