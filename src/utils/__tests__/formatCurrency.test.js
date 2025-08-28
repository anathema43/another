import { describe, it, expect } from 'vitest'
import formatCurrency from '../formatCurrency'

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(299)).toBe('₹299');
    expect(formatCurrency(1000)).toBe('₹1,000');
    expect(formatCurrency(1234567)).toBe('₹12,34,567');
  });

  it('formats decimal numbers correctly', () => {
    expect(formatCurrency(299.99)).toBe('₹300');
    expect(formatCurrency(1000.50)).toBe('₹1,001');
  });

  it('handles zero correctly', () => {
    expect(formatCurrency(0)).toBe('₹0');
  });

  it('handles negative numbers correctly', () => {
    expect(formatCurrency(-299)).toBe('₹-299');
  });

  it('handles string numbers correctly', () => {
    expect(formatCurrency('299')).toBe('₹299');
    expect(formatCurrency('1000')).toBe('₹1,000');
  });

  it('handles invalid input gracefully', () => {
    expect(formatCurrency(null)).toBe('₹0');
    expect(formatCurrency(undefined)).toBe('₹0');
    expect(formatCurrency('invalid')).toBe('₹0');
  });

  it('uses Indian number formatting', () => {
    // Indian numbering system: 1,00,000 instead of 100,000
    expect(formatCurrency(100000)).toBe('₹1,00,000');
    expect(formatCurrency(1000000)).toBe('₹10,00,000');
  });
});