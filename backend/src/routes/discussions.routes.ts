import { Hono } from 'hono';
import crypto from 'node:crypto';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  discussionPosts,
  discussionComments,
  discussionLikes,
  users,
} from '../db/schema.js';
import {
  createPostSchema,
  createCommentSchema,
  paginationQuerySchema,
} from '../schemas/discussion.schema.js';
import { validate } from '../utils/validator.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth-middleware.js';

export const discussionsRoutes = new Hono();

// GET /posts - Feed of posts with pagination
discussionsRoutes.get('/posts', optionalAuthMiddleware, validate('query', paginationQuerySchema), async (c) => {
  const user = c.get('user');
  const query = c.req.valid('query');
  const page = query.page || 1;
  const limit = query.limit || 10;
  const offset = (page - 1) * limit;

  const posts = await db
    .select({
      id: discussionPosts.id,
      content: discussionPosts.content,
      mediaUrl: discussionPosts.mediaUrl,
      likeCount: discussionPosts.likeCount,
      commentCount: discussionPosts.commentCount,
      createdAt: discussionPosts.createdAt,
      updatedAt: discussionPosts.updatedAt,
      authorId: discussionPosts.authorId,
      authorName: users.fullName,
      authorRole: users.role,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(discussionPosts)
    .innerJoin(users, eq(discussionPosts.authorId, users.id))
    .orderBy(desc(discussionPosts.createdAt))
    .limit(limit)
    .offset(offset);

  // If user is logged in, check which posts are liked
  const likedPostIds = new Set<string>();
  if (user && posts.length > 0) {
    const likes = await db
      .select({ postId: discussionLikes.postId })
      .from(discussionLikes)
      .where(eq(discussionLikes.userId, user.id));
    for (const l of likes) {
      likedPostIds.add(l.postId);
    }
  }

  const formattedPosts = posts.map((p) => ({
    id: p.id,
    content: p.content,
    mediaUrl: p.mediaUrl,
    likeCount: p.likeCount,
    commentCount: p.commentCount,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    hasLiked: likedPostIds.has(p.id),
    author: {
      id: p.authorId,
      fullName: p.authorName,
      role: p.authorRole,
      avatarUrl: p.authorAvatarUrl,
    },
  }));

  return c.json({
    success: true,
    data: {
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    },
    message: 'Feed diskusi berhasil diambil',
  });
});

// POST /posts - Create discussion post
discussionsRoutes.post(
  '/posts',
  authMiddleware,
  validate('json', createPostSchema),
  async (c) => {
    const user = c.get('user')!;
    const body = c.req.valid('json');

    const id = crypto.randomUUID();
    const now = new Date();

    const [post] = await db
      .insert(discussionPosts)
      .values({
        id,
        authorId: user.id,
        content: body.content,
        mediaUrl: body.mediaUrl || null,
        likeCount: 0,
        commentCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return c.json(
      {
        success: true,
        data: {
          ...post,
          hasLiked: false,
          author: {
            id: user.id,
            fullName: user.fullName,
            role: user.role,
          },
        },
        message: 'Postingan diskusi berhasil diterbitkan',
      },
      201
    );
  }
);

// DELETE /posts/:id - Delete post (Author or Admin)
discussionsRoutes.delete('/posts/:id', authMiddleware, async (c) => {
  const id = c.req.param('id') as string;
  const user = c.get('user')!;

  const matched = await db.select().from(discussionPosts).where(eq(discussionPosts.id, id));
  if (matched.length === 0) {
    return c.json({ success: false, message: 'Postingan tidak ditemukan' }, 404);
  }

  const post = matched[0];
  if (post.authorId !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses ditolak: Anda bukan pemilik postingan ini' }, 403);
  }

  await db.delete(discussionPosts).where(eq(discussionPosts.id, id));

  return c.json({
    success: true,
    message: 'Postingan diskusi berhasil dihapus',
  });
});

// POST /posts/:id/like - Toggle like on post
discussionsRoutes.post('/posts/:id/like', authMiddleware, async (c) => {
  const postId = c.req.param('id') as string;
  const user = c.get('user')!;

  const matched = await db.select().from(discussionPosts).where(eq(discussionPosts.id, postId));
  if (matched.length === 0) {
    return c.json({ success: false, message: 'Postingan tidak ditemukan' }, 404);
  }

  const existingLike = await db
    .select()
    .from(discussionLikes)
    .where(and(eq(discussionLikes.postId, postId), eq(discussionLikes.userId, user.id)));

  let hasLiked = false;
  let newLikeCount = matched[0].likeCount;

  if (existingLike.length > 0) {
    // Unlike
    await db.delete(discussionLikes).where(eq(discussionLikes.id, existingLike[0].id));
    newLikeCount = Math.max(0, newLikeCount - 1);
    await db
      .update(discussionPosts)
      .set({ likeCount: newLikeCount })
      .where(eq(discussionPosts.id, postId));
    hasLiked = false;
  } else {
    // Like
    await db.insert(discussionLikes).values({
      id: crypto.randomUUID(),
      postId,
      userId: user.id,
      createdAt: new Date(),
    });
    newLikeCount = newLikeCount + 1;
    await db
      .update(discussionPosts)
      .set({ likeCount: newLikeCount })
      .where(eq(discussionPosts.id, postId));
    hasLiked = true;
  }

  return c.json({
    success: true,
    message: hasLiked ? 'Postingan disukai' : 'Batal menyukai postingan',
    data: {
      hasLiked,
      likeCount: newLikeCount,
    },
  });
});

// GET /posts/:id/comments - Get threaded comments tree for post
discussionsRoutes.get('/posts/:id/comments', async (c) => {
  const postId = c.req.param('id') as string;

  const post = await db.select().from(discussionPosts).where(eq(discussionPosts.id, postId));
  if (post.length === 0) {
    return c.json({ success: false, message: 'Postingan tidak ditemukan' }, 404);
  }

  // Fetch all comments in a single query ordered chronologically
  const allComments = await db
    .select({
      id: discussionComments.id,
      postId: discussionComments.postId,
      parentCommentId: discussionComments.parentCommentId,
      content: discussionComments.content,
      createdAt: discussionComments.createdAt,
      updatedAt: discussionComments.updatedAt,
      authorId: discussionComments.authorId,
      authorName: users.fullName,
      authorRole: users.role,
      authorAvatarUrl: users.avatarUrl,
    })
    .from(discussionComments)
    .innerJoin(users, eq(discussionComments.authorId, users.id))
    .where(eq(discussionComments.postId, postId))
    .orderBy(asc(discussionComments.createdAt));

  // Build threaded comment tree in memory with O(N) complexity
  interface ThreadedComment {
    id: string;
    postId: string;
    parentCommentId: string | null;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      fullName: string;
      role: 'admin' | 'student';
      avatarUrl: string | null;
    };
    replies: ThreadedComment[];
  }

  const commentMap = new Map<string, ThreadedComment>();
  const rootComments: ThreadedComment[] = [];

  for (const row of allComments) {
    commentMap.set(row.id, {
      id: row.id,
      postId: row.postId,
      parentCommentId: row.parentCommentId,
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.authorId,
        fullName: row.authorName,
        role: row.authorRole,
        avatarUrl: row.authorAvatarUrl,
      },
      replies: [],
    });
  }

  for (const row of allComments) {
    const node = commentMap.get(row.id)!;
    if (row.parentCommentId && commentMap.has(row.parentCommentId)) {
      commentMap.get(row.parentCommentId)!.replies.push(node);
    } else {
      rootComments.push(node);
    }
  }

  return c.json({
    success: true,
    data: rootComments,
    message: 'Daftar komentar berhasil diambil',
  });
});

// POST /posts/:id/comments - Add comment (or reply) to post
discussionsRoutes.post(
  '/posts/:id/comments',
  authMiddleware,
  validate('json', createCommentSchema),
  async (c) => {
    const postId = c.req.param('id') as string;
    const user = c.get('user')!;
    const body = c.req.valid('json');

    const matched = await db.select().from(discussionPosts).where(eq(discussionPosts.id, postId));
    if (matched.length === 0) {
      return c.json({ success: false, message: 'Postingan tidak ditemukan' }, 404);
    }

    if (body.parentCommentId) {
      const parentMatched = await db
        .select()
        .from(discussionComments)
        .where(
          and(
            eq(discussionComments.id, body.parentCommentId),
            eq(discussionComments.postId, postId)
          )
        );
      if (parentMatched.length === 0) {
        return c.json({ success: false, message: 'Komentar induk tidak ditemukan' }, 404);
      }
    }

    const commentId = crypto.randomUUID();
    const now = new Date();

    const [comment] = await db
      .insert(discussionComments)
      .values({
        id: commentId,
        postId,
        authorId: user.id,
        parentCommentId: body.parentCommentId || null,
        content: body.content,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Increment post commentCount
    await db
      .update(discussionPosts)
      .set({ commentCount: sql`${discussionPosts.commentCount} + 1` })
      .where(eq(discussionPosts.id, postId));

    return c.json(
      {
        success: true,
        data: {
          ...comment,
          author: {
            id: user.id,
            fullName: user.fullName,
            role: user.role,
          },
        },
        message: 'Komentar berhasil ditambahkan',
      },
      201
    );
  }
);

// DELETE /comments/:id - Delete comment (Author or Admin)
discussionsRoutes.delete('/comments/:id', authMiddleware, async (c) => {
  const id = c.req.param('id') as string;
  const user = c.get('user')!;

  const matched = await db
    .select()
    .from(discussionComments)
    .where(eq(discussionComments.id, id));

  if (matched.length === 0) {
    return c.json({ success: false, message: 'Komentar tidak ditemukan' }, 404);
  }

  const comment = matched[0];
  if (comment.authorId !== user.id && user.role !== 'admin') {
    return c.json({ success: false, message: 'Akses ditolak: Anda bukan pemilik komentar ini' }, 403);
  }

  await db.delete(discussionComments).where(eq(discussionComments.id, id));

  // Decrement commentCount
  await db
    .update(discussionPosts)
    .set({
      commentCount: sql`MAX(0, ${discussionPosts.commentCount} - 1)`,
    })
    .where(eq(discussionPosts.id, comment.postId));

  return c.json({
    success: true,
    message: 'Komentar berhasil dihapus',
  });
});
