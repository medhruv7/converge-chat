import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useGetUsersQuery } from '../generated/graphql';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: usersData, loading: usersLoading, error: usersError } = useGetUsersQuery();

  const handleLogin = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find the selected user
      const selectedUser = usersData?.users?.find(user => user.id === selectedUserId);
      
      if (selectedUser) {
        login(selectedUser);
        navigate('/chat');
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    navigate('/users');
  };

  if (usersLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (usersError) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          Failed to load users. Please check if the backend services are running.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Converge Chat
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Select a user to start chatting
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            select
            fullWidth
            label="Select User"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            SelectProps={{
              native: true,
            }}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            <option value="">Choose a user...</option>
            {usersData?.users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={loading || !selectedUserId}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleCreateUser}
            sx={{ minWidth: 120 }}
          >
            Create User
          </Button>
        </Box>

        {usersData?.users?.length === 0 && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No users found. Create a new user to get started.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default LoginPage;
