// App.js
import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  Paper,
  useMediaQuery
} from '@mui/material';
import MediaUpload from './components/MediaUpload';
import ChatInterface from './components/ChatInterface';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }
      }
    }
  }
});

function App() {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ 
          my: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4,
          minHeight: '100vh',
          py: 4
        }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              backgroundColor: 'transparent' 
            }}
          >
            <Typography 
              variant={isSmallScreen ? "h5" : "h3"} 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196f3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Audio & Video Q&A System
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Upload your media and ask questions about its content
            </Typography>
          </Paper>
          
          <MediaUpload onMediaSelect={setSelectedMedia} />
          {selectedMedia && <ChatInterface media={selectedMedia} />}
        </Box>
      </Container>
    </ThemeProvider>
  );
}


export default App;