// src/services/api.js
const API_BASE_URL = 'http://localhost:3001/api';

// Upload media file (video or audio)
export const uploadMedia = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('media', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Ask a question about the media content
export const askQuestion = async (mediaId, question) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId,
        question,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get answer');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Question failed: ${error.message}`);
  }
};

// Get transcription status
export const getTranscriptionStatus = async (mediaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${mediaId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get status');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Status check failed: ${error.message}`);
  }
};

// Delete media and associated data
export const deleteMedia = async (mediaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/media/${mediaId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete media');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

// Get media information
export const getMediaInfo = async (mediaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/media/${mediaId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get media info');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Get media info failed: ${error.message}`);
  }
};

// Optional: Helper function to handle errors consistently
export const handleApiError = (error) => {
  console.error('API Error:', error);
  return {
    error: true,
    message: error.message || 'An unexpected error occurred'
  };
};

