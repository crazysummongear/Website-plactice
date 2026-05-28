import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('BottomNavigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render all navigation items', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('一覧')).toBeInTheDocument();
    expect(screen.getByText('インポート')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
  });

  it('should highlight active route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    const dashboardButton = screen.getByText('ダッシュボード').closest('button');
    expect(dashboardButton).toHaveClass('text-blue-600');
  });

  it('should call navigate when button is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    const transactionsButton = screen.getByText('一覧');
    fireEvent.click(transactionsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/transactions');
  });

  it('should not render on login page', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render on signup page', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/signup']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should have correct z-index for mobile', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveStyle({ zIndex: '9999' });
  });

  it('should log navigation clicks', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BottomNavigation />
      </MemoryRouter>
    );

    const transactionsButton = screen.getByText('一覧');
    fireEvent.click(transactionsButton);

    expect(consoleSpy).toHaveBeenCalledWith('Navigation button clicked:', '/transactions');
    
    consoleSpy.mockRestore();
  });
});
