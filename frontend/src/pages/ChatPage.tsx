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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  const [realtimeChats, setRealtimeChats] = useState<GraphQLChat[]>([]);
  const [connectedInstance, setConnectedInstance] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // Available chat service instances
  const availableInstances = [
    { label: 'Instance 1 (Port 3007)', url: 'http://localhost:3007' },
    { label: 'Instance 2 (Port 3009)', url: 'http://localhost:3009' },
  ];

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
        setConnectedInstance(webSocketService.getConnectedInstance());
        
        // Set up WebSocket event listeners
        const handleNewChat = (data: { chat: GraphQLChat }) => {
          console.log('Received new chat:', data.chat);
          setRealtimeChats(prev => {
            // Check if chat already exists to avoid duplicates
            const exists = prev.some(chat => chat.id === data.chat.id);
            if (exists) return prev;
            return [...prev, data.chat];
          });
        };

        webSocketService.on('chat_created', handleNewChat);

        // Cleanup function for WebSocket listeners
        return () => {
          webSocketService.off('chat_created', handleNewChat);
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setWsConnected(false);
      }
    };

    const cleanupWebSocket = connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (cleanupWebSocket) {
        cleanupWebSocket.then(cleanup => cleanup && cleanup());
      }
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

  const handleInstanceChange = async (instanceUrl: string) => {
    if (!user || instanceUrl === connectedInstance) return;
    
    setIsReconnecting(true);
    setWsConnected(false);
    
    try {
      await webSocketService.reconnectToInstance(user.id, instanceUrl);
      setConnectedInstance(instanceUrl);
      setWsConnected(true);
      
      // Re-setup WebSocket event listeners
      const handleNewChat = (data: { chat: GraphQLChat }) => {
        console.log('Received new chat:', data.chat);
        setRealtimeChats(prev => {
          const exists = prev.some(chat => chat.id === data.chat.id);
          if (exists) return prev;
          return [...prev, data.chat];
        });
      };

      webSocketService.on('chat_created', handleNewChat);
      
      console.log(`Successfully switched to instance: ${instanceUrl}`);
    } catch (error) {
      console.error('Failed to switch instance:', error);
      setWsConnected(false);
    } finally {
      setIsReconnecting(false);
    }
  };

  // Combine fetched chats and real-time chats, removing duplicates
  const allChats = React.useMemo(() => {
    const fetchedChats = chatsData?.userChats || [];
    const combinedChats = [...fetchedChats];
    
    // Add real-time chats that aren't already in the fetched list
    realtimeChats.forEach(realtimeChat => {
      const exists = fetchedChats.some(chat => chat.id === realtimeChat.id);
      if (!exists) {
        combinedChats.push(realtimeChat);
      }
    });
    
    // Sort by updatedAt, most recent first
    return combinedChats.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [chatsData?.userChats, realtimeChats]);

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
            {/* Instance Selector */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Chat Instance</InputLabel>
              <Select
                value={connectedInstance || ''}
                onChange={(e) => handleInstanceChange(e.target.value)}
                label="Chat Instance"
                disabled={isReconnecting}
              >
                {availableInstances.map((instance) => (
                  <MenuItem key={instance.url} value={instance.url}>
                    {instance.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {connectedInstance && (
              <Box sx={{ 
                px: 2, 
                py: 0.5, 
                borderRadius: 1, 
                backgroundColor: wsConnected ? 'success.light' : 'warning.light', 
                color: wsConnected ? 'success.contrastText' : 'warning.contrastText' 
              }}>
                <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                  {isReconnecting ? 'Reconnecting...' : 
                   wsConnected ? `Connected: ${connectedInstance.replace('http://localhost:', 'Port ')}` :
                   'Disconnected'
                  }
                </Typography>
              </Box>
            )}
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
            {allChats && allChats.length > 0 ? (
              <List>
                {allChats.map((chat, index) => (
                  <React.Fragment key={chat.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        selected={selectedChat?.id === chat.id}
                        onClick={() => handleChatSelect(chat)}
                      >
                        <ListItemText
                          primary={chat.name}
                          secondary={`${chat.participantIds?.length || 0} participants`}
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < allChats.length - 1 && <Divider />}
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
