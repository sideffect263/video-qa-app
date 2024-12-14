// components/MediaUpload.js
import React, { useState, useCallback } from 'react';
import { 
  Button, 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress,
  IconButton,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import CloseIcon from '@mui/icons-material/Close';
import { uploadMedia } from '../services/api';

const MediaUpload = ({ onMediaSelect }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const processMedia = async (file) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Upload file
      const response = await uploadMedia(file);
      
      // Create URL for local preview
      const mediaUrl = URL.createObjectURL(file);
      
      // Pass complete media data to parent
      onMediaSelect({
        id: response.id,
        name: file.name,
        type: file.type,
        url: mediaUrl,
        size: file.size,
        transcript: response.transcript
      });

      setProgress(100);
    } catch (err) {
      setError(err.message || 'Error processing media. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) handleFileSelected(file);
  }, []);

  const handleFileSelected = (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      setError('Please upload only audio or video files.');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size too large. Please upload files smaller than 50MB.');
      return;
    }

    processMedia(file);
  };

  return (
    <Card 
      sx={{ 
        mb: 4,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 3,
            border: '2px dashed #2196f3',
            borderRadius: 2,
            backgroundColor: 'rgba(33, 150, 243, 0.04)',
            position: 'relative'
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setError(null)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          <input
            accept="audio/*,video/*"
            style={{ display: 'none' }}
            id="media-upload"
            type="file"
            onChange={(e) => handleFileSelected(e.target.files[0])}
          />
          
          <label htmlFor="media-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
              sx={{ 
                mb: 2,
                px: 4,
                py: 1.5
              }}
            >
              Upload Media
            </Button>
          </label>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <AudioFileIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="body2">Audio Files</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <VideoFileIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="body2">Video Files</Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Drag and drop your files here or click to browse
          </Typography>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 8,
                  borderRadius: 4
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {progress < 100 ? 'Processing...' : 'Complete!'} ({Math.round(progress)}%)
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MediaUpload;