import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { axiosPrivate } from '../../API\'s/axios';
import { toast } from 'react-toastify';

// Material UI Icons
import CloseIcon from '@mui/icons-material/Close';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import '../../Css/VideoGenerationModal.css';

const VideoGenerationModal = ({ 
  isOpen, 
  onClose, 
  storyId, 
  generatedScenes,
  onVideoComplete // Callback when video generation completes
}) => {
  const [videoData, setVideoData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Polling reference
  const pollingRef = useRef(null);
  const abortControllerRef = useRef(null);
  const delayTimeoutRef = useRef(null);
  const hasInitialized = useRef(false);

  // Define active statuses that require polling
  const activeStatuses = ['in-progress', 'generating-audio', 'generating-video'];

  // Main initialization effect - runs when modal opens
  useEffect(() => {
    if (isOpen && storyId && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeVideoGeneration();
    }
    
    // Reset when modal closes
    if (!isOpen) {
      hasInitialized.current = false;
    }
    
    // Cleanup on modal close or unmount
    return () => {
      cleanup();
    };
  }, [isOpen, storyId]);

  // Initialize video generation process
  const initializeVideoGeneration = async () => {
    try {
      // First, check if video already exists
      const existingVideo = await checkExistingVideo();
      
      if (!existingVideo) {
        // No existing video, start generation
        await handleGenerateVideo();
      }
    } catch (error) {
      console.error('Error initializing video generation:', error);
      setError('Failed to initialize video generation. Please try again.');
    }
  };

  // Check if video already exists for this story
  const checkExistingVideo = async () => {
    try {
      const response = await axiosPrivate.get(`/story-to-video/${storyId}`);
      
      if (response.data) {
        setVideoData(response.data);
        
        // Check if video is in any active generating status
        if (activeStatuses.includes(response.data.status)) {
          setIsGenerating(true);
          startPolling(); // Start polling immediately for existing videos
          return true;
        } else if (response.data.status === 'failed') {
          setError('Video generation failed. Please try again.');
          return true;
        } else if (response.data.status === 'done') {
          // Video is already completed
          return true;
        }
        // For 'pending' status, we'll continue to start generation
      }
      return false;
    } catch (error) {
      // Handle 404 as expected behavior (no video exists yet)
      if (error.response?.status === 404) {
        console.log('No existing video found - will create new one');
        return false;
      }
      
      // Handle other errors
      console.error('Error checking existing video:', error);
      
      if (error.response?.status >= 500) {
        throw new Error('Server error occurred. Please try again later.');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Authentication required. Please log in again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('Unable to check video status. Please try again.');
      }
    }
  };

  // Generate new video
  const handleGenerateVideo = async () => {
    if (generatedScenes.length === 0) {
      setError("No scenes available to generate video");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const response = await axiosPrivate.post(`/story-to-video/${storyId}`, {}, {
        signal: abortControllerRef.current.signal
      });
      
      if (response.data) {
        setVideoData(response.data);
        toast.success("Video generation started! Please wait...");
        
        // Start polling after 5 seconds delay
        startPollingWithDelay();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Error generating video:', error);
      setError('Failed to start video generation. Please try again.');
      setIsGenerating(false);
      toast.error("Failed to start video generation");
    }
  };

  // Start polling with 5-second delay
  const startPollingWithDelay = () => {
    console.log('Setting up delayed polling - will start in 5 seconds...');
    
    // Clear any existing delay timeout
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    
    // Set timeout to start polling after 5 seconds
    delayTimeoutRef.current = setTimeout(() => {
      console.log('Starting polling after 5-second delay');
      startPolling();
      delayTimeoutRef.current = null;
    }, 5000); // 5 seconds delay
  };

  // Start polling for video status
  const startPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    pollingRef.current = setInterval(async () => {
      try {
        console.log('Polling video status...');
        const response = await axiosPrivate.get(`/story-to-video/${storyId}`);
        
        if (response.data) {
          setVideoData(response.data);
          const status = response.data.status;
          
          console.log('Current video status:', status);
          
          // Check if status is 'done'
          if (status === 'done') {
            setIsGenerating(false);
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            toast.success("🎉 Video generation completed!");
            console.log('Video completed, polling stopped');
            
            // Call the callback to update parent component
            if (onVideoComplete) {
              onVideoComplete();
            }
          } 
          // Check if status is 'failed'
          else if (status === 'failed') {
            setIsGenerating(false);
            setError('Video generation failed. Please try again.');
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            toast.error("❌ Video generation failed");
            console.log('Video failed, polling stopped');
          }
          // Continue polling for active statuses
          else if (activeStatuses.includes(status)) {
            console.log(`Video still generating with status: ${status}, continuing to poll...`);
            // Continue polling - do nothing here
          }
          // Handle any unexpected status
          else {
            console.warn('Unexpected video status:', status);
            // Continue polling for unexpected statuses
          }
        }
      } catch (error) {
        console.error('Error polling video status:', error);
        // Don't stop polling on error - server might be temporarily unavailable
      }
    }, 5000); // Poll every 5 seconds
  };

  // Cleanup function
  const cleanup = () => {
    // Stop polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    
    // Clear delay timeout
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Handle modal close
  const handleClose = () => {
    cleanup();
    // Reset states
    setError(null);
    setVideoData(null);
    setIsGenerating(false);
    hasInitialized.current = false;
    
    onClose();
  };

  // Retry video generation
  const handleRetry = () => {
    setError(null);
    setVideoData(null);
    hasInitialized.current = false;
    initializeVideoGeneration();
  };

  // Get user-friendly status message
  const getStatusMessage = (status) => {
    switch (status) {
      case 'in-progress':
        return 'Processing your request...';
      case 'generating-audio':
        return 'Generating audio narration...';
      case 'generating-video':
        return 'Creating video from scenes...';
      case 'done':
        return 'Video completed!';
      case 'failed':
        return 'Generation failed';
      default:
        return 'Starting generation...';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="video-modal-overlay" onClick={handleClose}>
      <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="video-modal-header">
          <h2 className="video-modal-title">Generated Video</h2>
          <button 
            className="video-modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Content */}
        <div className="video-modal-content">
          {/* Show loading state when generating */}
          {isGenerating && (
            <div className="video-content-state">
              <div className="video-spinner-container">
                <div className="video-spinner"></div>
              </div>
              <h3 className="video-state-title">Generating your video...</h3>
              <p className="video-state-subtitle">This may take a few moments</p>
              <p className="video-status-text">
                Status: {videoData?.status ? getStatusMessage(videoData.status) : 'Starting generation...'}
              </p>
            </div>
          )}

          {/* Show error state */}
          {error && !isGenerating && (
            <div className="video-content-state">
              <div className="video-error-icon">
                <ErrorOutlineIcon className="error-icon" />
              </div>
              <h3 className="video-state-title">Video Generation Failed</h3>
              <p className="video-state-subtitle">{error}</p>
              <button 
                className="video-retry-btn"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Show completed video when status is 'done' */}
          {videoData?.status === 'done' && videoData.video_url && !isGenerating && !error && (
            <div className="video-player-container">
              <ReactPlayer
                url={videoData.video_url}
                controls={true}
                width="100%"
                height="100%"
                playing={false}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                      preload: 'metadata'
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationModal;