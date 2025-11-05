import React, { useState, useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { axiosPrivate } from '../../API\'s/axios';
import { toast } from 'react-toastify';
import toWebVTT from 'srt-webvtt';
import { Languages } from 'lucide-react';

import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import '../../Css/VideoGenerationModal.css';
import { useLocation, useNavigate } from 'react-router-dom';

const SUBTITLE_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  hi: 'Hindi',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  'zh-cn': 'Chinese',
  pt: 'Portuguese',
  ar: 'Arabic',
  ta: 'Tamil',
  te: 'Telugu'
};

const VideoGenerationModal = ({
  isOpen,
  onClose,
  storyId,
  generatedScenes,
  onVideoComplete,
  modalMode,          // kept for compatibility, ignored
  onLanguageSelect,   // kept for compatibility, unused
  videoData: initialVideoData
}) => {
  const navigate = useNavigate();
   const location = useLocation(); 

  // status/toast state (unchanged API surface)
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  // Player refs
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const menuRef = useRef(null);

  // Video data and language state
  const [videoData, setVideoData] = useState(initialVideoData);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [generatingLanguages, setGeneratingLanguages] = useState(new Set());
  const pollingRef = useRef(null);
  const playerInitializedRef = useRef(false);

   const isPublishedVideosPage = location.pathname === '/u/published-videos';
  const isExploreVideoPage = location.pathname === '/explore'

  // Reflect prop changes
  useEffect(() => {
    if (initialVideoData) setVideoData(initialVideoData);
  }, [initialVideoData]);

  // Polling only when there are languages being generated
  useEffect(() => {
    if (!isOpen) return;

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

          generatingLanguages.forEach(lang => {
            const audioTrack = newVideoData.audio_tracks?.find(t => t.language === lang);
            const subtitleTrack = newVideoData.subtitle_tracks?.find(t => t.language === lang);

            const audioStatus = audioTrack?.status;
            const subtitleStatus = subtitleTrack?.status;

            if ((audioStatus !== 'done' && audioStatus !== 'failed') ||
                (subtitleStatus !== 'done' && subtitleStatus !== 'failed')) {
              stillGenerating.add(lang);
            } else {
              if (audioStatus === 'done' && subtitleStatus === 'done') {
                toast.success(`✅ ${SUBTITLE_LANGUAGES[lang]} generated successfully!`);
                handleLanguageSwitch(lang, newVideoData);
              } else if (audioStatus === 'failed' || subtitleStatus === 'failed') {
                toast.error(`❌ Failed to generate ${SUBTITLE_LANGUAGES[lang]}`);
              }
            }
          });

          setGeneratingLanguages(stillGenerating);

          if (menuRef.current && playerRef.current) {
            updateLanguageMenu(newVideoData);
          }
        }
      } catch (e) {
        console.error('Error polling video status:', e);
      }
    };

    // initial + interval
    pollVideoStatus();
    pollingRef.current = setInterval(pollVideoStatus, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [generatingLanguages.size, storyId, isOpen]);

  // SRT -> VTT
  const convertSrtToVtt = async (srtUrl) => {
    try {
      const response = await fetch(srtUrl);
      const blob = await response.blob();
      const vttUrl = await toWebVTT(blob);
      return vttUrl;
    } catch (e) {
      console.error('Error converting SRT to VTT:', e);
      return null;
    }
  };

  // Trigger language generation from inside the view modal
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
    } catch (e) {
      console.error('Error generating language:', e);
      toast.error(`Failed to generate ${SUBTITLE_LANGUAGES[languageCode]}`);
      setGeneratingLanguages(prev => {
        const ns = new Set(prev);
        ns.delete(languageCode);
        return ns;
      });
    }
  };

  // Switch active audio/subtitle to a language
  const handleLanguageSwitch = async (newLanguage, data = videoData) => {
    if (!playerRef.current) return;

    setCurrentLanguage(newLanguage);

    const audioTrack = data.audio_tracks?.find(
      t => t.language === newLanguage && t.status === 'done'
    );

    if (audioTrack && audioRef.current) {
      const currentTime = playerRef.current.currentTime();
      const isPlaying = !playerRef.current.paused();

      audioRef.current.src = audioTrack.url;
      audioRef.current.currentTime = currentTime;

      if (isPlaying) {
        audioRef.current.play().catch(e => console.error('Error playing audio:', e));
      }
    }

    const subtitleTrack = data.subtitle_tracks?.find(
      t => t.language === newLanguage && t.status !== 'failed'
    );

   
    if (subtitleTrack && playerRef.current) {
     

      const vttUrl = await convertSrtToVtt(subtitleTrack.url);
      if (vttUrl) {
        playerRef.current.addRemoteTextTrack({
          kind: 'subtitles',
          src: vttUrl,
          srclang: subtitleTrack.language,
          label: SUBTITLE_LANGUAGES[subtitleTrack.language] || subtitleTrack.language,

        }, false);
      }
    }

    if (menuRef.current) updateLanguageMenu(data);
  };

// Separate utility function to store currently selected subtitle
// const storeCurrentSelectedSubtitle = (playerRef, setCurrentSubtitle, videoData, SUBTITLE_LANGUAGES) => {
//   if (!playerRef?.current) {
//     console.warn("⚠️ Player not ready yet — cannot read textTracks");
//     return;
//   }

//   const player = playerRef.current;
//   const vjsTracks = player.textTracks ? player.textTracks() : [];

//   if (!vjsTracks || !vjsTracks.length) {
//     setCurrentSubtitle(undefined);
//     return;
//   }

//   for (let i = 0; i < vjsTracks.length; i++) {
//     const t = vjsTracks[i];
//     if (t.kind === 'subtitles' && t.mode === 'showing') {
//       const code = t.language || t.srclang || '';
//       if (code && SUBTITLE_LANGUAGES[code]) {
//         setCurrentSubtitle(code);
//         return;
//       }
//     }
//   }

//   // If no matching subtitle found
//   setCurrentSubtitle(undefined);
// };

// useEffect(() => {
//   storeCurrentSelectedSubtitle(playerRef, setCurrentSubtitle, videoData, SUBTITLE_LANGUAGES);
// }, [videoData, playerRef]);



  
  // Build/update the in-player menu
  // Build/update the in-player menu
const updateLanguageMenu = (data) => {
  if (!menuRef.current) return;

  menuRef.current.innerHTML = '';

  Object.entries(SUBTITLE_LANGUAGES).forEach(([code, label]) => {
    const item = document.createElement('div');
    item.className = 'vjs-language-menu-item';

    const audioTrack = data.audio_tracks?.find(t => t.language === code);
    const isGenerated = audioTrack?.status === 'done';
    const isGenerating = generatingLanguages.has(code);
    const isCurrent = currentLanguage === code;

    // On explore page, skip languages that aren't generated
    if (isExploreVideoPage && !isGenerated) {
      return; // Don't show this language option
    }

    item.style.cssText = `
      padding: 10px 16px;
      cursor: ${isGenerated ? 'pointer' : (isExploreVideoPage ? 'not-allowed' : 'pointer')};
      color: ${isCurrent ? '#4CAF50' : 'white'};
      opacity: ${isGenerated || !isExploreVideoPage ? '1' : '0.5'};
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
    } else if (!isGenerated && !isExploreVideoPage && !isPublishedVideosPage) {
      // Only show "+ Generate" if NOT on explore or published videos page
      const badge = document.createElement('span');
      badge.textContent = '+ Generate';
      badge.style.cssText = 'font-size: 11px; color: #4CAF50; margin-left: 8px;';
      item.appendChild(badge);
    } else if (!isGenerated && isPublishedVideosPage) {
      // On published videos page, show "+ Generate" option
      const badge = document.createElement('span');
      badge.textContent = '+ Generate';
      badge.style.cssText = 'font-size: 11px; color: #4CAF50; margin-left: 8px;';
      item.appendChild(badge);
    }

    item.addEventListener('mouseenter', () => {
      if (!isCurrent && isGenerated) {
        item.style.background = 'rgba(255, 255, 255, 0.1)';
      }
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent';
    });

    item.addEventListener('click', () => {
      menuRef.current.style.display = 'none';

      if (isGenerated) {
        // Switch to generated language
        handleLanguageSwitch(code, data);
        toast.success(`Switched to ${label}`);
      } else if (!isGenerating && !isExploreVideoPage) {
        // Only allow generation if NOT on explore page
        handleGenerateLanguage(code);
      }
    });

    menuRef.current.appendChild(item);
  });
};


  // Create the language button and attach to control bar
  const createCustomCaptionButton = (player, data) => {
    const buttonEl = document.createElement('button');
    buttonEl.className = 'vjs-control vjs-button vjs-language-button';
    buttonEl.type = 'button';
    buttonEl.setAttribute('aria-label', 'Languages');
    buttonEl.innerHTML = '<span class="vjs-icon-placeholder" title="select audio track">文A</span>';

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
    updateLanguageMenu(data);

    buttonEl.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'vjs-language-button-wrapper';
    wrapper.style.position = 'relative';
    wrapper.appendChild(buttonEl);
    wrapper.appendChild(menu);

    const controlBar = player.controlBar.el();
    controlBar.appendChild(wrapper);

    const closeMenu = (e) => {
      if (!wrapper.contains(e.target)) {
        menu.style.display = 'none';
      }
    };
    document.addEventListener('click', closeMenu);

    return () => {
      document.removeEventListener('click', closeMenu);
      menuRef.current = null;
    };
  };

  // Initialize player once when modal opens
  useEffect(() => {
    let cleanupCaptionButton = null;

    const initializePlayer = async () => {
      if (
        isOpen &&
        videoData?.video_url &&
        videoRef.current &&
        !playerRef.current &&
        !playerInitializedRef.current
      ) {
        playerInitializedRef.current = true;

        const player = videojs(videoRef.current, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          fluid: true,
          aspectRatio: '16:9',
          muted: true,
          poster: videoData.thumbnail_url || ''
        });

        playerRef.current = player;

        player.src({ src: videoData.video_url, type: 'video/mp4' });

        const primaryAudio = videoData.audio_tracks?.find(
          t => t.type === 'primary' && t.status === 'done'
        );

        if (primaryAudio && audioRef.current) {
          audioRef.current.src = primaryAudio.url;
        }

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

        const primarySubtitle = videoData.subtitle_tracks?.find(
          t => t.type === 'primary' && t.language === 'en'
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

        videoData.subtitle_tracks?.forEach(async (sub) => {
          if (sub?.status === 'failed' || sub?.type === 'primary') return;
          const vttUrl = await convertSrtToVtt(sub.url);
          if (vttUrl && playerRef.current) {
            player.addRemoteTextTrack({
              kind: 'subtitles',
              src: vttUrl,
              srclang: sub.language,
              label: SUBTITLE_LANGUAGES[sub.language] || sub.language
            }, false);
          }
        });

        
        let tracks= player.textTracks();
        if (tracks){
          tracks.addEventListener('change',
            ()=>{
              for(let i=0;i<tracks.length;i++){
                const track= tracks[i];
                if(track.mode=='showing'){
                  setCurrentSubtitle(track.language||track.label)
                }
              }
            }
          )
        }

        cleanupCaptionButton = createCustomCaptionButton(player, videoData);
      }
    };

    // storeCurrentSelectedSubtitle()

    if (isOpen) {
      initializePlayer();
    }

    return () => {
      if (!isOpen) {
        if (cleanupCaptionButton) cleanupCaptionButton();
        if (playerRef.current && !playerRef.current.isDisposed()) {
          playerRef.current.dispose();
          playerRef.current = null;
          playerInitializedRef.current = false;
        }
      }
    };
  }, [isOpen, videoData?.video_url]); // only view mode exists now

  // Keep menu fresh when data or generating languages change
  useEffect(() => {
    if (playerRef.current && menuRef.current && videoData && isOpen) {
      updateLanguageMenu(videoData);
    }
  }, [videoData, generatingLanguages, isOpen]);

  const handleVideoPublish = async () => {
    try {
      const response = await axiosPrivate.post('/publish-video-to-explore', {
        story_id: storyId
      });
      if (response.status === 200) {
        setSuccess(true);
        setSuccessMessage(response.data.message);
        setErrorMessage(null);
        onClose();
        toast.success('Video published successfully!');
        navigate('/explore');
      }
    } catch (e) {
      console.error('error in publishing video', e);
      setErrorMessage(e.response?.data?.message);
      onClose();
      toast.error(e.response?.data?.message || 'Failed to publish video');
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
    setGeneratingLanguages(new Set());
    setCurrentLanguage('en');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="video-modal-overlay" onClick={handleClose}>
      <div className="video-modal-container" onClick={e => e.stopPropagation()}>
        <div className="video-modal-header">
          <h2 className="video-modal-title">Generated Video</h2>
          <div className="d-flex gap-2 align-items-center">
            {!isPublishedVideosPage && !isExploreVideoPage && storyId && videoData?.status === 'done' && (
              <button
                title="publish video"
                className="video-publish-btn"
                onClick={handleVideoPublish}
              >
                <span className="d-flex align-items-center video-publish-icon">
                  <FileUploadOutlinedIcon />
                </span>
              </button>
            )}
            <button title="close" className="video-modal-close-btn" onClick={handleClose}>
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="video-modal-content">
          {videoData?.status === 'done' && videoData?.video_url ? (
            <div className="video-player-container">
              <div data-vjs-player>
                <video ref={videoRef} className="video-js vjs-big-play-centered" playsInline />
              </div>
              <audio ref={audioRef} style={{ display: 'none' }} />
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