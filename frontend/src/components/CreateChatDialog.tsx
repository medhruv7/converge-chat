import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { User } from '../generated/graphql';
import { useGetUsersQuery, useCreateChatMutation } from '../generated/graphql';

interface CreateChatDialogProps {
  open: boolean;
  onClose: () => void;
  onChatCreated: () => void;
  currentUser: User;
}

const CreateChatDialog: React.FC<CreateChatDialogProps> = ({
  open,
  onClose,
  onChatCreated,
  currentUser,
}) => {
  const [chatName, setChatName] = useState('');
  const [chatDescription, setChatDescription] = useState('');
  const [chatType, setChatType] = useState<'public' | 'private' | 'group'>('public');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { data: usersData, loading: usersLoading } = useGetUsersQuery();
  const [createChat, { loading: createLoading }] = useCreateChatMutation();

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChat = async () => {
    if (!chatName.trim()) {
      setError('Chat name is required');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    setError('');

    try {
      await createChat({
        variables: {
          input: {
            name: chatName.trim(),
            description: chatDescription.trim() || undefined,
            type: chatType,
            participantIds: [currentUser.id, ...selectedUsers],
          },
        },
      });

      // Reset form
      setChatName('');
      setChatDescription('');
      setChatType('public');
      setSelectedUsers([]);
      setError('');

      onChatCreated();
    } catch (err) {
      setError('Failed to create chat. Please try again.');
    }
  };

  const handleClose = () => {
    setChatName('');
    setChatDescription('');
    setChatType('public');
    setSelectedUsers([]);
    setError('');
    onClose();
  };

  const availableUsers = usersData?.users?.filter(user => user.id !== currentUser.id) || [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Chat</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Chat Name"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Description (Optional)"
            value={chatDescription}
            onChange={(e) => setChatDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <FormControl fullWidth>
            <InputLabel>Chat Type</InputLabel>
            <Select
              value={chatType}
              onChange={(e) => setChatType(e.target.value as 'public' | 'private' | 'group')}
              label="Chat Type"
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="group">Group</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Select Participants
            </Typography>
            {usersLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableUsers.map((user) => (
                  <Chip
                    key={user.id}
                    label={`${user.firstName} ${user.lastName}`}
                    clickable
                    color={selectedUsers.includes(user.id) ? 'primary' : 'default'}
                    onClick={() => handleUserToggle(user.id)}
                    variant={selectedUsers.includes(user.id) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            )}
            {selectedUsers.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {selectedUsers.length} participant(s) selected
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={createLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateChat}
          variant="contained"
          disabled={createLoading || !chatName.trim() || selectedUsers.length === 0}
        >
          {createLoading ? <CircularProgress size={24} /> : 'Create Chat'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateChatDialog;
