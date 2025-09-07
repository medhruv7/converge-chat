import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { UserManagementPage } from './UserManagementPage';
import { User } from '../generated/graphql';

// Mock Apollo Client hooks
jest.mock('../generated/graphql', () => ({
  useGetUsersQuery: jest.fn(),
  useCreateUserMutation: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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

describe('UserManagementPage', () => {
  const mockUseGetUsersQuery = require('../generated/graphql').useGetUsersQuery;
  const mockUseCreateUserMutation = require('../generated/graphql').useCreateUserMutation;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetUsersQuery.mockReturnValue({
      data: { users: mockUsers },
      loading: false,
      error: null,
    });
    mockUseCreateUserMutation.mockReturnValue([
      jest.fn(),
      { loading: false, error: null },
    ]);
  });

  it('renders user management page', () => {
    renderWithRouter(<UserManagementPage />);
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('displays users in table', () => {
    renderWithRouter(<UserManagementPage />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseGetUsersQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    renderWithRouter(<UserManagementPage />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseGetUsersQuery.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'Failed to load users' },
    });

    renderWithRouter(<UserManagementPage />);
    
    expect(screen.getByText('Failed to load users')).toBeInTheDocument();
  });

  it('opens create user form when add user button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UserManagementPage />);
    
    const addButton = screen.getByRole('button', { name: /add user/i });
    await user.click(addButton);
    
    expect(screen.getByText('Create New User')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
  });

  it('allows creating a new user', async () => {
    const user = userEvent.setup();
    const mockCreateUser = jest.fn().mockResolvedValue({
      data: {
        createUser: {
          id: 'user3',
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob@example.com',
          phoneNumber: '+1122334455',
          isActive: true,
        },
      },
    });

    mockUseCreateUserMutation.mockReturnValue([
      mockCreateUser,
      { loading: false, error: null },
    ]);

    renderWithRouter(<UserManagementPage />);
    
    // Open create form
    const addButton = screen.getByRole('button', { name: /add user/i });
    await user.click(addButton);
    
    // Fill in form
    await user.type(screen.getByLabelText('First Name'), 'Bob');
    await user.type(screen.getByLabelText('Last Name'), 'Wilson');
    await user.type(screen.getByLabelText('Email'), 'bob@example.com');
    await user.type(screen.getByLabelText('Phone Number'), '+1122334455');
    
    // Submit form
    const createButton = screen.getByRole('button', { name: /create user/i });
    await user.click(createButton);
    
    expect(mockCreateUser).toHaveBeenCalledWith({
      variables: {
        input: {
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob@example.com',
          phoneNumber: '+1122334455',
          isActive: true,
        },
      },
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UserManagementPage />);
    
    // Open create form
    const addButton = screen.getByRole('button', { name: /add user/i });
    await user.click(addButton);
    
    // Try to submit without filling required fields
    const createButton = screen.getByRole('button', { name: /create user/i });
    await user.click(createButton);
    
    // Should not call createUser
    expect(mockUseCreateUserMutation).not.toHaveBeenCalled();
  });

  it('handles create user error', async () => {
    const user = userEvent.setup();
    const mockCreateUser = jest.fn().mockRejectedValue(new Error('Failed to create user'));

    mockUseCreateUserMutation.mockReturnValue([
      mockCreateUser,
      { loading: false, error: { message: 'Failed to create user' } },
    ]);

    renderWithRouter(<UserManagementPage />);
    
    // Open create form
    const addButton = screen.getByRole('button', { name: /add user/i });
    await user.click(addButton);
    
    // Fill in form
    await user.type(screen.getByLabelText('First Name'), 'Bob');
    await user.type(screen.getByLabelText('Last Name'), 'Wilson');
    await user.type(screen.getByLabelText('Email'), 'bob@example.com');
    await user.type(screen.getByLabelText('Phone Number'), '+1122334455');
    
    // Submit form
    const createButton = screen.getByRole('button', { name: /create user/i });
    await user.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to create user')).toBeInTheDocument();
    });
  });

  it('closes create form on cancel', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UserManagementPage />);
    
    // Open create form
    const addButton = screen.getByRole('button', { name: /add user/i });
    await user.click(addButton);
    
    // Cancel form
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(screen.queryByText('Create New User')).not.toBeInTheDocument();
  });

  it('navigates back to chat page', async () => {
    const user = userEvent.setup();
    renderWithRouter(<UserManagementPage />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows loading state during user creation', () => {
    mockUseCreateUserMutation.mockReturnValue([
      jest.fn(),
      { loading: true, error: null },
    ]);

    renderWithRouter(<UserManagementPage />);
    
    // Open create form
    const addButton = screen.getByRole('button', { name: /add user/i });
    fireEvent.click(addButton);
    
    const createButton = screen.getByRole('button', { name: /create user/i });
    expect(createButton).toBeDisabled();
  });

  it('displays user status correctly', () => {
    renderWithRouter(<UserManagementPage />);
    
    // John is active
    expect(screen.getByText('Active')).toBeInTheDocument();
    // Jane is inactive
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});
