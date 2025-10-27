import React, { useState, useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { axiosPrivate } from '../../API\'s/axios';
import { toast } from 'react-toastify';

// Material UI Icons
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import '../../Css/VideoGenerationModal.css';
import { useNavigate } from 'react-router-dom';

const SUBTITLE_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'hi': 'Hindi',
  'fr': 'French',
  'de': 'German',
  'ja': 'Japanese',
  'zh-cn': 'Chinese',
  'pt': 'Portuguese',
  'ar': 'Arabic',
  'ta': 'Tamil',
  'te': 'Telugu'
};

const VideoGenerationModal = ({ 
  isOpen, 
  onClose, 
  storyId, 
  generatedScenes, 
  onVideoComplete,
  modalMode, // 'language-selection' or 'view-video'
  onLanguageSelect,
  videoData
}) => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (modalMode === 'view-video' && videoData?.video_url && videoRef.current) {
      if (!playerRef.current) {
        setTimeout(() => {
          playerRef.current = videojs(videoRef.current, {
            controls: true,
            autoplay: false,
            preload: 'auto',
            fluid: true,
            poster: videoData.thumbnail_url || '',
          });

          playerRef.current.src({ src: videoData.video_url, type: 'video/mp4' });
        }, 0);
      }
    }

    return () => {
      disposePlayer();
    };
  }, [modalMode, videoData]);

  const disposePlayer = () => {
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
  };

  const handleVideoPublish = async () => {
    try {
      const response = await axiosPrivate.post('/publish-video-to-explore', {
        story_id: storyId,
      });
      console.log(response.data);
      if (response.status === 200) {
        setSuccess(true);
        setSuccessMessage(response.data.message);
        setErrorMessage(null);
        onClose();
        toast.success('Video published successfully!');
        navigate('/explore');
      }
    } catch (error) {
      console.error("error in publishing video", error);
      setErrorMessage(error.response?.data?.message);
      onClose();
      toast.error(error.response?.data?.message || 'Failed to publish video');
    }
  };

  const handleClose = () => {
    disposePlayer();
    setError(null);
    setSelectedLanguage("");
    onClose();
  };

  const handleLanguageGenerateClick = () => {
    if (!selectedLanguage) {
      toast.error('Please select a language');
      return;
    }
    onLanguageSelect(selectedLanguage);
    handleClose(); // Close modal after language selection
  };

  if (!isOpen) return null;

  return (
    <div className="video-modal-overlay" onClick={handleClose}>
      <div className="video-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="video-modal-header">
          <h2 className="video-modal-title">
            {modalMode === 'language-selection' ? "Select Subtitle Language" : "Generated Video"}
          </h2>
          <div className='d-flex gap-2 align-items-center'>
            {/* Show publish button only in view-video mode */}
            {modalMode === 'view-video' && (
              <button 
                title='publish video' 
                className='video-publish-btn' 
                onClick={handleVideoPublish}
              >
                <span className='d-flex align-items-center video-publish-icon'>
                  <FileUploadOutlinedIcon />
                </span>
              </button>
            )}
            <button title='close' className="video-modal-close-btn" onClick={handleClose}>
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="video-modal-content">
          {modalMode === 'language-selection' ? (
            <div className="language-selection-container">
              <label htmlFor="language-select" className="language-select-label">
                Choose subtitle language
              </label>
              <div className="custom-select-container">
                <select
                  id="language-select"
                  className="custom-select"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="" disabled>Select a language</option>
                  {Object.entries(SUBTITLE_LANGUAGES).map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>
              <button
                className="generate-video-btn"
                disabled={!selectedLanguage}
                onClick={handleLanguageGenerateClick}
              >
                Generate Video
              </button>
            </div>
          ) : modalMode === 'view-video' && videoData?.status === 'done' && videoData.video_url ? (
            <div className="video-player-container">
              <div data-vjs-player>
                <video
                  ref={videoRef}
                  className="video-js vjs-big-play-centered"
                  playsInline
                />
              </div>
            </div>
          ) : (
            <div className="video-content-state">
              <div className="vidaeo-error-icon">
                <ErrorOutlineIcon className="error-icon" />
              </div>
              <h3 className="video-state-title">Video Not Available</h3>
              <p className="video-state-subtitle">Unable to load video. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationModal;
