/**
 * ErrorBoundary Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Create a component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Create a normal component
const NormalComponent = () => <div>Normal Content</div>;

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

  it('should display error message when error is caught', () => {
    // Suppress console.error for this test
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
  });

  it('should display error details in development', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Error message should be shown
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
  });

  it('should have a retry button', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText(/リセット/i);
    expect(retryButton).toBeInTheDocument();
  });

  it('should recover from error when retry is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

  it('should display fallback UI with error message', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/予期しないエラーが発生/i)).toBeInTheDocument();
  });
});
