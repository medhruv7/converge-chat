import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './useAuth';
import { User } from '../generated/graphql';

const mockUser: User = {
  id: 'user1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user-info">
        {user ? `${user.firstName} ${user.lastName}` : 'No user'}
      </div>
      <button onClick={() => login(mockUser)}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('provides initial state with no user', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
  });

  it('allows user to login', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
  });

  it('allows user to logout', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Login first
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
    
    // Then logout
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
  });

  it('persists user in localStorage', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Login
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);
    
    // Check localStorage
    expect(localStorage.getItem('auth-token')).toBe('user1');
    expect(localStorage.getItem('user-data')).toBe(JSON.stringify(mockUser));
  });

  it('restores user from localStorage on mount', () => {
    // Set up localStorage before rendering
    localStorage.setItem('auth-token', 'user1');
    localStorage.setItem('user-data', JSON.stringify(mockUser));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
  });

  it('clears localStorage on logout', async () => {
    const user = userEvent.setup();
    
    // Set up localStorage first
    localStorage.setItem('auth-token', 'user1');
    localStorage.setItem('user-data', JSON.stringify(mockUser));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verify user is loaded from localStorage
    expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
    
    // Logout
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);
    
    // Check localStorage is cleared
    expect(localStorage.getItem('auth-token')).toBeNull();
    expect(localStorage.getItem('user-data')).toBeNull();
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    // Set up invalid JSON in localStorage
    localStorage.setItem('auth-token', 'user1');
    localStorage.setItem('user-data', 'invalid-json');
    
    // Should not throw error
    expect(() => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    }).not.toThrow();
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
  });

  it('handles missing localStorage gracefully', () => {
    // Mock localStorage to throw error
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => {
          throw new Error('localStorage not available');
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    
    // Should not throw error
    expect(() => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    }).not.toThrow();
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
    
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  it('provides consistent user object across re-renders', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Login
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);
    
    const userInfoBefore = screen.getByTestId('user-info').textContent;
    
    // Re-render
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const userInfoAfter = screen.getByTestId('user-info').textContent;
    
    expect(userInfoBefore).toBe(userInfoAfter);
  });
});
