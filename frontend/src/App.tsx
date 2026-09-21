import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/app-shell';
import { ToastContainer } from './components/ui/toast';
import { LandingPage } from './features/landing/landing-page';
import { LoginPage } from './features/auth/login-page';
import { RegisterPage } from './features/auth/register-page';
import { ProtectedRoute } from './features/auth/protected-route';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { MaterialsPage } from './features/materials/materials-page';
import { MaterialDetailPage } from './features/materials/material-detail-page';
import { MaterialEditorPage } from './features/materials/material-editor-page';
import { QuizzesPage } from './features/quizzes/quizzes-page';
import { ExamPage } from './features/quizzes/exam-page';
import { QuizEditorPage } from './features/quizzes/quiz-editor-page';
import { QuizMonitoringPage } from './features/quizzes/quiz-monitoring-page';
import { ActivitiesPage } from './features/activities/activities-page';
import { DiscussionsPage } from './features/discussions/discussions-page';
import { ProfilePage } from './features/profile/profile-page';

export const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* 1. Public Standalone Pages (No Sidebar Layout) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* 2. Fullscreen Material Editor (Admin only, no sidebar layout) */}
        <Route
          path="/materi/baru"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MaterialEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materi/:slug/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MaterialEditorPage />
            </ProtectedRoute>
          }
        />

        {/* 3. Authenticated App Pages with Sidebar Layout (Protected) */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Materials */}
          <Route path="/materi" element={<MaterialsPage />} />
          <Route path="/materi/:slug" element={<MaterialDetailPage />} />

          {/* Quizzes & Exam Engine */}
          <Route path="/latihan" element={<QuizzesPage />} />
          <Route path="/latihan/:id/exam" element={<ExamPage />} />
          <Route
            path="/latihan/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <QuizEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/latihan/:id/monitoring"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <QuizMonitoringPage />
              </ProtectedRoute>
            }
          />

          {/* Classroom Activities */}
          <Route path="/aktivitas" element={<ActivitiesPage />} />

          {/* Social Discussions */}
          <Route path="/diskusi" element={<DiscussionsPage />} />

          {/* Profile & Settings */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Universal Toast Notifications */}
      <ToastContainer />
    </>
  );
};

export default App;
