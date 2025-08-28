import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BulkProductUpload from '../BulkProductUpload'

// Mock Firebase
vi.mock('../../firebase/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    commit: vi.fn()
  })),
  doc: vi.fn()
}))

describe('BulkProductUpload Component', () => {
  const mockOnUploadComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders bulk upload interface correctly', () => {
    render(<BulkProductUpload onUploadComplete={mockOnUploadComplete} />);
    
    expect(screen.getByText('Bulk Product Upload')).toBeInTheDocument();
    expect(screen.getByText('Download Template')).toBeInTheDocument();
    expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
    expect(screen.getByText('CSV Format Instructions')).toBeInTheDocument();
  });

  it('downloads CSV template when clicked', () => {
    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockClick = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();
    
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: mockClick
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

    render(<BulkProductUpload onUploadComplete={mockOnUploadComplete} />);
    
    const downloadButton = screen.getByText('Download Template');
    fireEvent.click(downloadButton);
    
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('handles CSV file upload', async () => {
    const { writeBatch } = await import('firebase/firestore');
    const mockBatch = {
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue()
    };
    writeBatch.mockReturnValue(mockBatch);

    render(<BulkProductUpload onUploadComplete={mockOnUploadComplete} />);
    
    const csvContent = `name,description,price,category,quantityAvailable
"Test Product","Test description",299,"honey",10`;
    
    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/upload csv file/i);
    
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/uploading products/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(mockBatch.commit).toHaveBeenCalled();
    });
  });

  it('validates CSV format and shows errors', async () => {
    render(<BulkProductUpload onUploadComplete={mockOnUploadComplete} />);
    
    // Invalid CSV - missing required fields
    const invalidCsv = `name,description
"Product 1","Description 1"`;
    
    const file = new File([invalidCsv], 'invalid.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/upload csv file/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Upload Errors')).toBeInTheDocument();
      expect(screen.getByText(/missing required field/i)).toBeInTheDocument();
    });
  });

  it('shows upload progress', async () => {
    const { writeBatch } = await import('firebase/firestore');
    const mockBatch = {
      set: vi.fn(),
      commit: vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      )
    };
    writeBatch.mockReturnValue(mockBatch);

    render(<BulkProductUpload onUploadComplete={mockOnUploadComplete} />);
    
    const csvContent = `name,description,price,category,quantityAvailable
"Test Product","Test description",299,"honey",10`;
    
    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/upload csv file/i);
    
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/uploading products/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('shows upload results', async () => {
    const { writeBatch } = await import('firebase/firestore');
    const mockBatch = {
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue()
    };
    writeBatch.mockReturnValue(mockBatch);

    render(<BulkProductUpload onUploadComplete={mockOnUploadComplete} />);
    
    const csvContent = `name,description,price,category,quantityAvailable
"Test Product","Test description",299,"honey",10`;
    
    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/upload csv file/i);
    
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText('Upload Complete')).toBeInTheDocument();
      expect(screen.getByText(/successfully uploaded: 1/i)).toBeInTheDocument();
    });
    
    expect(mockOnUploadComplete).toHaveBeenCalledWith({
      successCount: 1,
      errors: []
    });
  });

  it('rejects non-CSV files', () => {
    render(<BulkProductUpload onUploadComplete={mockOnUploadComplete} />);
    
    const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload csv file/i);
    
    fireEvent.change(input, { target: { files: [textFile] } });
    
    expect(screen.getByText('Upload Errors')).toBeInTheDocument();
    expect(screen.getByText(/please upload a csv file/i)).toBeInTheDocument();
  });
});