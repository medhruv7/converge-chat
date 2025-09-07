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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useGetUsersQuery, useCreateUserMutation } from '../generated/graphql';
import { CreateUserInput } from '../generated/graphql';

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateUserInput>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: usersData, loading: usersLoading, error: usersError, refetch } = useGetUsersQuery();
  const [createUser, { loading: createLoading }] = useCreateUserMutation();

  const handleInputChange = (field: keyof CreateUserInput) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      setError('Email, First Name, and Last Name are required');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await createUser({
        variables: {
          input: {
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
          },
        },
      });

      setSuccess('User created successfully!');
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
      });
      setShowCreateForm(false);
      refetch();
    } catch (err) {
      setError('Failed to create user. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (usersLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (usersError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load users. Please check if the backend services are running.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToLogin}
          >
            Back to Login
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create User'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {showCreateForm && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create New User
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                required
                fullWidth
              />
            </Box>
            <TextField
              label="Phone Number (Optional)"
              value={formData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleCreateUser}
              disabled={createLoading}
              sx={{ alignSelf: 'flex-start' }}
            >
              {createLoading ? <CircularProgress size={24} /> : 'Create User'}
            </Button>
          </Box>
        </Paper>
      )}

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersData?.users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber || '-'}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: user.isActive ? 'success.light' : 'error.light',
                        color: user.isActive ? 'success.contrastText' : 'error.contrastText',
                        fontSize: '0.75rem',
                      }}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {usersData?.users?.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No users found. Create your first user to get started.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default UserManagementPage;
