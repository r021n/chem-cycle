import React, { useState } from "react";
import { useDataStore } from "../../store/dataStore";
import {
  Save,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const AdminSettingsPage: React.FC = () => {
  const { changePassword } = useDataStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form states for password change only
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newPassword.trim()) {
      setErrorMessage("Kata sandi baru tidak boleh kosong.");
      return;
    }

    if (newPassword.trim().length < 6) {
      setErrorMessage("Kata sandi minimal harus terdiri dari 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        "Konfirmasi kata sandi tidak cocok dengan kata sandi baru.",
      );
      return;
    }

    changePassword(newPassword.trim());
    setNewPassword("");
    setConfirmPassword("");

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* Header & Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Pengaturan Sistem CMS
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kelola kata sandi akses administrasi.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>
            Kata sandi baru berhasil disimpan dan diterapkan ke sistem!
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-300 text-rose-950 flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-8 text-xs">
        {/* PENGATURAN KATA SANDI */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <KeyRound className="w-5 h-5 text-chem-forest" />
            <h2 className="font-serif text-lg font-bold text-slate-900">
              Ganti Kata Sandi Administrator
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                placeholder="Masukkan kata sandi baru..."
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-chem-forest transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                placeholder="Ulangi kata sandi baru..."
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-chem-forest transition-colors"
                required
              />
            </div>
          </div>
        </section>

        {/* Global Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3.5 bg-chem-forest hover:bg-chem-moss text-white rounded-2xl text-xs font-bold shadow-float flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4 text-chem-glow" />
            <span>Simpan Kata Sandi</span>
          </button>
        </div>
      </form>
    </div>
  );
};
