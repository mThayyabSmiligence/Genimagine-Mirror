import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { axiosPrivate } from '../../API\'s/axios';

// Material UI Icons
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import '../../Css/CreateScenes.css';

// Base API URL - Update this according to your environment
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function CreateScenes() {
  const [generatedScenes, setGeneratedScenes] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { storyid } = useParams(); 

  // Fetch existing scenes when component loads
  useEffect(() => {
    fetchExistingScenes();
  }, [storyid]);

 const fetchExistingScenes = async () => {
  try {
      setIsLoading(true);
      // Updated endpoint to use query parameters
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
          scene_order: scene.scene_order
        }));
        setGeneratedScenes(formattedScenes);
      }
    } catch (error) {
      console.error('Error fetching existing scenes:', error);
      // Set empty array if there's an error or no scenes exist yet
      setGeneratedScenes([]);
    } finally {
      setIsLoading(false);
    }
  };


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
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
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
      // API call to generate scene
      const response = await axiosPrivate.post(`/scenes/generate`, {
        story_id: parseInt(storyid),
        prompt: prompt.trim()
      });
      
      if (response.data.success) {
        const newScene = response.data.scene;
        
        // Format the scene data to match component structure
        const formattedScene = {
          id: newScene.id,
          prompt: newScene.prompt,
          image_url: newScene.image_url,
          characters: newScene.characters ? newScene.characters.map(char => char.name) : [],
          timestamp: "Just now",
          location: newScene.location,
          environment: newScene.environment,
          scene_order: newScene.scene_order
        };
        
        // Add the new scene to the beginning of the list
        setGeneratedScenes(prev => [formattedScene, ...prev]);
        showToast("Scene generated successfully!");
        setPrompt(""); // Clear the prompt
      } else {
        showToast("Failed to generate scene", 'error');
      }
    } catch (error) {
      console.error('Error generating scene:', error);
      
      // Handle different types of errors
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

  const handleDeleteScene = async (sceneId) => {
  try {
    const response = await axiosPrivate.post('/scenes/delete', {
      scene_id: sceneId
    });
    
    if (response.data.success) {
      setGeneratedScenes(prev => prev.filter(scene => scene.id !== sceneId));
      showToast("Scene deleted successfully!");
    } else {
      showToast(response.data.message || "Failed to delete scene", 'error');
    }
  } catch (error) {
    console.error('Error deleting scene:', error);
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
      
      // Clean up the object URL
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

      {/* Scene Generation Panel */}
      <div className="scene-generation-section">
        <div className="prompt-card">
          <div className="scene-card-header d-flex flex-column">
            <h2 className="scene-card-title">
              <AutoFixHighIcon className="icon-sm" />
              Scene Description
            </h2>
            <p className="scene-card-description text-start">
              Describe the scene you want to generate
            </p>
          </div>
          
          <div className="card-content">
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
              
              <Link to={`/u/stories/${storyid}/characters`} className="link-unstyled">
                <button className="btn-outline">
                  <AddRoundedIcon className="icon-sm" />
                  Manage Characters
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scene Tips */}
        <div className="tips-card">
          <div 
            className="scene-card-header tips-header" 
            onClick={toggleTips}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTips();
              }
            }}
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
      </div>

      {/* Generated Scenes Timeline */}
      <div className="scenes-timeline">
        {generatedScenes.map((scene, index) => (
          <div key={scene.id} className="scene-card">
            <div className="scene-content">
              {/* Prompt Section */}
              <div className="scene-prompt-section">
                <div className="prompt-header">
                  <h4 className="prompt-title">Scene #{scene.scene_order || generatedScenes.length - index}</h4>
                  <span className="prompt-timestamp">{scene.timestamp}</span>
                </div>
                <p className="prompt-text">{scene.prompt}</p>
                
                {/* Environment and Location Info */}
                {scene.environment && (
                  <div className="scene-details">
                    <p className="scene-environment">
                      <strong>Environment:</strong> {scene.environment}
                    </p>
                  </div>
                )}
                
                {scene.characters.length > 0 && (
                  <div className="prompt-characters">
                    <PeopleOutlineIcon className="icon-xs" />
                    <span className="characters-text">
                      Characters: {scene.characters.join(", ")}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Generated Image Section */}
              <div className="scene-image-section">
                <h5 className="image-title">Generated Scene</h5>
                <div className="scene-image-container">
                  {scene.image_url ? (
                    <div className="scene-image-wrapper">
                      <img 
                        src={scene.image_url} 
                        alt={`Generated scene: ${scene.prompt}`}
                        className="scene-image"
                        onError={(e) => {
                          e.target.src = '/path/to/fallback-image.png'; // Add a fallback image
                        }}
                      />
                      <div className="image-actions">
                        <button 
                          className="image-action-btn" 
                          title="Download Scene"
                          onClick={() => downloadImage(scene.image_url, `scene_${scene.id}`)}
                        >
                          <DownloadIcon className="icon-xs" />
                        </button>
                        <button 
                          className="image-action-btn action-danger" 
                          title="Delete Scene"
                          onClick={() => handleDeleteScene(scene.id)}
                        >
                          <DeleteOutlineIcon className="icon-xs" />
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
          </div>
        ))}
        
        {/* Empty State */}
        {generatedScenes.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-icon">
              <ImageOutlinedIcon className="icon-xxl" />
            </div>
            <h3 className="empty-title">No scenes generated yet</h3>
            <p className="empty-subtitle">Create your first scene using the prompt above</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateScenes;
