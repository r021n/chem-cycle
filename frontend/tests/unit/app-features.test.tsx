import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { useDataStore } from '../../src/store/dataStore';
import { useAccessibilityStore } from '../../src/store/accessibilityStore';
import { ChemFormula } from '../../src/components/common/ChemFormula';
import { materialsApi } from '../../src/api/materials';
import { authApi } from '../../src/api/auth';

describe('EcoInclusive Dynamic Architecture & Features', () => {
  beforeEach(() => {
    useAccessibilityStore.getState().resetAll();
    useDataStore.setState({
      materials: [],
      activities: [],
      quizzes: [],
      logs: [],
      isAuthenticated: false,
    });
  });

  describe('Data Store & API Architecture', () => {
    it('should initialize with clean state and update materials via store', async () => {
      const mockMaterials = [
        {
          id: 'mat-1',
          title: 'Termokimia Uji',
          slug: 'termokimia-uji',
          orderIndex: 1,
          isPublished: true,
          contentJson: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.spyOn(materialsApi, 'getMaterials').mockResolvedValueOnce(mockMaterials as any);

      await useDataStore.getState().fetchMaterials();

      const state = useDataStore.getState();
      expect(state.materials.length).toBe(1);
      expect(state.materials[0].title).toBe('Termokimia Uji');
    });

    it('should handle admin authentication flow correctly', async () => {
      const store = useDataStore.getState();

      vi.spyOn(authApi, 'login').mockImplementationOnce(async (user, pass) => {
        if (user === 'admin@ecoinclusive.edu' && pass === 'admin123') {
          return {
            success: true,
            message: 'Login berhasil',
            token: 'mock-jwt-token',
            user: {
              id: 'adm-1',
              username: 'admin',
              email: 'admin@ecoinclusive.edu',
              name: 'Admin',
              role: 'admin',
            },
          };
        }
        throw new Error('Invalid credentials');
      });

      // Valid login
      const success = await store.login('admin@ecoinclusive.edu', 'admin123');
      expect(success).toBe(true);
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
