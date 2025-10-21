import React, { useState, useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'; // Import Video.js styles
import { axiosPrivate } from '../../API\'s/axios';
import { toast } from 'react-toastify';

// Material UI Icons
import CloseIcon from '@mui/icons-material/Close';
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

  // Refs for polling, aborting, etc.
  const pollingRef = useRef(null);
  const abortControllerRef = useRef(null);
  const delayTimeoutRef = useRef(null);
  const hasInitialized = useRef(false);

  // Video.js player refs
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const activeStatuses = ['in-progress', 'generating-audio', 'generating-video'];

  // Initialize on open
  useEffect(() => {
    if (isOpen && storyId && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeVideoGeneration();
    }

    if (!isOpen) {
      hasInitialized.current = false;
    }

    return () => {
      cleanup();
      disposePlayer();
    };
  }, [isOpen, storyId]);

  // ---- Video.js Setup ----
  useEffect(() => {
    // Initialize the Video.js player when the video URL becomes available
    if (videoData?.status === 'done' && videoData.video_url && videoRef.current) {
      if (!playerRef.current) {
        setTimeout(() => {
          playerRef.current = videojs(videoRef.current, {
            controls: true,
            autoplay: false,
            preload: 'auto',
            fluid: true,
            poster: videoData.thumbnail_url || '',
          });

          // Set video source
          playerRef.current.src({ src: videoData.video_url, type: 'video/mp4' });
        }, 0);
      }
    }

    // Dispose player when modal closes or video changes
    return () => {
      disposePlayer();
    };
  }, [videoData]);

  const disposePlayer = () => {
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
  };

  // ---- Video Generation Logic ----

  const initializeVideoGeneration = async () => {
    try {
      const existingVideo = await checkExistingVideo();

      if (!existingVideo) {
        await handleGenerateVideo();
      }
    } catch (error) {
      console.error('Error initializing video generation:', error);
      setError('Failed to initialize video generation. Please try again.');
    }
  };

  const checkExistingVideo = async () => {
    try {
      const response = await axiosPrivate.get(`/story-to-video/${storyId}`);

      if (response.data) {
        setVideoData(response.data);

        if (activeStatuses.includes(response.data.status)) {
          setIsGenerating(true);
          startPolling();
          return true;
        } else if (response.data.status === 'failed') {
          setError('Video generation failed. Please try again.');
          return true;
        } else if (response.data.status === 'done') {
          return true;
        }
      }
      return false;
    } catch (error) {
      if (error.response?.status === 404) return false;
      console.error('Error checking existing video:', error);
      throw new Error('Unable to check video status. Please try again.');
    }
  };

  const handleGenerateVideo = async () => {
    if (generatedScenes.length === 0) {
      setError('No scenes available to generate video');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      abortControllerRef.current = new AbortController();

      const response = await axiosPrivate.post(`/story-to-video/${storyId}`, {}, {
        signal: abortControllerRef.current.signal
      });

      if (response.data) {
        setVideoData(response.data);
        toast.success('Video generation started! Please wait...');
        startPollingWithDelay();
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Error generating video:', error);
      setError('Failed to start video generation. Please try again.');
      setIsGenerating(false);
      toast.error('Failed to start video generation');
    }
  };

  const startPollingWithDelay = () => {
    if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);

    delayTimeoutRef.current = setTimeout(() => {
      startPolling();
      delayTimeoutRef.current = null;
    }, 5000);
  };

  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const response = await axiosPrivate.get(`/story-to-video/${storyId}`);

        if (response.data) {
          setVideoData(response.data);
          const status = response.data.status;

          if (status === 'done') {
            setIsGenerating(false);
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            toast.success('🎉 Video generation completed!');
            if (onVideoComplete) onVideoComplete();
          } else if (status === 'failed') {
            setIsGenerating(false);
            setError('Video generation failed. Please try again.');
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            toast.error('❌ Video generation failed');
          }
        }
      } catch (error) {
        console.error('Error polling video status:', error);
      }
    }, 5000);
  };

  const cleanup = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  const handleClose = () => {
    cleanup();
    disposePlayer();
    setError(null);
    setVideoData(null);
    setIsGenerating(false);
    hasInitialized.current = false;
    onClose();
  };

  const handleRetry = () => {
    disposePlayer();
    setError(null);
    setVideoData(null);
    hasInitialized.current = false;
    initializeVideoGeneration();
  };

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
        {/* Header */}
        <div className="video-modal-header">
          <h2 className="video-modal-title">Generated Video</h2>
          <button className="video-modal-close-btn" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="video-modal-content">
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

          {error && !isGenerating && (
            <div className="video-content-state">
              <div className="video-error-icon">
                <ErrorOutlineIcon className="error-icon" />
              </div>
              <h3 className="video-state-title">Video Generation Failed</h3>
              <p className="video-state-subtitle">{error}</p>
              <button className="video-retry-btn" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          )}

          {/* ✅ Video.js Player */}
          {videoData?.status === 'done' && videoData.video_url && !isGenerating && !error && (
            <div className="video-player-container">
              <div data-vjs-player>
                <video
                  ref={videoRef}
                  className="video-js vjs-big-play-centered"
                  playsInline
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationModal;