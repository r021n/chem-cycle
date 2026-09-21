import crypto from 'node:crypto';
import { db } from './index.js';
import {
  users,
  materials,
  quizzes,
  questions,
  questionOptions,
  activities,
  activityAttachments,
  activitySubmissions,
  quizAttempts,
  attemptAnswers,
  discussionPosts,
  discussionComments,
  discussionLikes,
} from './schema.js';
import { hashPassword } from '../utils/password.js';

export async function seed() {
  console.log('Seeding initial ChemCycle database...');
  const now = new Date();

  // 1. Clear existing records in reverse order
  await db.delete(discussionLikes);
  await db.delete(discussionComments);
  await db.delete(discussionPosts);
  await db.delete(activitySubmissions);
  await db.delete(activityAttachments);
  await db.delete(activities);
  await db.delete(attemptAnswers);
  await db.delete(quizAttempts);
  await db.delete(questionOptions);
  await db.delete(questions);
  await db.delete(quizzes);
  await db.delete(materials);
  await db.delete(users);

  // 2. Users (Teacher / Admin & Student)
  const teacherId = 'user-guru-1';
  const studentId = 'user-siswa-1';

  const teacherPassword = await hashPassword('admin123');
  const studentPassword = await hashPassword('siswa123');

  await db.insert(users).values([
    {
      id: teacherId,
      username: 'gurukimia',
      email: 'guru@chemcycle.id',
      passwordHash: teacherPassword,
      fullName: 'Dra. Siti Nurhaliza, M.Pd.',
      identityNumber: '198503152010012015',
      role: 'admin',
      bio: 'Guru Kimia SMA Negeri 1 & Koordinator Siklus Belajar ChemCycle',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: studentId,
      username: 'siswakimia',
      email: 'siswa@chemcycle.id',
      passwordHash: studentPassword,
      fullName: 'Budi Pratama',
      identityNumber: '0054321987',
      role: 'student',
      bio: 'Siswa Kelas XI IPA - Peminatan Kimia',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // 3. Material (BlockNote AST structure)
  const materialAst = [
    {
      id: 'block-1',
      type: 'heading',
      props: { level: 1 },
      content: [{ type: 'text', text: 'Pengantar Termokimia dan Azas Kekekalan Energi', styles: {} }],
    },
    {
      id: 'block-2',
      type: 'paragraph',
      props: {},
      content: [
        {
          type: 'text',
          text: 'Termokimia adalah cabang ilmu kimia yang mempelajari kalor atau energi yang menyertai suatu reaksi kimia, baik yang diserap maupun yang dilepaskan.',
          styles: {},
        },
      ],
    },
    {
      id: 'block-3',
      type: 'heading',
      props: { level: 2 },
      content: [{ type: 'text', text: 'Klasifikasi Sistem dan Lingkungan', styles: {} }],
    },
    {
      id: 'block-4',
      type: 'bulletListItem',
      props: {},
      content: [
        { type: 'text', text: 'Sistem Terbuka: ', styles: { bold: true } },
        { type: 'text', text: 'Dapat terjadi pertukaran materi dan energi dengan lingkungan sekitar.', styles: {} },
      ],
    },
    {
      id: 'block-5',
      type: 'bulletListItem',
      props: {},
      content: [
        { type: 'text', text: 'Sistem Tertutup: ', styles: { bold: true } },
        { type: 'text', text: 'Hanya terjadi pertukaran energi kalor, materi tidak dapat keluar/masuk.', styles: {} },
      ],
    },
    {
      id: 'block-6',
      type: 'bulletListItem',
      props: {},
      content: [
        { type: 'text', text: 'Sistem Terisolasi: ', styles: { bold: true } },
        { type: 'text', text: 'Tidak ada pertukaran materi maupun energi sama sekali.', styles: {} },
      ],
    },
  ];

  await db.insert(materials).values({
    id: 'mat-sistem-lingkungan-1',
    title: 'Sistem, Lingkungan, dan Hukum Kekekalan Energi',
    slug: 'sistem-lingkungan-dan-hukum-kekekalan-energi',
    contentJson: JSON.stringify(materialAst),
    summary: 'Mempelajari perbedaan sistem terbuka, tertutup, dan terisolasi dalam termokimia.',
    estimatedReadTime: 10,
    orderIndex: 1,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  });

  // 5. Quiz & Questions
  const quizId = 'quiz-termokimia-1';
  await db.insert(quizzes).values({
    id: quizId,
    title: 'Kuis Pemahaman 1: Konsep Sistem dan Reaksi Eksoterm',
    slug: 'kuis-pemahaman-1-sistem-dan-reaksi-eksoterm',
    description: 'Evaluasi pemahaman konsep perpindahan kalor antara sistem dan lingkungan.',
    timeLimitMinutes: 15,
    passingScore: 70,
    maxAttempts: 3,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  });

  // Question 1
  const q1Id = 'q-termo-1';
  await db.insert(questions).values({
    id: q1Id,
    quizId,
    promptJson: JSON.stringify([
      {
        id: 'qp-1',
        type: 'paragraph',
        content: [{ type: 'text', text: 'Sebuah termos air panas yang tertutup rapat dan memiliki lapisan isolator sempurna merupakan contoh dari...' }],
      },
    ]),
    questionType: 'multiple_choice',
    scoreWeight: 50,
    orderIndex: 1,
    explanationJson: JSON.stringify([
      {
        id: 'exp-1',
        type: 'paragraph',
        content: [{ type: 'text', text: 'Termos tertutup berinsulasi mencegah pertukaran materi maupun kalor dengan lingkungan, sehingga merupakan sistem terisolasi.' }],
      },
    ]),
    createdAt: now,
  });

  const opt1CorrectId = 'opt-q1-b';
  await db.insert(questionOptions).values([
    { id: 'opt-q1-a', questionId: q1Id, optionKey: 'A', content: 'Sistem Terbuka', isCorrect: false },
    { id: opt1CorrectId, questionId: q1Id, optionKey: 'B', content: 'Sistem Terisolasi', isCorrect: true },
    { id: 'opt-q1-c', questionId: q1Id, optionKey: 'C', content: 'Sistem Tertutup', isCorrect: false },
    { id: 'opt-q1-d', questionId: q1Id, optionKey: 'D', content: 'Lingkungan Statis', isCorrect: false },
  ]);

  // Question 2
  const q2Id = 'q-termo-2';
  await db.insert(questions).values({
    id: q2Id,
    quizId,
    promptJson: JSON.stringify([
      {
        id: 'qp-2',
        type: 'paragraph',
        content: [{ type: 'text', text: 'Pada reaksi eksoterm, pernyataan yang paling tepat mengenai perubahan entalpi (ΔH) adalah...' }],
      },
    ]),
    questionType: 'multiple_choice',
    scoreWeight: 50,
    orderIndex: 2,
    explanationJson: JSON.stringify([
      {
        id: 'exp-2',
        type: 'paragraph',
        content: [{ type: 'text', text: 'Reaksi eksoterm melepaskan kalor dari sistem ke lingkungan, sehingga entalpi berkurang dan ΔH bernilai negatif (ΔH < 0).' }],
      },
    ]),
    createdAt: now,
  });

  await db.insert(questionOptions).values([
    { id: 'opt-q2-a', questionId: q2Id, optionKey: 'A', content: 'ΔH > 0 karena sistem menyerap kalor', isCorrect: false },
    { id: 'opt-q2-b', questionId: q2Id, optionKey: 'B', content: 'ΔH < 0 karena sistem melepaskan kalor ke lingkungan', isCorrect: true },
    { id: 'opt-q2-c', questionId: q2Id, optionKey: 'C', content: 'ΔH = 0 karena tidak ada perpindahan kalor', isCorrect: false },
    { id: 'opt-q2-d', questionId: q2Id, optionKey: 'D', content: 'Suhu lingkungan mengalami penurunan drastis', isCorrect: false },
  ]);

  // 6. Activity & Attachment
  const actId = 'act-praktikum-1';
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(activities).values({
    id: actId,
    authorId: teacherId,
    title: 'Tugas Eksplorasi Mandiri: Kalorimeter Sederhana',
    instruction:
      'Silakan pelajari modul termokimia kemudian simulasikan kalorimeter sederhana menggunakan air panas dan air dingin di rumah. Unduh lembar kerja terlampir.',
    dueDate,
    isPinned: true,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(activityAttachments).values({
    id: 'att-kalorimeter-1',
    activityId: actId,
    type: 'document',
    title: 'Panduan_Praktikum_Kalorimeter.pdf',
    url: '/uploads/documents/Panduan_Praktikum_Kalorimeter.pdf',
    fileSize: 1048576,
    mimeType: 'application/pdf',
    createdAt: now,
  });

  // 7. Discussion Post, Like & Threaded Comments
  const postId = 'post-diskusi-1';
  await db.insert(discussionPosts).values({
    id: postId,
    authorId: studentId,
    content:
      'Halo Bu Siti dan teman-teman, saat melarutkan deterjen ke dalam air timbul rasa hangat di wadah. Apakah itu termasuk reaksi eksotermik?',
    mediaUrl: null,
    likeCount: 1,
    commentCount: 2,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(discussionLikes).values({
    id: crypto.randomUUID(),
    postId,
    userId: teacherId,
    createdAt: now,
  });

  const comm1Id = 'comm-1';
  await db.insert(discussionComments).values([
    {
      id: comm1Id,
      postId,
      authorId: teacherId,
      parentCommentId: null,
      content:
        'Betul sekali Budi! Pelarutan sebagian deterjen melepaskan kalor pelarutan (ΔH pelarutan negatif), sehingga suhu wadah dan larutan meningkat.',
      createdAt: new Date(now.getTime() + 1000),
      updatedAt: new Date(now.getTime() + 1000),
    },
    {
      id: 'comm-2-reply',
      postId,
      authorId: studentId,
      parentCommentId: comm1Id,
      content: 'Terima kasih penjelasannya Bu! Berarti sistemnya adalah partikel deterjen dan molekul air ya?',
      createdAt: new Date(now.getTime() + 2000),
      updatedAt: new Date(now.getTime() + 2000),
    },
  ]);

  console.log('Seeding completed successfully!');
}

// Run directly if invoked as standalone script
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
