import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { askQuestion } from '../services/api';

const ChatInterface = ({ media }) => {
  const [messages, setMessages] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef(null);
  const chatEndRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleMediaToggle = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleSendQuestion = async () => {
    if (!newQuestion.trim()) return;

    setLoading(true);
    setError(null);
    const question = newQuestion.trim();
    const currentTime = mediaRef.current?.currentTime || 0;
    
    // Add user question to messages immediately
    setMessages(prev => [...prev, {
      type: 'question',
      content: question,
      timestamp: new Date().toISOString(),
      mediaTimestamp: currentTime
    }]);

    try {
      const answer = await askQuestion(media.id, {
        question,
        timestamp: currentTime,
        context: media.transcript // If available from the upload response
      });

      setMessages(prev => [...prev, {
        type: 'answer',
        content: answer.answer,
        confidence: answer.confidence,
        context: answer.context,
        timestamp: new Date().toISOString(),
        mediaTimestamp: currentTime
      }]);
    } catch (err) {
      setError(err.message || 'Failed to get response. Please try again.');
      console.error('Error getting answer:', err);
    } finally {
      setLoading(false);
      setNewQuestion('');
    }
  };

  return (
    <Card sx={{ 
      mb: 4,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderRadius: 2
    }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {media.type.startsWith('video/') ? '🎥' : '🎵'} {media.name}
          </Typography>
          
          {media.type.startsWith('video/') ? (
            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
              <video
                ref={mediaRef}
                src={media.url}
                controls
                style={{ width: '100%', maxHeight: '300px', backgroundColor: '#000' }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              p: 2, 
              bgcolor: 'grey.100',
              borderRadius: 2
            }}>
              <IconButton onClick={handleMediaToggle} size="large">
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <audio
                ref={mediaRef}
                src={media.url}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <Typography variant="body2" color="text.secondary">
                {media.name}
              </Typography>
            </Box>
          )}
        </Box>

        <Paper 
          sx={{ 
            height: '400px', 
            display: 'flex',
            flexDirection: 'column',
            mb: 2,
            borderRadius: 2,
            bgcolor: 'grey.50'
          }}
        >
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle2" color="text.secondary">
              Chat History
            </Typography>
            <Tooltip title="Clear chat history">
              <IconButton size="small" onClick={clearChat}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <List sx={{ 
            flexGrow: 1, 
            overflow: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: message.type === 'question' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1,
                  py: 0.5
                }}
              >
                <Box sx={{ 
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.type === 'question' ? 'flex-end' : 'flex-start',
                  gap: 0.5
                }}>
                  <ListItemText
                    primary={message.content}
                    secondary={message.type === 'answer' && message.confidence && 
                      `Confidence: ${Math.round(message.confidence)}%`
                    }
                    sx={{
                      m: 0,
                      '& .MuiListItemText-primary': {
                        bgcolor: message.type === 'question' ? 'primary.main' : 'background.paper',
                        color: message.type === 'question' ? 'white' : 'text.primary',
                        p: 1.5,
                        borderRadius: 2,
                        display: 'inline-block',
                        boxShadow: 1
                      },
                      '& .MuiListItemText-secondary': {
                        mt: 0.5,
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    px: 1
                  }}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                    {message.mediaTimestamp && (
                      <Tooltip title="Jump to this part of the media">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => {
                            if (mediaRef.current) {
                              mediaRef.current.currentTime = message.mediaTimestamp;
                              mediaRef.current.play();
                            }
                          }}
                        >
                          {new Date(message.mediaTimestamp * 1000).toISOString().substr(11, 8)}
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </ListItem>
            ))}
            {error && (
              <ListItem>
                <ListItemText
                  primary={error}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: 'error.main',
                      bgcolor: 'error.light',
                      p: 1,
                      borderRadius: 1
                    }
                  }}
                />
              </ListItem>
            )}
            <div ref={chatEndRef} />
          </List>

          <Divider />

          <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question about the content..."
              disabled={loading || !media.transcript}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendQuestion();
                }
              }}
              sx={{ bgcolor: 'background.paper' }}
              helperText={!media.transcript && "Waiting for transcription to complete..."}
            />
            <Button
              variant="contained"
              onClick={handleSendQuestion}
              disabled={loading || !newQuestion.trim() || !media.transcript}
              endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              sx={{ 
                px: 3,
                minWidth: '120px'
              }}
            >
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;