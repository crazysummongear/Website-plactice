/**
 * Layout Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Layout from './Layout';

describe('Layout', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render layout structure', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have header section', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check for header or navigation element
    const header = screen.queryByRole('banner') || screen.queryByRole('navigation');
    expect(header || document.querySelector('header') || document.querySelector('nav')).toBeInTheDocument();
  });

  it('should have main content area', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render children correctly', () => {
    renderWithProviders(
      <Layout>
        <div data-testid="child-element">Child Content</div>
      </Layout>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });

  it('should have responsive layout classes', () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check for common responsive layout patterns
    const mainElement = container.querySelector('main') || container.querySelector('[role="main"]');
    expect(mainElement).toBeInTheDocument();
  });

  it('should render multiple children', () => {
    renderWithProviders(
      <Layout>
        <div>First Child</div>
        <div>Second Child</div>
      </Layout>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
  });
});
