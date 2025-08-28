import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Contact from '../../pages/Contact'

// Mock the API service
vi.mock('../../services/apiService', () => ({
  apiService: {
    submitContactForm: vi.fn()
  }
}))

// Mock constants
vi.mock('../../utils/constants', () => ({
  CONTACT_INFO: {
    email: {
      support: 'support@ramro.com',
      hello: 'hello@ramro.com'
    },
    phone: {
      nepal: '+977 1 234 5678',
      international: '+1 (555) 123-4567'
    },
    address: {
      street: 'Thamel, Kathmandu',
      country: 'Nepal',
      postalCode: '44600'
    }
  },
  BUSINESS_HOURS: {
    weekdays: 'Monday - Friday: 9:00 AM - 6:00 PM (NPT)',
    saturday: 'Saturday: 10:00 AM - 4:00 PM (NPT)',
    sunday: 'Sunday: Closed'
  }
}))

describe('Contact Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact form correctly', () => {
    render(<Contact />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<Contact />);
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<Contact />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates minimum length requirements', async () => {
    render(<Contact />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.change(subjectInput, { target: { value: 'Hi' } });
    fireEvent.change(messageInput, { target: { value: 'Short' } });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/subject must be at least 5 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    const { apiService } = await import('../../services/apiService');
    apiService.submitContactForm.mockResolvedValue({ success: true });
    
    render(<Contact />);
    
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/subject/i), { 
      target: { value: 'Test Subject' } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: 'This is a test message with sufficient length.' } 
    });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(apiService.submitContactForm).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with sufficient length.'
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/message sent!/i)).toBeInTheDocument();
    });
  });

  it('handles form submission errors', async () => {
    const { apiService } = await import('../../services/apiService');
    apiService.submitContactForm.mockRejectedValue(new Error('Network error'));
    
    render(<Contact />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/subject/i), { 
      target: { value: 'Test Subject' } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: 'This is a test message.' } 
    });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    const { apiService } = await import('../../services/apiService');
    apiService.submitContactForm.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<Contact />);
    
    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/subject/i), { 
      target: { value: 'Test Subject' } 
    });
    fireEvent.change(screen.getByLabelText(/message/i), { 
      target: { value: 'This is a test message.' } 
    });
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByRole('button', { name: /sending.../i })).toBeDisabled();
  });
});