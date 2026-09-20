# ChemCycle Backend API

Platform edukasi kimia interaktif modern berbasis Hono v4, Drizzle ORM, dan LibSQL (Dual Environment: SQLite lokal & Turso Cloud).

---

## 🛠️ Tech Stack (Standar 2026)
- **HTTP Engine:** Hono v4 (`hono`, `@hono/node-server`)
- **Database & ORM:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`) + LibSQL (`@libsql/client`)
- **Validasi Schema:** Zod (`zod`, `@hono/zod-validator`)
- **Autentikasi & Keamanan:** Stateless JWT (`hono/jwt`) + Bcrypt (`bcryptjs`)
- **File Upload Handler:** Multipart Form Data + Local/Cloud Storage Abstraction
- **Pengujian:** Vitest (Unit & Integration Testing)
- **Linter & Typecheck:** ESLint v9 Flat Config (`typescript-eslint`), TypeScript Strict NodeNext

---

## 🚀 Perintah Cepat

```bash
# Pindah ke direktori backend
cd backend

# Install dependensi
npm install

# Typecheck (Pemeriksaan tipe data TypeScript)
npm run typecheck

# Lint (Pemeriksaan linter)
npm run lint

# Jalankan seluruh unit test & integration test
npm run test

# Migrasi Drizzle
npm run db:generate
npm run db:push

# Seeder data awal (Guru, Siswa, Modul, Materi AST, Kuis, Aktivitas, Diskusi)
npm run db:seed

# Menjalankan server development
npm run dev
```

---

## 🔑 Akun Bawaan (Hasil Seeder)
| Peran | Email / Username | Kata Sandi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Guru (Admin)** | `guru@chemcycle.id` / `gurukimia` | `admin123` | Akses penuh modul materi, pembuatan kuis & monitoring nilai siswa, pengumuman aktivitas. |
| **Siswa (Student)** | `siswa@chemcycle.id` / `siswakimia` | `siswa123` | Akses baca materi, ujian kuis interaktif, pengerjaan tugas kelas, dan forum diskusi. |

---

## 📡 Daftar RESTful API Endpoints (`/api/v1`)

### 1. Autentikasi (`/api/v1/auth`)
- `POST /register` - Registrasi akun baru (siswa/guru)
- `POST /login` - Login akun dan memperoleh token JWT
- `GET /me` - Mendapatkan profil pengguna aktif (Bearer token)
- `PATCH /change-password` - Ganti kata sandi pengguna

### 2. Modul & Materi Notion AST (`/api/v1/modules` & `/api/v1/materials`)
- `GET /modules` - Daftar modul bab beserta sub-materi bersarang
- `POST /modules` - Buat modul bab baru *(Admin)*
- `GET /modules/:id` - Detail modul
- `PUT /modules/:id` - Perbarui modul *(Admin)*
- `DELETE /modules/:id` - Hapus modul *(Admin)*
- `GET /materials/:slug` - Detail halaman materi dengan struktur BlockNote AST
- `POST /materials` - Buat halaman materi baru dengan blok Notion *(Admin)*
- `PUT /materials/:id` - Simpan / autosave materi *(Admin)*
- `DELETE /materials/:id` - Hapus materi *(Admin)*

### 3. Kuis & Engine Ujian Siswa (`/api/v1/quizzes` & `/api/v1/attempts`)
- `GET /quizzes` - Daftar seluruh kuis dan jumlah soal
- `POST /quizzes` - Buat kuis baru *(Admin)*
- `GET /quizzes/:id` - Detail kuis (kunci jawaban & pembahasan disaring otomatis untuk siswa)
- `PUT /quizzes/:id` - Perbarui metadata kuis *(Admin)*
- `DELETE /quizzes/:id` - Hapus kuis *(Admin)*
- `POST /quizzes/:id/questions` - Tambah soal multikonten AST *(Admin)*
- `PUT /questions/:questionId` - Perbarui soal dan pilihan opsi *(Admin)*
- `DELETE /questions/:questionId` - Hapus soal *(Admin)*
- `POST /quizzes/:id/attempts` - Mulai sesi ujian baru bagi siswa (sequential attempt tracking)
- `POST /attempts/:attemptId/submit` - Kumpulkan jawaban (kalkulasi nilai otomatis & passing score)
- `GET /quizzes/:id/my-attempts` - Riwayat percobaan siswa yang sedang login
- `GET /quizzes/:id/monitoring` - **Monitoring Guru**: Rekap progres seluruh siswa, nilai tertinggi, dan lembar jawaban *(Admin)*
- `GET /attempts/:attemptId/details` - Review detail lembar jawaban dan pembahasan

### 4. Aktivitas Kelas Gaya Google Classroom (`/api/v1/activities`)
- `GET /activities` - Feed pengumuman guru berurutan kronologis (pinned first)
- `POST /activities` - Terbitkan pengumuman aktivitas baru *(Admin)*
- `PUT /activities/:id` - Perbarui aktivitas *(Admin)*
- `DELETE /activities/:id` - Hapus aktivitas *(Admin)*
- `POST /activities/:id/attachments` - Tambah lampiran file / tautan *(Admin)*
- `DELETE /attachments/:id` - Hapus lampiran *(Admin)*
- `POST /activities/:id/toggle-done` - Tandai aktivitas telah selesai / belum selesai *(Siswa)*

### 5. Diskusi Sosial Gaya Instagram (`/api/v1/discussions`)
- `GET /discussions/posts` - Feed postingan tanya-jawab dengan paginasi
- `POST /discussions/posts` - Buat postingan diskusi baru
- `DELETE /discussions/posts/:id` - Hapus postingan (Pemilik / Admin)
- `POST /discussions/posts/:id/like` - Toggle suka (Like/Unlike)
- `GET /discussions/posts/:id/comments` - Ambil komentar berstruktur pohon bersarang (*Threaded tree*)
- `POST /discussions/posts/:id/comments` - Tambah komentar utama atau balasan
- `DELETE /discussions/comments/:id` - Hapus komentar (Pemilik / Admin)

### 6. File Upload Handler (`/api/v1/uploads`)
- `POST /uploads/image` - Upload gambar untuk block editor materi, kuis, atau diskusi (Maks 10MB)
- `POST /uploads/document` - Upload dokumen panduan PDF/Word untuk tugas kelas *(Admin, Maks 50MB)*
