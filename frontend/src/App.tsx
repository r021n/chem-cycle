import React from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from 'react-router-dom';
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
import { AdminMaterialEditorPage } from './pages/admin/AdminMaterialEditorPage';
import { AdminActivitiesPage } from './pages/admin/AdminActivitiesPage';
import { AdminActivityEditorPage } from './pages/admin/AdminActivityEditorPage';
import { AdminQuizzesPage } from './pages/admin/AdminQuizzesPage';
import { AdminQuizEditorPage } from './pages/admin/AdminQuizEditorPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Root layout: hosts router-level behaviors that must span every route
const RootLayout: React.FC = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      /* A. SISI PENGGUNA (CLIENT / OPEN-ACCESS PORTAL) */
      {
        element: <ClientLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'materi', element: <MaterialsCatalogPage /> },
          { path: 'materi/:slug', element: <MaterialDetailPage /> },
          { path: 'aktivitas', element: <ActivitiesCatalogPage /> },
          { path: 'aktivitas/:id', element: <ActivityWorkspacePage /> },
          { path: 'kuis', element: <QuizCatalogPage /> },
          { path: 'kuis/:id', element: <QuizPlayerPage /> },
        ],
      },

      /* B. SISI ADMINISTRATOR (ADMIN / CMS PANEL) */
      { path: 'admin/login', element: <AdminLoginPage /> },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'materi', element: <AdminMaterialsPage /> },
          { path: 'materi/baru', element: <AdminMaterialEditorPage /> },
          { path: 'materi/:materialId/edit', element: <AdminMaterialEditorPage /> },
          { path: 'aktivitas', element: <AdminActivitiesPage /> },
          { path: 'aktivitas/baru', element: <AdminActivityEditorPage /> },
          { path: 'aktivitas/:activityId/edit', element: <AdminActivityEditorPage /> },
          { path: 'kuis', element: <AdminQuizzesPage /> },
          { path: 'kuis/:quizId/edit', element: <AdminQuizEditorPage /> },
          { path: 'pengaturan', element: <AdminSettingsPage /> },
        ],
      },

      /* Fallback to Home */
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
