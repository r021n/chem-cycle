import { describe, it, expect } from 'vitest';
import { cn, formatFileSize, formatDate } from '../../src/lib/utils';

describe('Frontend Utils Unit Tests', () => {
  it('should merge class names correctly without conflict', () => {
    const result = cn('bg-black', 'text-white', 'bg-black', 'p-4');
    expect(result).toBe('text-white bg-black p-4');
  });

  it('should format file sizes accurately into readable units', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500.0 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(1073741824)).toBe('1.0 GB');
  });

  it('should format dates to Indonesian locale or return fallback on empty', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
    const formatted = formatDate('2026-09-20T10:00:00.000Z');
    expect(formatted).toBeDefined();
    expect(formatted.length).toBeGreaterThan(5);
  });
});
