import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  Alert,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { webSocketService } from '../services/websocket';
import { useGetChatQuery, Chat as GraphQLChat, User as GraphQLUser, Message as GraphQLMessage } from '../generated/graphql';

interface ChatInterfaceProps {
  chat: GraphQLChat;
  user: GraphQLUser;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chat, user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<GraphQLMessage[]>(chat.messages || []);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatData } = useGetChatQuery({
    variables: { chatId: chat.id, userId: user.id },
  });

  useEffect(() => {
    if (chatData?.chat) {
      setMessages(chatData.chat.messages || []);
    }
  }, [chatData]);

  useEffect(() => {
    // Join the chat room when component mounts
    webSocketService.joinChat(chat.id, user.id);

    // Set up WebSocket event listeners
    const handleNewMessage = (newMessage: GraphQLMessage) => {
      if (newMessage.chatId === chat.id) {
        setMessages(prev => [...prev, newMessage]);
      }
    };

    const handleChatJoined = (data: { chatId: string; messages: GraphQLMessage[] }) => {
      if (data.chatId === chat.id) {
        setMessages(data.messages);
      }
    };

    const handleError = (error: { message: string }) => {
      setError(error.message);
    };

    webSocketService.on('new_message', handleNewMessage);
    webSocketService.on('chat_joined', handleChatJoined);
    webSocketService.on('error', handleError);

    // Cleanup on unmount
    return () => {
      webSocketService.off('new_message', handleNewMessage);
      webSocketService.off('chat_joined', handleChatJoined);
      webSocketService.off('error', handleError);
      webSocketService.leaveChat(chat.id, user.id);
    };
  }, [chat.id, user.id]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages]);

  // Also scroll to bottom when component mounts
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'auto',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    try {
      webSocketService.sendMessage(message.trim(), chat.id, user.id);
      setMessage('');
      setError('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">{chat.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {chat.participantIds?.length || 0} participants
        </Typography>
      </Paper>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#ccc',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#999',
        },
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {messages.map((msg, index) => {
              const isOwnMessage = msg.senderId === user.id;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.senderId !== msg.senderId;
              const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
              const isLastInGroup = !nextMessage || nextMessage.senderId !== msg.senderId;

              return (
                <ListItem
                  key={msg.id}
                  sx={{
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    px: 2,
                    py: 0.5,
                    display: 'flex',
                  }}
                >
                  {/* Avatar or Spacer */}
                  <Box sx={{ 
                    minWidth: 40, 
                    display: 'flex', 
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end',
                    pb: isLastInGroup ? 0 : 0.5
                  }}>
                    {showAvatar ? (
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '0.75rem',
                          bgcolor: isOwnMessage ? 'primary.main' : 'secondary.main',
                        }}
                      >
                        {msg.senderId ? msg.senderId.substring(0, 2).toUpperCase() : '?'}
                      </Avatar>
                    ) : (
                      <Box sx={{ width: 32 }} />
                    )}
                  </Box>
                  
                  {/* Message Content */}
                  <Box
                    sx={{
                      maxWidth: '70%',
                      minWidth: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
                        color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                        wordBreak: 'break-word',
                        position: 'relative',
                      }}
                    >
                      <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                        {msg.content}
                      </Typography>
                    </Paper>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        textAlign: isOwnMessage ? 'right' : 'left',
                        mt: 0.5,
                        fontSize: '0.7rem',
                      }}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      {/* Message Input */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 0, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatInterface;
