import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useGetUserChatsQuery, Chat as GraphQLChat } from '../generated/graphql';
import { webSocketService } from '../services/websocket';
import ChatInterface from '../components/ChatInterface';
import CreateChatDialog from '../components/CreateChatDialog';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedChat, setSelectedChat] = useState<GraphQLChat | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const { data: chatsData, loading: chatsLoading, error: chatsError, refetch } = useGetUserChatsQuery({
    variables: { userId: user?.id || '' },
    skip: !user?.id,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Connect to WebSocket
    const connectWebSocket = async () => {
      try {
        await webSocketService.connect(user.id);
        setWsConnected(true);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, [user, navigate]);

  const handleLogout = () => {
    webSocketService.disconnect();
    logout();
    navigate('/login');
  };

  const handleChatSelect = (chat: GraphQLChat) => {
    setSelectedChat(chat);
  };

  const handleChatCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  if (!user) {
    return null;
  }

  if (chatsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (chatsError) {
    console.error('Chat loading error:', chatsError);
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load chats. Please check if the backend services are running.
          <br />
          Error: {chatsError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" component="h1">
              Converge Chat
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography variant="body1">
                {user.firstName} {user.lastName}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {wsConnected ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
                <Typography variant="caption" color="success.main">
                  Connected
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'error.main' }} />
                <Typography variant="caption" color="error.main">
                  Disconnected
                </Typography>
              </Box>
            )}
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Chat List Sidebar */}
        <Paper
          elevation={1}
          sx={{
            width: 300,
            borderRadius: 0,
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Chats</Typography>
              <IconButton
                size="small"
                onClick={() => setShowCreateDialog(true)}
                sx={{ backgroundColor: 'primary.main', color: 'white' }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {chatsData?.userChats && chatsData.userChats.length > 0 ? (
              <List>
                {chatsData.userChats.map((chat, index) => (
                  <React.Fragment key={chat.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        selected={selectedChat?.id === chat.id}
                        onClick={() => handleChatSelect(chat)}
                      >
                        <ListItemText
                          primary={chat.name}
                          secondary={`${chat.participants.length} participants`}
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < chatsData.userChats.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No chats found. Create a new chat to get started.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Chat Interface */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedChat ? (
            <ChatInterface chat={selectedChat} user={user} />
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Select a chat to start messaging
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateDialog(true)}
              >
                Create New Chat
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Create Chat Dialog */}
      <CreateChatDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onChatCreated={handleChatCreated}
        currentUser={user}
      />
    </Box>
  );
};

export default ChatPage;
