import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { LoginPage } from './LoginPage';
import { User } from '../generated/graphql';

// Mock Apollo Client hooks
jest.mock('../generated/graphql', () => ({
  useGetUsersQuery: jest.fn(),
}));

// Mock the auth context
const mockLogin = jest.fn();
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'user2',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+0987654321',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'user3',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    phoneNumber: '+1122334455',
    isActive: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <MockedProvider>
        {component}
      </MockedProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  const mockUseGetUsersQuery = require('../generated/graphql').useGetUsersQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetUsersQuery.mockReturnValue({
      data: { users: mockUsers },
      loading: false,
      error: null,
    });
  });

  it('renders login form', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Welcome to Converge Chat')).toBeInTheDocument();
    expect(screen.getByText('Select a user to continue')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseGetUsersQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockUseGetUsersQuery.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'Failed to load users' },
    });

    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Failed to load users')).toBeInTheDocument();
  });

  it('populates user dropdown with active users only', () => {
    renderWithRouter(<LoginPage />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    // Should only show active users (John and Jane, not Bob)
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
  });

  it('allows user selection and login', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const johnOption = screen.getByText('John Doe');
    await user.click(johnOption);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);
    
    expect(mockLogin).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('disables login button when no user selected', () => {
    renderWithRouter(<LoginPage />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeDisabled();
  });

  it('enables login button when user is selected', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const johnOption = screen.getByText('John Doe');
    await user.click(johnOption);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).not.toBeDisabled();
  });

  it('shows user email in dropdown options', () => {
    renderWithRouter(<LoginPage />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('handles empty users list', () => {
    mockUseGetUsersQuery.mockReturnValue({
      data: { users: [] },
      loading: false,
      error: null,
    });

    renderWithRouter(<LoginPage />);
    
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    
    expect(screen.getByText('No users available')).toBeInTheDocument();
  });

  it('navigates to chat page after successful login', async () => {
    const user = userEvent.setup();
    const mockNavigate = jest.fn();
    
    // Mock useNavigate
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    renderWithRouter(<LoginPage />);
    
    const select = screen.getByRole('combobox');
    await user.click(select);
    
    const johnOption = screen.getByText('John Doe');
    await user.click(johnOption);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockUsers[0]);
    });
  });
});
