import React from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { TeacherDashboard } from './teacher-dashboard';
import { StudentDashboard } from './student-dashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  if (user?.role === 'admin') {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
};
