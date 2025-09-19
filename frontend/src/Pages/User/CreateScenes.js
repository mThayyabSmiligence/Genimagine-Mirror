import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

const mockGeneratedScenes = [
  {
    id: 1,
    prompt: "Aria Shadowheart stands in a mystical forest clearing, bow drawn, facing a massive dragon breathing ethereal fire.",
    image: "/lovable-uploads/15b38244-0823-4576-bfe7-bf7106f9a346.png",
    characters: ["Aria Shadowheart"],
    timestamp: "2 minutes ago"
  },
  {
    id: 2,
    prompt: "Dr. Elena Voss examines glowing evidence in a neon-lit laboratory filled with holographic displays.",
    image: "/lovable-uploads/15b38244-0823-4576-bfe7-bf7106f9a346.png",
    characters: ["Dr. Elena Voss"],
    timestamp: "5 minutes ago"
  }
];

function CreateScenes() {
  const [generatedScenes, setGeneratedScenes] = useState(mockGeneratedScenes);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  const { storyid } = useParams(); 

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

    setIsGenerating(true);
    
    // Simulate API call for scene generation
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Add the new scene to the beginning of the list
    const newScene = {
      id: Date.now(),
      prompt: prompt,
      image: "/lovable-uploads/15b38244-0823-4576-bfe7-bf7106f9a346.png",
      characters: [],
      timestamp: "Just now"
    };
    
    setGeneratedScenes(prev => [newScene, ...prev]);
    showToast("Scene generated successfully!");
    setIsGenerating(false);
    setPrompt("");
  };

  const handleDeleteScene = (sceneId) => {
    setGeneratedScenes(prev => prev.filter(scene => scene.id !== sceneId));
    showToast("Scene deleted successfully!");
  };

  const toggleTips = () => {
    setIsTipsOpen(!isTipsOpen);
  };

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
                  <h4 className="prompt-title">Scene Prompt #{generatedScenes.length - index}</h4>
                  <span className="prompt-timestamp">{scene.timestamp}</span>
                </div>
                <p className="prompt-text">{scene.prompt}</p>
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
                  <div className="scene-image-placeholder">
                    <div className="image-overlay"></div>
                    <div className="image-actions">
                      <button className="image-action-btn" title="Download Scene">
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
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty State */}
        {generatedScenes.length === 0 && (
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
