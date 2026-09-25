import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AccessibilityController } from '../components/accessibility/AccessibilityController';
import { UniversalAccessibilityDrawer } from '../components/accessibility/UniversalAccessibilityDrawer';

export const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-chem-paper text-chem-dark">
      {/* Global Accessibility Engine & Overlays */}
      <AccessibilityController />
      <UniversalAccessibilityDrawer />

      {/* Global Client Navigation */}
      <Navbar />

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Client Footer */}
      <Footer />
    </div>
  );
};
