import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { useDataStore } from '../../src/store/dataStore';
import { useAccessibilityStore } from '../../src/store/accessibilityStore';
import { ChemFormula } from '../../src/components/common/ChemFormula';

describe('EcoInclusive Dynamic Architecture & Features', () => {
  beforeEach(() => {
    useDataStore.getState().resetAllDataToDefaults();
    useAccessibilityStore.getState().resetAll();
  });

  describe('Data Store & JSON Initialization', () => {
    it('should initialize with materials, activities, quizzes and settings from JSON', () => {
      const state = useDataStore.getState();
      expect(state.materials.length).toBeGreaterThan(0);
      expect(state.activities.length).toBeGreaterThan(0);
      expect(state.quizzes.length).toBeGreaterThan(0);
      expect(state.settings.hero.title).toBeDefined();
    });

    it('should perform Material CRUD correctly', () => {
      const store = useDataStore.getState();
      const initialCount = store.materials.length;

      // Add
      const newMat = store.addMaterial({
        title: 'Materi Uji Baru',
        slug: 'materi-uji-baru',
        category: 'Termokimia',
        summary: 'Ringkasan uji materi',
        coverUrl: 'https://example.com/cover.jpg',
        estimatedReadTime: 5,
        orderIndex: initialCount + 1,
        isPublished: true,
        learningObjectives: ['Indikator 1'],
        contentJson: [],
        contextualSection: {
          title: 'Kasus Uji',
          caseStudyTag: 'Hijau',
          content: 'Uraian kasus',
          impactHighlight: 'Dampak nyata',
          relatedSdg: 12,
        },
        practiceExamples: [],
      });

      expect(useDataStore.getState().materials.length).toBe(initialCount + 1);
      expect(newMat.id).toBeDefined();

      // Update
      useDataStore.getState().updateMaterial(newMat.id, { title: 'Materi Uji Diperbarui' });
      const updated = useDataStore.getState().materials.find((m) => m.id === newMat.id);
      expect(updated?.title).toBe('Materi Uji Diperbarui');

      // Toggle publish
      useDataStore.getState().togglePublishMaterial(newMat.id);
      const unpublished = useDataStore.getState().materials.find((m) => m.id === newMat.id);
      expect(unpublished?.isPublished).toBe(false);

      // Delete
      useDataStore.getState().deleteMaterial(newMat.id);
      expect(useDataStore.getState().materials.length).toBe(initialCount);
    });

    it('should handle admin authentication demo correctly', () => {
      const store = useDataStore.getState();
      // Invalid
      expect(store.login('user', 'wrong')).toBe(false);
      expect(useDataStore.getState().isAuthenticated).toBe(false);

      // Valid demo
      expect(store.login('admin@ecoinclusive.edu', 'admin123')).toBe(true);
      expect(useDataStore.getState().isAuthenticated).toBe(true);

      // Logout
      store.logout();
      expect(useDataStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('Universal Accessibility Store (UDL & WCAG 2.1 AA)', () => {
    it('should update contrast mode and clamp font size', () => {
      const acc = useAccessibilityStore.getState();
      expect(acc.contrastMode).toBe('normal');

      acc.setContrastMode('dark-contrast');
      expect(useAccessibilityStore.getState().contrastMode).toBe('dark-contrast');

      // Font size delta clamping
      acc.setFontSizeDelta(2);
      expect(useAccessibilityStore.getState().fontSizeDelta).toBe(2);

      acc.increaseFontSize(); // 3
      acc.increaseFontSize(); // should clamp to 3
      expect(useAccessibilityStore.getState().fontSizeDelta).toBe(3);

      acc.toggleDyslexiaFont();
      expect(useAccessibilityStore.getState().dyslexiaFont).toBe(true);
    });
  });

  describe('ChemFormula Component', () => {
    it('renders chemical formula with subscripts', () => {
      const { container } = render(<ChemFormula formula="CH4 + 2O2 -> CO2 + 2H2O" />);
      expect(container.textContent).toContain('CH');
      expect(container.querySelector('sub')).not.toBeNull();
    });
  });
});
