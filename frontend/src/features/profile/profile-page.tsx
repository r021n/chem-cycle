import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { api, ApiError } from '../../lib/api-client';

export const ProfilePage: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  const isAdmin = user?.role === 'admin';
  const displayName = user?.fullName || (isAdmin ? 'Dr. Surya Wirawan' : 'Budi Pratama');
  const displayEmail = user?.email || (isAdmin ? 'surya.wirawan@chemcycle.edu' : 'budi.pratama@chemcycle.edu');
  const initial = displayName[0]?.toUpperCase() || 'U';

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      addToast('Kata sandi baru minimal 6 karakter', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('Konfirmasi kata sandi baru tidak cocok', 'error');
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await api.patch<{ success: boolean; message: string }>(
        '/auth/change-password',
        {
          currentPassword,
          newPassword,
        }
      );

      if (res.success) {
        addToast('Kata sandi berhasil diperbarui!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Gagal memperbarui kata sandi';
      addToast(msg, 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <section id="page-profil" className="page-view max-w-xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-chem-border">
        <h2 className="font-serif text-2xl sm:text-3xl text-chem-dark">Profil & Kredensial</h2>
        <p className="text-xs text-chem-ash mt-0.5">
          Identitas penugasan akademik dan pengelolaan keamanan kata sandi.
        </p>
      </div>

      {/* Profile Card (Section 4.7.1) */}
      <div className="bg-white rounded-3xl border border-chem-border p-6 shadow-subtle text-center space-y-4">
        <div
          id="profileCardAvatar"
          className="w-20 h-20 rounded-full bg-chem-forest text-chem-glow font-sans text-2xl font-bold flex items-center justify-center mx-auto border-4 border-chem-glow shadow-xs"
        >
          {initial}
        </div>
        <div>
          <h2 id="profileCardName" className="font-serif text-xl font-bold text-chem-dark">
            {displayName}
          </h2>
          <p id="profileCardEmail" className="text-xs text-chem-ash font-sans mt-0.5">
            {displayEmail}
          </p>
          <span
            id="profileCardRole"
            className="inline-block mt-2 px-3.5 py-1 rounded-full text-xs font-sans uppercase bg-chem-subtle text-chem-forest font-semibold border border-chem-border/70"
          >
            {isAdmin ? 'Fasilitator Pembelajaran (Admin)' : 'Siswa Peneliti Aktif'}
          </span>
        </div>

        {user?.bio && (
          <p className="text-xs text-chem-ash/80 bg-chem-subtle/50 p-3 rounded-2xl border border-chem-border/60 max-w-md mx-auto">
            {user.bio}
          </p>
        )}
      </div>

      {/* Security / Password Form (Section 4.7.2) */}
      <div className="bg-white rounded-3xl border border-chem-border p-6 shadow-subtle space-y-4">
        <div>
          <h3 className="font-serif text-base font-bold text-chem-dark">Ubah Kata Sandi Akun</h3>
          <p className="text-xs text-chem-ash">
            Pastikan kata sandi baru Anda memuat kombinasi huruf dan angka minimal 6 karakter.
          </p>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-sans uppercase tracking-wider text-chem-ash mb-1 font-medium">
              Kata Sandi Sekarang
            </label>
            <input
              type="password"
              id="inputOldPassword"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-3.5 py-2.5 bg-chem-subtle/50 border border-chem-border rounded-xl focus:bg-white focus:outline-none focus:border-chem-sage transition-all text-chem-dark"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans uppercase tracking-wider text-chem-ash mb-1 font-medium">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              id="inputNewPassword"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full text-xs px-3.5 py-2.5 bg-chem-subtle/50 border border-chem-border rounded-xl focus:bg-white focus:outline-none focus:border-chem-sage transition-all text-chem-dark"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans uppercase tracking-wider text-chem-ash mb-1 font-medium">
              Ulangi Kata Sandi Baru
            </label>
            <input
              type="password"
              id="inputConfirmPassword"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi kata sandi baru"
              className="w-full text-xs px-3.5 py-2.5 bg-chem-subtle/50 border border-chem-border rounded-xl focus:bg-white focus:outline-none focus:border-chem-sage transition-all text-chem-dark"
            />
          </div>

          <button
            type="submit"
            disabled={loadingPassword}
            className="w-full py-2.5 bg-chem-forest hover:bg-chem-dark text-chem-glow font-semibold text-xs rounded-xl shadow-subtle transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <i className="fa-solid fa-lock text-xs"></i>
            <span>{loadingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}</span>
          </button>
        </form>
      </div>

      {/* Session & Logout Section */}
      <div className="bg-white rounded-3xl border border-rose-200/80 p-6 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-900">Keluar dari Akun</h3>
            <p className="text-xs text-chem-ash mt-0.5">
              Akhiri sesi pembelajaran saat ini pada perangkat ini.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm('Yakin ingin keluar dari akun?')) {
                clearAuth();
                addToast('Anda telah berhasil keluar dari akun.', 'info');
                navigate('/auth/login');
              }
            }}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
