import React, { useState, useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { axiosPrivate } from '../../API\'s/axios';
import { toast } from 'react-toastify';
import toWebVTT from 'srt-webvtt';
import { Languages } from 'lucide-react';

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
  modalMode,
  onLanguageSelect,
  videoData: initialVideoData
}) => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [error, setError] = useState(null);

  // Video player refs
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const menuRef = useRef(null);

  // Language management states
  const [videoData, setVideoData] = useState(initialVideoData);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [generatingLanguages, setGeneratingLanguages] = useState(new Set());
  const pollingRef = useRef(null);
  const playerInitializedRef = useRef(false);

  // Update videoData when prop changes
  useEffect(() => {
    if (initialVideoData) {
      setVideoData(initialVideoData);
    }
  }, [initialVideoData]);

  // Polling logic for language generation
  useEffect(() => {
    if (!isOpen || modalMode !== 'view-video') return;
    
    if (generatingLanguages.size === 0) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const pollVideoStatus = async () => {
      try {
        const response = await axiosPrivate.get(`/story-to-video/${storyId}`);
        
        if (response.data) {
          const newVideoData = response.data;
          setVideoData(newVideoData);
          
          const stillGenerating = new Set();

          // Check each generating language
          generatingLanguages.forEach(lang => {
            const audioTrack = newVideoData.audio_tracks?.find(
              track => track.language === lang
            );
            const subtitleTrack = newVideoData.subtitle_tracks?.find(
              track => track.language === lang
            );

            const audioStatus = audioTrack?.status;
            const subtitleStatus = subtitleTrack?.status;

            // Check if still generating
            if ((audioStatus !== 'done' && audioStatus !== 'failed') ||
                (subtitleStatus !== 'done' && subtitleStatus !== 'failed')) {
              stillGenerating.add(lang);
            } else {
              // Generation completed or failed
              if (audioStatus === 'done' && subtitleStatus === 'done') {
                toast.success(`✅ ${SUBTITLE_LANGUAGES[lang]} generated successfully!`);
                // Automatically switch to the new language
                handleLanguageSwitch(lang, newVideoData);
              } else if (audioStatus === 'failed' || subtitleStatus === 'failed') {
                toast.error(`❌ Failed to generate ${SUBTITLE_LANGUAGES[lang]}`);
              }
            }
          });

          setGeneratingLanguages(stillGenerating);
          
          // Update menu to reflect new language statuses
          if (menuRef.current && playerRef.current) {
            updateLanguageMenu(newVideoData);
          }
        }
      } catch (error) {
        console.error('Error polling video status:', error);
        // Don't clear all generating languages on error, just log it
      }
    };

    // Initial poll
    pollVideoStatus();

    // Set up interval
    pollingRef.current = setInterval(pollVideoStatus, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [generatingLanguages.size, storyId, isOpen, modalMode]);

  // Convert SRT to WebVTT
  const convertSrtToVtt = async (srtUrl) => {
    try {
      const response = await fetch(srtUrl);
      const blob = await response.blob();
      const vttUrl = await toWebVTT(blob);
      return vttUrl;
    } catch (error) {
      console.error('Error converting SRT to VTT:', error);
      return null;
    }
  };

  // Handle language generation
  const handleGenerateLanguage = async (languageCode) => {
    try {
      setGeneratingLanguages(prev => new Set([...prev, languageCode]));

      const response = await axiosPrivate.post(
        `/story-to-video/${videoData.id}/AddLanguage`,
        { language: languageCode }
      );

      if (response.data) {
        toast.success(`🎬 Generating ${SUBTITLE_LANGUAGES[languageCode]}...`);
      }
    } catch (error) {
      console.error('Error generating language:', error);
      toast.error(`Failed to generate ${SUBTITLE_LANGUAGES[languageCode]}`);
      setGeneratingLanguages(prev => {
        const newSet = new Set(prev);
        newSet.delete(languageCode);
        return newSet;
      });
    }
  };

  // Handle language switch
  const handleLanguageSwitch = async (newLanguage, data = videoData) => {
    if (!playerRef.current) return;

    setCurrentLanguage(newLanguage);

    // Find the audio track for the selected language
    const audioTrack = data.audio_tracks?.find(
      track => track.language === newLanguage && track.status === 'done'
    );

    // Update audio source
    if (audioTrack && audioRef.current) {
      const currentTime = playerRef.current.currentTime();
      const isPlaying = !playerRef.current.paused();
      
      audioRef.current.src = audioTrack.url;
      audioRef.current.currentTime = currentTime;
      
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error('Error playing audio:', e));
      }
    }

    // Update subtitle track
    const subtitleTrack = data.subtitle_tracks?.find(
      track => track.language === newLanguage && track.status !== 'failed'
    );

    if (subtitleTrack && playerRef.current) {
      // Remove all existing text tracks
      const tracks = playerRef.current.remoteTextTracks();
      const length = tracks.length;
      for (let i = length - 1; i >= 0; i--) {
        playerRef.current.removeRemoteTextTrack(tracks[i]);
      }

      // Add new subtitle track
      const vttUrl = await convertSrtToVtt(subtitleTrack.url);
      if (vttUrl) {
        playerRef.current.addRemoteTextTrack({
          kind: 'subtitles',
          src: vttUrl,
          srclang: subtitleTrack.language,
          label: SUBTITLE_LANGUAGES[subtitleTrack.language] || subtitleTrack.language,
          mode: 'showing'
        }, false);

        // Enable the subtitle
        setTimeout(() => {
          const textTracks = playerRef.current.textTracks();
          for (let i = 0; i < textTracks.length; i++) {
            if (textTracks[i].language === newLanguage) {
              textTracks[i].mode = 'showing';
            }
          }
        }, 100);
      }
    }
    
    // Update menu to highlight current language
    if (menuRef.current) {
      updateLanguageMenu(data);
    }
  };

  // Update language menu dynamically
  const updateLanguageMenu = (data) => {
    if (!menuRef.current) return;

    // Clear existing menu items
    menuRef.current.innerHTML = '';

    // Recreate menu items with updated statuses
    Object.entries(SUBTITLE_LANGUAGES).forEach(([code, label]) => {
      const item = document.createElement('div');
      item.className = 'vjs-language-menu-item';
      
      const audioTrack = data.audio_tracks?.find(t => t.language === code);
      const isGenerated = audioTrack?.status === 'done';
      const isGenerating = generatingLanguages.has(code);
      const isCurrent = currentLanguage === code;

      item.style.cssText = `
        padding: 10px 16px;
        cursor: pointer;
        color: ${isCurrent ? '#4CAF50' : 'white'};
        font-weight: ${isCurrent ? 'bold' : 'normal'};
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background 0.2s;
      `;

      const labelSpan = document.createElement('span');
      labelSpan.textContent = label;
      item.appendChild(labelSpan);

      if (isGenerating) {
        const badge = document.createElement('span');
        badge.textContent = 'Generating...';
        badge.style.cssText = 'font-size: 11px; color: #FFA726; margin-left: 8px;';
        item.appendChild(badge);
      } else if (!isGenerated) {
        const badge = document.createElement('span');
        badge.textContent = '+ Generate';
        badge.style.cssText = 'font-size: 11px; color: #4CAF50; margin-left: 8px;';
        item.appendChild(badge);
      }

      item.addEventListener('mouseenter', () => {
        if (!isCurrent) item.style.background = 'rgba(255, 255, 255, 0.1)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'transparent';
      });

      item.addEventListener('click', () => {
        menuRef.current.style.display = 'none';
        
        if (isGenerated) {
          handleLanguageSwitch(code, data);
          toast.success(`Switched to ${label}`);
        } else if (!isGenerating) {
          handleGenerateLanguage(code);
        }
      });

      menuRef.current.appendChild(item);
    });
  };

  // Create custom caption menu button
  const createCustomCaptionButton = (player, data) => {
    // Create button element
    const buttonEl = document.createElement('button');
    buttonEl.className = 'vjs-control vjs-button vjs-language-button';
    buttonEl.type = 'button';
    buttonEl.setAttribute('aria-label', 'Languages');
    buttonEl.innerHTML = '<span class="vjs-icon-placeholder" title="select audio track">文A</span>';

    // Create menu
    const menu = document.createElement('div');
    menu.className = 'vjs-language-menu';
    menu.style.cssText = `
      position: absolute;
      bottom: 100%;
      right: 0;
      background: rgba(0, 0, 0, 0.9);
      border-radius: 4px;
      padding: 8px 0;
      min-width: 180px;
      display: none;
      z-index: 1000;
      margin-bottom: 10px;
    `;

    menuRef.current = menu;

    // Initialize menu items
    updateLanguageMenu(data);

    // Toggle menu on button click
    buttonEl.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    // Create wrapper to hold button and menu
    const wrapper = document.createElement('div');
    wrapper.className = 'vjs-language-button-wrapper';
    wrapper.style.position = 'relative';
    wrapper.appendChild(buttonEl);
    wrapper.appendChild(menu);

    // Add to control bar
    const controlBar = player.controlBar.el();
    controlBar.appendChild(wrapper);

    // Close menu when clicking outside
    const closeMenu = (e) => {
      if (!wrapper.contains(e.target)) {
        menu.style.display = 'none';
      }
    };
    document.addEventListener('click', closeMenu);

    // Cleanup function
    return () => {
      document.removeEventListener('click', closeMenu);
      menuRef.current = null;
    };
  };

  // Initialize Video.js player ONCE
  useEffect(() => {
    let cleanupCaptionButton = null;

    const initializePlayer = async () => {
      // Only initialize if we're in view mode, have video data, and haven't initialized yet
      if (modalMode === 'view-video' && 
          videoData?.video_url && 
          videoRef.current && 
          !playerRef.current &&
          !playerInitializedRef.current) {
        
        playerInitializedRef.current = true;

        const player = videojs(videoRef.current, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          fluid: true,
          aspectRatio: '16:9',
          muted: true,
          poster: videoData.thumbnail_url || '',
        });

        playerRef.current = player;

        // Set video source
        player.src({ src: videoData.video_url, type: 'video/mp4' });

        // Find primary audio track
        const primaryAudio = videoData.audio_tracks?.find(
          track => track.type === 'primary' && track.status === 'done'
        );

        // Set external audio source
        if (primaryAudio && audioRef.current) {
          audioRef.current.src = primaryAudio.url;
        }

        // Sync external audio with video
        player.on('play', () => {
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.error('Error playing audio:', e));
          }
        });

        player.on('pause', () => {
          if (audioRef.current) audioRef.current.pause();
        });

        player.on('seeked', () => {
          if (audioRef.current && player) {
            audioRef.current.currentTime = player.currentTime();
          }
        });

        player.on('ratechange', () => {
          if (audioRef.current && player) {
            audioRef.current.playbackRate = player.playbackRate();
          }
        });

        // Add primary subtitle track
        const primarySubtitle = videoData.subtitle_tracks?.find(
          track => track.type === 'primary' && track.language === 'en'
        );

        if (primarySubtitle) {
          const vttUrl = await convertSrtToVtt(primarySubtitle.url);
          
          if (vttUrl && playerRef.current) {
            player.addRemoteTextTrack({
              kind: 'subtitles',
              src: vttUrl,
              srclang: primarySubtitle.language,
              label: SUBTITLE_LANGUAGES[primarySubtitle.language] || 'English',
              mode: 'showing'
            }, false);

            player.on('loadedmetadata', () => {
              if (playerRef.current) {
                const tracks = player.textTracks();
                for (let i = 0; i < tracks.length; i++) {
                  if (tracks[i].language === 'en') {
                    tracks[i].mode = 'showing';
                  }
                }
              }
            });
          }
        }
        videoData.subtitle_tracks.map(async (audio)=>{
          if(audio?.status=="failed" || audio?.type=="primary"){
            return
          }
          const vttUrl = await convertSrtToVtt(audio.url);

          if(vttUrl && playerRef.current){
             player.addRemoteTextTrack({
              kind: 'subtitles',
              src: vttUrl,
              srclang: audio.language,
              label: SUBTITLE_LANGUAGES[audio.language] || audio.language
            }, false);
          }
        })



        // Add custom caption button
        cleanupCaptionButton = createCustomCaptionButton(player, videoData);

        console.log('Video player initialized');
      }
    };

    if (isOpen && modalMode === 'view-video') {
      initializePlayer();
    }

    // Cleanup only when modal closes or mode changes
    return () => {
      if (!isOpen || modalMode !== 'view-video') {
        if (cleanupCaptionButton) {
          cleanupCaptionButton();
        }
        if (playerRef.current && !playerRef.current.isDisposed()) {
          playerRef.current.dispose();
          playerRef.current = null;
          playerInitializedRef.current = false;
        }
      }
    };
  }, [isOpen, modalMode]); // Only depend on isOpen and modalMode

  // Update menu when videoData changes (without reinitializing player)
  useEffect(() => {
    if (playerRef.current && menuRef.current && videoData && modalMode === 'view-video') {
      updateLanguageMenu(videoData);
    }
  }, [videoData, generatingLanguages]); // Update menu when data or generating languages change

  const handleVideoPublish = async () => {
    try {
      const response = await axiosPrivate.post('/publish-video-to-explore', {
        story_id: storyId,
      });
      
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
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.dispose();
      playerRef.current = null;
      playerInitializedRef.current = false;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setError(null);
    setSelectedLanguage("");
    setGeneratingLanguages(new Set());
    setCurrentLanguage('en');
    onClose();
  };

  const handleLanguageGenerateClick = () => {
    if (!selectedLanguage) {
      toast.error('Please select a language');
      return;
    }
    onLanguageSelect(selectedLanguage);
    handleClose();
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

              {/* Hidden audio element for external audio */}
              <audio
                ref={audioRef}
                style={{ display: 'none' }}
              />
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
