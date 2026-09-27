import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AccessibilityController } from '../components/accessibility/AccessibilityController';
import { UniversalAccessibilityDrawer } from '../components/accessibility/UniversalAccessibilityDrawer';
import { useDataStore } from '../store/dataStore';

export const ClientLayout: React.FC = () => {
  const { fetchAllData } = useDataStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  return (
    <div className="min-h-screen flex flex-col bg-chem-paper text-chem-dark">
      {/* Global Accessibility Engine & Overlays */}
      <AccessibilityController />

      {/* Main Accessible Page Content Container (targeted by accessibility engine) */}
      <div id="accessible-content-root" className="flex-1 flex flex-col min-h-0 w-full">
        {/* Global Client Navigation */}
        <Navbar />

        {/* Main Page Body */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Global Client Footer */}
        <Footer />
      </div>

      {/* Global Accessibility Drawer & Overlays (Isolated from page styles) */}
      <UniversalAccessibilityDrawer />
    </div>
  );
};
