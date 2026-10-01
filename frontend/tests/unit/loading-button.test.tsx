import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LoadingButton } from '../../src/components/ui/loading-button';

describe('LoadingButton', () => {
  it('renders children and stays clickable when idle', () => {
    const onClick = vi.fn();
    render(
      <LoadingButton onClick={onClick} loadingLabel="Menyimpan...">
        Simpan
      </LoadingButton>,
    );

    const button = screen.getByRole('button', { name: /Simpan/i });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
    expect(button).not.toHaveAttribute('data-loading');

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows spinner + label and blocks clicks while loading', () => {
    const onClick = vi.fn();
    render(
      <LoadingButton loading loadingLabel="Menyimpan..." onClick={onClick}>
        Simpan
      </LoadingButton>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-loading', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Menyimpan...');
    expect(screen.queryByText('Simpan')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('honours an external disabled state without entering loading mode', () => {
    render(
      <LoadingButton disabled loadingLabel="Mengirim...">
        Kirim Komentar
      </LoadingButton>,
    );

    const button = screen.getByRole('button', { name: /Kirim Komentar/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
  });

  it('renders only the spinner when loadingLabel is empty', () => {
    render(<LoadingButton loading loadingLabel="">Terbit</LoadingButton>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('defaults to type="button" and keeps a custom type', () => {
    const { rerender } = render(<LoadingButton>Simpan</LoadingButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

    rerender(<LoadingButton type="submit">Simpan</LoadingButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
