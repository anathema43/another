import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import DevelopmentRoadmap from '../../pages/DevelopmentRoadmap'

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DevelopmentRoadmap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders roadmap page correctly', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    expect(screen.getByText('🚀 Development Roadmap')).toBeInTheDocument();
    expect(screen.getByText(/Track our journey/)).toBeInTheDocument();
  });

  it('displays progress metrics', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('Core Features Complete')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Critical Items Remaining')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Security Vulnerabilities')).toBeInTheDocument();
  });

  it('handles tab navigation correctly', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    // Default tab should be critical
    expect(screen.getByText('Payment Processing Backend')).toBeInTheDocument();
    
    // Switch to implemented tab
    fireEvent.click(screen.getByText('Implemented (15+)'));
    expect(screen.getByText('Enterprise Security Architecture')).toBeInTheDocument();
    
    // Switch to future tab
    fireEvent.click(screen.getByText('Future Features'));
    expect(screen.getByText('Advanced Search & Discovery')).toBeInTheDocument();
  });

  it('displays critical features with proper priority indicators', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    expect(screen.getByText('Payment Processing Backend')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('4-6 hours')).toBeInTheDocument();
    expect(screen.getByText('Blocks Production Launch')).toBeInTheDocument();
  });

  it('shows implemented features with test coverage', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    fireEvent.click(screen.getByText('Implemented (15+)'));
    
    expect(screen.getByText('Enterprise Security Architecture')).toBeInTheDocument();
    expect(screen.getByText('Real-time Cart Synchronization')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument(); // Test coverage
  });

  it('displays future features with timelines', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    fireEvent.click(screen.getByText('Future Features'));
    
    expect(screen.getByText('Advanced Search & Discovery')).toBeInTheDocument();
    expect(screen.getByText('Month 1')).toBeInTheDocument();
    expect(screen.getByText('Mobile App Development')).toBeInTheDocument();
    expect(screen.getByText('Month 3-6')).toBeInTheDocument();
  });

  it('shows next actions section', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    expect(screen.getByText('🎯 Next Actions')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('Next Month')).toBeInTheDocument();
    expect(screen.getByText('Long Term')).toBeInTheDocument();
  });

  it('displays accurate feature requirements', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    expect(screen.getByText('Create order creation endpoint')).toBeInTheDocument();
    expect(screen.getByText('Implement payment verification')).toBeInTheDocument();
    expect(screen.getByText('Set up webhook handlers')).toBeInTheDocument();
  });

  it('shows development phases information', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    fireEvent.click(screen.getByText('Future Features'));
    
    expect(screen.getByText('Development Phases')).toBeInTheDocument();
    expect(screen.getByText('Phase 1: Foundation')).toBeInTheDocument();
    expect(screen.getByText('Phase 2: Enhanced Experience')).toBeInTheDocument();
  });

  it('handles priority color coding correctly', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    // Critical priority should have red styling
    const criticalBadge = screen.getByText('CRITICAL');
    expect(criticalBadge).toHaveClass('text-red-600', 'bg-red-100');
  });

  it('displays status icons correctly', () => {
    renderWithRouter(<DevelopmentRoadmap />);
    
    // Should have clock icons for pending items
    const clockIcons = document.querySelectorAll('[data-testid="clock-icon"]');
    expect(clockIcons.length).toBeGreaterThan(0);
  });
});