import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from '../../src/features/landing/landing-page';

describe('LandingPage Unit Tests', () => {
  it('should render brand logo, title, and key sections', () => {
    render(<LandingPage />);

    expect(screen.getByText(/Kuasai Konsep Kimia &/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Analisis Reaksi Kimia/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Belajar Kimia Jadi Lebih Mudah')).toBeInTheDocument();
    expect(screen.getByText('Ruang Belajar Siswa')).toBeInTheDocument();
    expect(screen.getByText('Portal Manajemen Guru')).toBeInTheDocument();
    expect(screen.getByText('Tanya Jawab Seputar EcoInclusive')).toBeInTheDocument();
    expect(screen.getAllByText(/Eco/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Inclusive/i).length).toBeGreaterThan(0);
  });

  it('should open sample reader modal when clicking Baca Modul Sampel button', () => {
    render(<LandingPage />);

    const sampleButtons = screen.getAllByRole('button', { name: /Baca Modul Sampel/i });
    expect(sampleButtons.length).toBeGreaterThan(0);

    fireEvent.click(sampleButtons[0]);

    expect(
      screen.getByText('Konsep Dasar Energi dan Interaksi dalam Reaksi Kimia')
    ).toBeInTheDocument();
    expect(screen.getByText('1. Energi dalam Reaksi Kimia')).toBeInTheDocument();
  });
});
