import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { axiosPrivate } from '../../API\'s/axios';

// Video generate component
import VideoGenerationModal from '../../Components/StoriesComponent/VideoGenerationModal';


// Material UI Icons
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import '../../Css/CreateScenes.css';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../../Components/CommonComponents/DeleteConfirmationModal';

function CreateScenes() {
  const [generatedScenes, setGeneratedScenes] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [regeneratingSceneId, setRegeneratingSceneId] = useState(null);
  
  // Modal state for video generation
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalMode, setVideoModalMode] = useState('language-selection');

  // Video status checking states
  const [existingVideoStatus, setExistingVideoStatus] = useState(null);
  const [isCheckingVideo, setIsCheckingVideo] = useState(false);
  const [videoGenerationInProgress, setVideoGenerationInProgress] = useState(false);
  const [existingVideoData, setExistingVideoData] = useState(null);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sceneToDelete, setSceneToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Story type state
  const [storyType, setStoryType] = useState(null);

  // Auto-generation state
  const [autoGenState, setAutoGenState] = useState({
    isActive: false,
    status: null,
    totalScenes: 0,
    generatedScenes: 0,
    lastSceneCount: 0
  });

  // Use useRef for polling interval to avoid stale closures
  const statusPollingRef = useRef(null);
  const videoPollingRef = useRef(null);

  const { storyid } = useParams(); 

  // Check existing video status
  const checkExistingVideoStatus = useCallback(async () => {
    if (!storyid) return;
    
    setIsCheckingVideo(true);
    try {
      const response = await axiosPrivate.get(`/story-to-video/${storyid}`);
      
      if (response.data) {
        setExistingVideoStatus(response.data.status);
        console.log('Existing video status:', response.data.status);
        
        // If video is done, just set status
        if (response.data.status === 'done') {
          setVideoGenerationInProgress(false);
          if (videoPollingRef.current) {
            clearInterval(videoPollingRef.current);
            videoPollingRef.current = null;
          }
        }
        // If video failed, stop polling
        else if (response.data.status === 'failed') {
          setVideoGenerationInProgress(false);
          if (videoPollingRef.current) {
            clearInterval(videoPollingRef.current);
            videoPollingRef.current = null;
          }
        }
        // If video is in progress, start polling
        else if (['in-progress', 'generating-audio', 'generating-video'].includes(response.data.status)) {
          setVideoGenerationInProgress(true);
          startVideoPolling();
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setExistingVideoStatus(null);
        setExistingVideoData(null);
        console.log('No existing video found');
      } else {
        console.error('Error checking video status:', error);
        setExistingVideoStatus(null);
        setExistingVideoData(null);
      }
    } finally {
      setIsCheckingVideo(false);
    }
  }, [storyid]);

  // Start video polling
  const startVideoPolling = useCallback(() => {
    if (videoPollingRef.current) {
      clearInterval(videoPollingRef.current);
    }

    videoPollingRef.current = setInterval(async () => {
      try {
        const response = await axiosPrivate.get(`/story-to-video/${storyid}`);
        
        if (response.data) {
          const status = response.data.status;
          setExistingVideoStatus(status);
          
          if (status === 'done') {
            setVideoGenerationInProgress(false);
            clearInterval(videoPollingRef.current);
            videoPollingRef.current = null;
            toast.success('🎉 Video generation completed!');
          } else if (status === 'failed') {
            setVideoGenerationInProgress(false);
            clearInterval(videoPollingRef.current);
            videoPollingRef.current = null;
            toast.error('❌ Video generation failed');
          }
        }
      } catch (error) {
        console.error('Error polling video status:', error);
      }
    }, 5000);
  }, [storyid]);

  // Handle language selection from modal
  const handleLanguageSelect = async (languageCode) => {
    try {
      setVideoGenerationInProgress(true);
      
      const response = await axiosPrivate.post(`/story-to-video/${storyid}`, {
        language: languageCode
      });
      
      if (response.data) {
        setExistingVideoStatus(response.data.status);
        toast.success('Video generation started! Please wait...');
        startVideoPolling();
      }
    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('Failed to start video generation');
      setVideoGenerationInProgress(false);
    }
  };

  // Handle generate video button click
  const handleGenerateVideo = () => {
    if (generatedScenes.length === 0) {
      showToast("No scenes available to generate video", 'error');
      return;
    }
    
    setVideoModalMode('language-selection');
    setIsVideoModalOpen(true);
  };

  // Handle view video button click - ALWAYS fetches fresh video data
  const handleViewVideo = async () => {
    try {
      console.log('Fetching video data from API...');
      const response = await axiosPrivate.get(`/story-to-video/${storyid}`);
      
      if (response.data && response.data.status === 'done') {
        setExistingVideoData(response.data);
        console.log('Video data fetched:', response.data);
        setVideoModalMode('view-video');
        setIsVideoModalOpen(true);
      } else {
        toast.error('Video is not ready yet');
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
      toast.error('Failed to load video');
    }
  };

  // Close video modal function
  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  // Handle video generation completion callback
  const handleVideoGenerationComplete = () => {
    setExistingVideoStatus('done');
    setVideoGenerationInProgress(false);
  };

  // Delete modal handlers
  const handleDeleteClick = (scene) => {
    setSceneToDelete(scene);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSceneToDelete(null);
    setIsDeleting(false);
  };

  const handleConfirmDeleteScene = async () => {
    if (!sceneToDelete) return;

    setIsDeleting(true);

    try {
      const response = await axiosPrivate.post('/scenes/delete', {
        scene_id: sceneToDelete.id
      });
      
      if (response.data.success) {
        setGeneratedScenes(prev => prev.filter(scene => scene.id !== sceneToDelete.id));
        toast.success("Scene deleted successfully!");
        handleCloseDeleteModal();
      } else {
        toast.error(response.data.message || "Failed to delete scene");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting scene:', error);
      toast.error("Failed to delete scene");
      setIsDeleting(false);
    }
  };

  // Fetch story info to determine type
  const fetchStoryInfo = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(`/get-story/${storyid}`);
      
      if (response.data.success) {
        const story = response.data.story;
        setStoryType(story.type || 'manual');
        console.log('Story type detected:', story.type || 'manual');
      }
    } catch (error) {
      console.error('Error fetching story info:', error);
      setStoryType('manual');
    }
  }, [storyid]);

  // Fetch existing scenes function
  const fetchExistingScenes = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(`/scenes/storyId`, {
        params: {
          story_id: storyid
        }
      });
      
      if (response.data.success) {
        const formattedScenes = response.data.scenes.map(scene => ({
          id: scene.id,
          prompt: scene.prompt,
          image_url: scene.image_url,
          characters: scene.characters ? scene.characters.map(char => char.name) : [],
          timestamp: formatTimestamp(scene.createdAt),
          location: scene.location,
          environment: scene.environment,
          scene_order: scene.scene_order,
          updated_at: scene.updatedAt || scene.updated_at || scene.createdAt,
          created_at: scene.createdAt
        }));
        setGeneratedScenes(formattedScenes);
      }
    } catch (error) {
      console.error('Error fetching existing scenes:', error);
      setGeneratedScenes([]);
    }
  }, [storyid]);

  // Status checking function - ONLY for auto stories
  const checkStoryStatus = useCallback(async () => {
    if (!storyid || storyType !== 'auto') return;
    
    try {
      const response = await axiosPrivate.get(`/story/${storyid}/status`);
      
      if (response.data.success) {
        const statusData = response.data.data;
        console.log('Auto story status:', statusData);
        
        setAutoGenState(prev => {
          const newState = {
            isActive: ['in-progress', 'generating-characters', 'generating-scenes'].includes(statusData.status),
            status: statusData.status,
            totalScenes: statusData.total_scenes,
            generatedScenes: statusData.generated_scenes,
            lastSceneCount: prev.generatedScenes
          };
          
          if (statusData.generated_scenes > prev.generatedScenes) {
            fetchExistingScenes();
          }
          
          return newState;
        });

        // Stop polling for completed, failed, OR partially-completed
        if (['completed', 'failed', 'partially-completed'].includes(statusData.status)) {
          if (statusPollingRef.current) {
            clearInterval(statusPollingRef.current);
            statusPollingRef.current = null;
            console.log('Polling stopped for status:', statusData.status);
          }
          
          // Use localStorage to persist toast flags across page navigations
          const completedToastKey = `story-${storyid}-completed-toast-shown`;
          const failedToastKey = `story-${storyid}-failed-toast-shown`;
          const partiallyCompletedToastKey = `story-${storyid}-partially-completed-toast-shown`;
          
          if (statusData.status === 'completed' && !localStorage.getItem(completedToastKey)) {
            toast.success('🎉 Story generation completed!');
            localStorage.setItem(completedToastKey, 'true');
          } 
          else if (statusData.status === 'failed' && !localStorage.getItem(failedToastKey)) {
            toast.error('❌ Story generation failed. Please try again.');
            localStorage.setItem(failedToastKey, 'true');
          }
          else if (statusData.status === 'partially-completed' && !localStorage.getItem(partiallyCompletedToastKey)) {
            toast.success('✅ Story generation partially completed!');
            localStorage.setItem(partiallyCompletedToastKey, 'true');
          }
        }
      }
    } catch (error) {
      console.error('Error checking story status:', error);
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
      }
    }
  }, [storyid, storyType, fetchExistingScenes]);

  // Modified useEffect for initialization
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setIsLoading(true);
        await fetchStoryInfo();
        await fetchExistingScenes();
        await checkExistingVideoStatus();
      } catch (error) {
        console.error('Error initializing component:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();

    return () => {
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
      }
      if (videoPollingRef.current) {
        clearInterval(videoPollingRef.current);
        videoPollingRef.current = null;
      }
    };
  }, [storyid, fetchStoryInfo, fetchExistingScenes, checkExistingVideoStatus]);

  useEffect(() => {
    if (storyType === 'auto') {
      checkStoryStatus();
    }
  }, [storyType, checkStoryStatus]);

  // Polling useEffect
  useEffect(() => {
    if (storyType !== 'auto') return;

    const shouldPoll = ['in-progress', 'generating-characters', 'generating-scenes'].includes(autoGenState.status);
    
    if (shouldPoll && !statusPollingRef.current) {
      console.log('Starting status polling for auto story, status:', autoGenState.status);
      statusPollingRef.current = setInterval(checkStoryStatus, 5000);
    } else if (!shouldPoll && statusPollingRef.current) {
      console.log('Stopping status polling for auto story, status:', autoGenState.status);
      clearInterval(statusPollingRef.current);
      statusPollingRef.current = null;
    }

    return () => {
      if (!shouldPoll && statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
      }
    };
  }, [autoGenState.status, checkStoryStatus, storyType]);

  const formatTimestamp = (dateString) => {
    const now = new Date();
    const sceneDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - sceneDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
  };

  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'info') {
      toast.info(message);
    } else {
      toast.error(message);
    }
  };

  // Components
  const CharactersNotCompleted = () => (
    <div className="characters-not-completed">
      <div className="not-completed-content">
        <div className="not-completed-icon">
          <PeopleOutlineIcon className="icon-xxl" />
        </div>
        <h3 className="not-completed-title">Characters are not yet completed</h3>
        <p className="not-completed-subtitle">
          Please wait for character generation to complete before creating scenes
        </p>
        <Link to={`/u/stories/${storyid}/characters`} className="link-unstyled">
          <button className="btn-primary">
            <PeopleOutlineIcon className="icon-sm" />
            Go to Characters
          </button>
        </Link>
      </div>
    </div>
  );

  const AutoGenerationFailed = () => (
    <div className="auto-generation-failed">
      <div className="failed-header">
        <div className="failed-icon">
          <span className="failed-emoji">❌</span>
        </div>
        <div className="failed-content">
          <h3 className="failed-title">Scene Generation Failed</h3>
          <p className="failed-message">
            Something went wrong during the automated scene generation. You can create scenes manually using the form above.
          </p>
        </div>
      </div>
    </div>
  );

  const StoryGenerationCompleted = () => (
    <div className="story-generation-completed">
      <div className="completed-header">
        <div className="completed-icon">
          <CheckCircleIcon className="icon-lg" style={{ color: '#10b981' }} />
        </div>
        <div className="completed-content">
          <h3 className="completed-title">🎉 Story Generation Completed!</h3>
          <p className="completed-message">
            Your automated story generation has been successfully completed. All scenes have been generated and are ready for review.
          </p>
        </div>
      </div>
    </div>
  );

  const LoadingSceneCard = ({ sceneNumber }) => (
    <div className="scene-card loading-scene">
      <div className="scene-content">
        <div className="scene-prompt-section">
          <div className="prompt-header">
            <div className="skeleton-text skeleton-title"></div>
            <div className="skeleton-text skeleton-timestamp"></div>
          </div>
          <div className="prompt-details">
            <div className="skeleton-prompt-container">
              <div className="skeleton-text skeleton-prompt-line skeleton-line-1"></div>
              <div className="skeleton-text skeleton-prompt-line skeleton-line-2"></div>
              <div className="skeleton-text skeleton-prompt-line skeleton-line-3"></div>
              <div className="skeleton-text skeleton-prompt-line skeleton-line-4"></div>
            </div>
          </div>
          <div className="prompt-characters skeleton-characters">
            <div className="skeleton-text skeleton-char-label"></div>
            <div className="skeleton-tags">
              <div className="skeleton-tag"></div>
              <div className="skeleton-tag"></div>
            </div>
          </div>
        </div>
        <div className="scene-image-section">
          <div className="scene-image-container">
            <div className="simple-spinner-container">
              <div className="simple-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getLoadingSceneCards = () => {
    if (storyType !== 'auto' || autoGenState.status !== 'generating-scenes') return [];
    
    const loadingCards = [];
    const nextSceneNumber = autoGenState.generatedScenes + 1;
    
    if (nextSceneNumber <= autoGenState.totalScenes) {
      loadingCards.push(
        <LoadingSceneCard key={`loading-${nextSceneNumber}`} sceneNumber={nextSceneNumber} />
      );
    }
    
    return loadingCards;
  };

  const handleGenerateScene = async () => {
    if (!prompt.trim()) {
      showToast("Please enter a scene description", 'error');
      return;
    }

    if (!storyid) {
      showToast("Story ID is required", 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await axiosPrivate.post(`/scenes/generate`, {
        story_id: parseInt(storyid),
        prompt: prompt.trim()
      });
      
      if (response.data.success) {
        const newScene = response.data.scene;
        
        const formattedScene = {
          id: newScene.id,
          prompt: newScene.prompt,
          image_url: newScene.image_url,
          characters: newScene.characters ? newScene.characters.map(char => char.name) : [],
          timestamp: "Just now",
          location: newScene.location,
          environment: newScene.environment,
          scene_order: newScene.scene_order,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        
        setGeneratedScenes(prev => [formattedScene, ...prev]);
        showToast("Scene generated successfully!");
        setPrompt("");
      } else {
        showToast("Failed to generate scene", 'error');
      }
    } catch (error) {
      console.error('Error generating scene:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Failed to generate scene';
        showToast(errorMessage, 'error');
      } else if (error.request) {
        showToast("Network error. Please check your connection.", 'error');
      } else {
        showToast("An unexpected error occurred", 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateScene = async (sceneId, prompt) => {
    setRegeneratingSceneId(sceneId);
    
    try {
      console.log('Regenerating scene:', sceneId, 'with prompt:', prompt);
      
      const response = await axiosPrivate.post('/scenes/regenerate', {
        scene_id: sceneId,
        prompt: prompt
      });
      
      if (response.data.success) {
        const updatedSceneData = response.data.scene;
        console.log('Regeneration response:', updatedSceneData);
        
        setGeneratedScenes(prev => 
          prev.map(scene => 
            scene.id === sceneId 
              ? { 
                  ...scene,
                  image_url: updatedSceneData.image_url,
                  updated_at: updatedSceneData.updatedAt,
                  prompt: updatedSceneData.prompt,
                  characters: updatedSceneData.characters ? updatedSceneData.characters.map(char => char.name) : scene.characters,
                  location: updatedSceneData.location,
                  environment: updatedSceneData.environment,
                  timestamp: "Just now"
                }
              : scene
          )
        );
        
        showToast("Scene regenerated successfully!");
      } else {
        showToast("Failed to regenerate scene", 'error');
      }
    } catch (error) {
      console.error('Error regenerating scene:', error);
      showToast("Failed to regenerate scene", 'error');
    } finally {
      setRegeneratingSceneId(null);
    }
  };

  const downloadImage = async (imageUrl, sceneName = 'scene') => {
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const imageBlob = await response.blob();
      const imageURL = URL.createObjectURL(imageBlob);
      
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `${sceneName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(imageURL);
      
      showToast("Image downloaded successfully!");
    } catch (error) {
      console.error('Error downloading image:', error);
      showToast("Failed to download image", 'error');
    }
  };

  const toggleTips = () => {
    setIsTipsOpen(!isTipsOpen);
  };

  if (isLoading) {
    return (
      <div className="scenes-container mt-5">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading scenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scenes-container mt-5">
      {/* Header */}
      <div className="scenes-header">
        <div className="header-content">
          <h1 className="page-title">Scene Generator</h1>
          <p className="page-subtitle">
            Create stunning scenes with your characters
          </p>
        </div>
      </div>

      {/* Show completed state - ONLY for auto stories */}
      {storyType === 'auto' && autoGenState.status === 'completed' && (
        <StoryGenerationCompleted />
      )}

      {/* Show failed state - ONLY for auto stories */}
      {storyType === 'auto' && autoGenState.status === 'failed' && (
        <AutoGenerationFailed />
      )}

      {/* Show "Characters not completed" ONLY for auto stories until generating-scenes */}
      {storyType === 'auto' && autoGenState.status && !['generating-scenes', 'partially-completed', 'completed', 'failed'].includes(autoGenState.status) ? (
        <CharactersNotCompleted />
      ) : (
        <>
          {/* Scene Generation Panel */}
          <div className={`scene-generation-section ${storyType === 'auto' && autoGenState.status === 'generating-scenes' ? 'full-width-layout' : ''}`}>
            <div className={`prompt-card ${storyType === 'auto' && autoGenState.status === 'generating-scenes' ? 'full-width' : ''}`}>
              <div className="scene-card-header d-flex flex-column">
                <h2 className="scene-card-title">
                  <AutoFixHighIcon className="icon-sm" />
                  {storyType === 'auto' && autoGenState.status === 'generating-scenes' ? 'Automated Scene Generation' : 'Scene Description'}
                </h2>
                <p className="scene-card-description text-start">
                  {storyType === 'auto' && autoGenState.status === 'generating-scenes' 
                    ? 'Scenes are being automatically generated based on your story description'
                    : 'Describe the scene you want to generate'
                  }
                </p>
              </div>
              
              <div className="card-content">
                {storyType === 'auto' && autoGenState.status === 'generating-scenes' ? (
                  <div className="automated-generation-info">
                    <div className="generation-progress">
                      <div className="progress-circle">
                        <AutoAwesomeIcon className="icon-lg" style={{ color: '#667eea' }} />
                      </div>
                      <div className="progress-text">
                        <h4>🤖 Generating scenes automatically...</h4>
                        <p>Progress: <strong>{autoGenState.generatedScenes}/{autoGenState.totalScenes}</strong> scenes completed</p>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${(autoGenState.generatedScenes / autoGenState.totalScenes) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label htmlFor="scene-prompt" className="form-label">Scene Prompt</label>
                      <textarea
                        id="scene-prompt"
                        placeholder="Describe your scene in detail... (e.g., 'A dramatic confrontation in a moonlit castle courtyard with mystical fog swirling around')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="form-textarea scene-textarea"
                        rows="5"
                        disabled={isGenerating}
                      />
                    </div>

                    <div className="prompt-actions">
                      <button
                        onClick={handleGenerateScene}
                        disabled={isGenerating || !prompt.trim()}
                        className="btn-primary btn-large"
                      >
                        {isGenerating ? (
                          <>
                            <div className="loading-spinner"></div>
                            Generating Scene...
                          </>
                        ) : (
                          <>
                            <PlayArrowIcon className="icon-sm" />
                            Generate Scene
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
                
                <div className="navigation-actions">
                  <Link to={`/u/stories/${storyid}/characters`} className="link-unstyled">
                    <button className="btn-outline">
                      <PeopleOutlineIcon className="icon-sm" />
                      Go to Characters
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {!(storyType === 'auto' && autoGenState.status === 'generating-scenes') && (
              <div className="tips-card">
                <div 
                  className="scene-card-header tips-header" 
                  onClick={toggleTips}
                  role="button"
                  tabIndex={0}
                >
                  <h3 className="tips-title">Scene Tips</h3>
                  <div className="accordion-icon">
                    {isTipsOpen ? <ExpandLessIcon className="icon-sm" /> : <ExpandMoreIcon className="icon-sm" />}
                  </div>
                </div>
                <div className={`tips-content ${isTipsOpen ? 'tips-open' : ''}`}>
                  <ul className="tips-list">
                    <li>• Be specific about lighting and mood</li>
                    <li>• Include environmental details</li>
                    <li>• Describe character actions and emotions</li>
                    <li>• Mention specific props or objects</li>
                    <li>• Consider the camera angle or perspective</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Generate / View Video Button Section */}
          <div className="video-generation-section">
            <div className="video-actions-container">
              {isCheckingVideo ? (
                <button
                  disabled
                  className="btn-primary video-generate-btn disabled"
                >
                  <div className="loading-spinner-small"></div>
                  Checking Video Status...
                </button>
              ) : existingVideoStatus === 'done' ? (
                <button
                  onClick={handleViewVideo}
                  className="btn-primary video-generate-btn"
                >
                  <VideoLibraryIcon className="icon-sm" />
                  View Video
                </button>
              ) : existingVideoStatus === 'failed' ? (
                <button
                  onClick={handleGenerateVideo}
                  className="btn-primary video-generate-btn"
                >
                  <RefreshIcon className="icon-sm" />
                  Generate Video Again
                </button>
              ) : videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus) ? (
                <button
                  disabled
                  className="btn-primary video-generate-btn disabled"
                >
                  <div className="loading-spinner-small"></div>
                  Generating Video...
                </button>
              ) : (
                <button
                  onClick={handleGenerateVideo}
                  disabled={generatedScenes.length === 0}
                  className={`btn-primary video-generate-btn ${
                    generatedScenes.length === 0 ? 'disabled' : ''
                  }`}
                  title={
                    generatedScenes.length === 0
                      ? "Generate at least one scene to create video"
                      : "Generate video from scenes"
                  }
                >
                  <VideoLibraryIcon className="icon-sm" />
                  Generate Video
                </button>
              )}
            </div>
          </div>

          {/* Generated Scenes Timeline */}
          <div className="scenes-timeline">
            {generatedScenes.map((scene, index) => (
              <div key={scene.id} className="scene-card">
                <div className="scene-content">
                  <div className="scene-prompt-section">
                    <div className="prompt-header">
                      <h4 className="prompt-title">Scene #{scene.scene_order || generatedScenes.length - index}</h4>
                      <span className="prompt-timestamp">{scene.timestamp}</span>
                    </div>
                    <div className='prompt-details'>
                      <p className="prompt-text pt-5">
                        <strong>prompt:</strong> {scene.prompt}
                      </p>
                    </div>
                    
                    {scene.environment && (
                      <div className="scene-details">
                        <p className="scene-environment">
                          <strong>Environment:</strong> {scene.environment}
                        </p>
                      </div>
                    )}
                    
                    {scene.characters.length > 0 && (
                      <div className="prompt-characters align-items-center">
                        <span><PeopleOutlineIcon className="icon-xs character-icon"/></span>
                        <span className="characters-text">
                          {scene.characters.map((character, idx) => (
                            <span key={idx} className="character-tag ms-2">{character}</span>
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="scene-image-section">
                    <div className="scene-image-container">
                      {scene.image_url ? (
                        <div className="scene-image-wrapper">
                          {regeneratingSceneId === scene.id && (
                            <div className="simple-loading-overlay">
                              <div className="simple-spinner"></div>
                              <p>Regenerating...</p>
                            </div>
                          )}
                          
                          <img 
                            key={`scene-${scene.id}-${new Date(scene.updated_at).getTime()}`}
                            src={`${scene.image_url}?v=${new Date(scene.updated_at).getTime()}`} 
                            alt={`Generated scene`}
                            className="scene-image"
                            onError={(e) => {
                              console.log('Image load error for:', e.target.src);
                            }}
                          />
                          
                          <div className="image-actions">
                            <button 
                              className={`image-action-btn ${
                                (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status)) ||
                                (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                                  ? 'disabled' 
                                  : ''
                              }`}
                              title={
                                (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status))
                                  ? "Regenerate not available during story generation"
                                  : (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                                  ? "Regenerate not available during video generation"
                                  : "Regenerate Scene"
                              }
                              onClick={() => {
                                if (
                                  (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status)) ||
                                  (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                                ) {
                                  return;
                                }
                                handleRegenerateScene(scene.id, scene.prompt);
                              }}
                              disabled={
                                regeneratingSceneId === scene.id || 
                                (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status)) ||
                                (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                              }
                            >
                              <RefreshIcon className="icon-xs" />
                            </button>
                            
                            <button 
                              className={`image-action-btn ${
                                (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status)) ||
                                (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                                  ? 'disabled' 
                                  : ''
                              }`}
                              title={
                                (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status))
                                  ? "Download not available during story generation"
                                  : (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                                  ? "Download not available during video generation"
                                  : "Download Scene"
                              }
                              onClick={() => {
                                if (
                                  (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status)) ||
                                  (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                                ) {
                                  return;
                                }
                                downloadImage(scene.image_url, `scene_${scene.id}`);
                              }}
                              disabled={
                                regeneratingSceneId === scene.id || 
                                (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status)) ||
                                (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                              }
                            >
                              <DownloadIcon className="icon-xs" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="scene-image-placeholder">
                          <div className="image-overlay"></div>
                          <p className="no-image-text">No image available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Delete button - always visible */}
                <div className="scene-card-actions">
                  <button 
                    className={`scene-delete-btn ${
                      (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status)) ||
                      (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                        ? 'disabled' 
                        : ''
                    }`}
                    title={
                      (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status))
                        ? "Delete not available during story generation"
                        : (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                        ? "Delete not available during video generation"
                        : "Delete Scene"
                    }
                    onClick={() => {
                      if (
                        (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status)) ||
                        (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                      ) {
                        return;
                      }
                      handleDeleteClick(scene);
                    }}
                    disabled={
                      (storyType === "auto" && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status)) ||
                      (videoGenerationInProgress || ['in-progress', 'generating-audio', 'generating-video'].includes(existingVideoStatus))
                    }
                  >
                    <DeleteOutlineIcon className="icon-xs" />
                    Delete Scene
                  </button>
                </div>
              </div>
            ))}
            
            {getLoadingSceneCards()}
            
            {generatedScenes.length === 0 && !isLoading && !(storyType === 'auto' && autoGenState.isActive) && (
              <div className="empty-state">
                <div className="empty-icon">
                  <ImageOutlinedIcon className="icon-xxl" />
                </div>
                <h3 className="empty-title">No scenes generated yet</h3>
                <p className="empty-subtitle">Create your first scene using the prompt above</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Video Generation Modal */}
      <VideoGenerationModal
        isOpen={isVideoModalOpen}
        onClose={handleCloseVideoModal}
        storyId={storyid}
        generatedScenes={generatedScenes}
        onVideoComplete={handleVideoGenerationComplete}
        modalMode={videoModalMode}
        onLanguageSelect={handleLanguageSelect}
        videoData={existingVideoData}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteScene}
        isDeleting={isDeleting}
        itemName={`Scene #${sceneToDelete?.scene_order || ''}`}
        itemType="scene"
      />
    </div>
  );
}

export default CreateScenes;