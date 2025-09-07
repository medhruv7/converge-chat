import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { CreateChatDialog } from './CreateChatDialog';
import { User } from '../generated/graphql';

// Mock Apollo Client hooks
jest.mock('../generated/graphql', () => ({
  useGetUsersQuery: jest.fn(),
  useCreateChatMutation: jest.fn(),
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
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

describe('CreateChatDialog', () => {
  const mockUseGetUsersQuery = require('../generated/graphql').useGetUsersQuery;
  const mockUseCreateChatMutation = require('../generated/graphql').useCreateChatMutation;

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onChatCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetUsersQuery.mockReturnValue({
      data: { users: mockUsers },
      loading: false,
      error: null,
    });
    mockUseCreateChatMutation.mockReturnValue([
      jest.fn(),
      { loading: false, error: null },
    ]);
  });

  it('renders dialog when open', () => {
    render(<CreateChatDialog {...defaultProps} />);
    
    expect(screen.getByText('Create New Chat')).toBeInTheDocument();
    expect(screen.getByLabelText('Chat Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Select Participants')).toBeInTheDocument();
  });

  it('does not render dialog when closed', () => {
    render(<CreateChatDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Create New Chat')).not.toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseGetUsersQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(<CreateChatDialog {...defaultProps} />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockUseGetUsersQuery.mockReturnValue({
      data: null,
      loading: false,
      error: { message: 'Failed to load users' },
    });

    render(<CreateChatDialog {...defaultProps} />);
    
    expect(screen.getByText('Failed to load users')).toBeInTheDocument();
  });

  it('allows user to fill form and create chat', async () => {
    const user = userEvent.setup();
    const mockCreateChat = jest.fn().mockResolvedValue({
      data: {
        createChat: {
          id: 'chat1',
          name: 'Test Chat',
          type: 'public',
        },
      },
    });

    mockUseCreateChatMutation.mockReturnValue([
      mockCreateChat,
      { loading: false, error: null },
    ]);

    render(<CreateChatDialog {...defaultProps} />);
    
    // Fill in chat name
    const nameInput = screen.getByLabelText('Chat Name');
    await user.type(nameInput, 'Test Chat');
    
    // Fill in description
    const descriptionInput = screen.getByLabelText('Description');
    await user.type(descriptionInput, 'A test chat');
    
    // Select participants
    const participantChips = screen.getAllByRole('button');
    await user.click(participantChips[0]); // Select first user
    await user.click(participantChips[1]); // Select second user
    
    // Submit form
    const createButton = screen.getByRole('button', { name: /create chat/i });
    await user.click(createButton);
    
    expect(mockCreateChat).toHaveBeenCalledWith({
      variables: {
        input: {
          name: 'Test Chat',
          description: 'A test chat',
          type: 'public',
          participantIds: ['user1', 'user2'],
        },
      },
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<CreateChatDialog {...defaultProps} />);
    
    const createButton = screen.getByRole('button', { name: /create chat/i });
    await user.click(createButton);
    
    // Should not call createChat without required fields
    expect(mockUseCreateChatMutation).not.toHaveBeenCalled();
  });

  it('handles create chat error', async () => {
    const user = userEvent.setup();
    const mockCreateChat = jest.fn().mockRejectedValue(new Error('Failed to create chat'));

    mockUseCreateChatMutation.mockReturnValue([
      mockCreateChat,
      { loading: false, error: { message: 'Failed to create chat' } },
    ]);

    render(<CreateChatDialog {...defaultProps} />);
    
    // Fill in required fields
    const nameInput = screen.getByLabelText('Chat Name');
    await user.type(nameInput, 'Test Chat');
    
    // Select a participant
    const participantChips = screen.getAllByRole('button');
    await user.click(participantChips[0]);
    
    // Submit form
    const createButton = screen.getByRole('button', { name: /create chat/i });
    await user.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to create chat')).toBeInTheDocument();
    });
  });

  it('closes dialog on cancel', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    
    render(<CreateChatDialog {...defaultProps} onClose={onClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('allows selecting and deselecting participants', async () => {
    const user = userEvent.setup();
    render(<CreateChatDialog {...defaultProps} />);
    
    const participantChips = screen.getAllByRole('button');
    
    // Select a participant
    await user.click(participantChips[0]);
    expect(participantChips[0]).toHaveClass('MuiChip-colorPrimary');
    
    // Deselect the participant
    await user.click(participantChips[0]);
    expect(participantChips[0]).toHaveClass('MuiChip-outlined');
  });

  it('shows loading state during chat creation', () => {
    mockUseCreateChatMutation.mockReturnValue([
      jest.fn(),
      { loading: true, error: null },
    ]);

    render(<CreateChatDialog {...defaultProps} />);
    
    const createButton = screen.getByRole('button', { name: /create chat/i });
    expect(createButton).toBeDisabled();
  });
});
