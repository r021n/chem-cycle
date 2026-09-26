import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClientLayout } from './layouts/ClientLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Client Portal Pages
import { HomePage } from './pages/client/HomePage';
import { MaterialsCatalogPage } from './pages/client/MaterialsCatalogPage';
import { MaterialDetailPage } from './pages/client/MaterialDetailPage';
import { ActivitiesCatalogPage } from './pages/client/ActivitiesCatalogPage';
import { ActivityWorkspacePage } from './pages/client/ActivityWorkspacePage';
import { QuizCatalogPage } from './pages/client/QuizCatalogPage';
import { QuizPlayerPage } from './pages/client/QuizPlayerPage';

// Admin CMS Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMaterialsPage } from './pages/admin/AdminMaterialsPage';
import { AdminActivitiesPage } from './pages/admin/AdminActivitiesPage';
import { AdminQuizzesPage } from './pages/admin/AdminQuizzesPage';
import { AdminQuizEditorPage } from './pages/admin/AdminQuizEditorPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* A. SISI PENGGUNA (CLIENT / OPEN-ACCESS PORTAL) */}
        <Route element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="materi" element={<MaterialsCatalogPage />} />
          <Route path="materi/:slug" element={<MaterialDetailPage />} />
          <Route path="aktivitas" element={<ActivitiesCatalogPage />} />
          <Route path="aktivitas/:id" element={<ActivityWorkspacePage />} />
          <Route path="kuis" element={<QuizCatalogPage />} />
          <Route path="kuis/:id" element={<QuizPlayerPage />} />
        </Route>

        {/* B. SISI ADMINISTRATOR (ADMIN / CMS PANEL) */}
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="materi" element={<AdminMaterialsPage />} />
          <Route path="aktivitas" element={<AdminActivitiesPage />} />
          <Route path="kuis" element={<AdminQuizzesPage />} />
          <Route path="kuis/:quizId/edit" element={<AdminQuizEditorPage />} />
          <Route path="pengaturan" element={<AdminSettingsPage />} />
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
