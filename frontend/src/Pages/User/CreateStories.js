import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import '../../Css/CreateStories.css';
// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

function CreateStories() {
   const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const showToast = (message, type = 'success') => {
    // Simple toast implementation - you can replace with your preferred toast library
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

  const handleCreateStory = async () => {
    if (!title.trim()) {
      showToast("Please enter a story title", 'error');
      return;
    }
    
    if (!description.trim()) {
      showToast("Please enter a story description", 'error');
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showToast("Story created successfully!");
    setIsCreating(false);
    
    // Redirect to story editor or characters page
    // navigate(`/stories/${newStoryId}/characters`);
  };

  return (
    <div className="create-story-container mt-5">
      {/* Header */}
      <div className="create-story-header p-relative">
        <Link to="/u/stories" className="link-unstyled position-absolute top-0 start-0">
          <button className="btn-ghost">
            <ArrowBackIcon className="icon-sm" />
          </button>
        </Link>
        <div className="header-text">
          <h1 className="page-title">Create New Story</h1>
          <p className="page-subtitle">
            Start your creative journey with AI-powered storytelling
          </p>
        </div>
      </div>

      {/* Single Card with Two Column Layout */}
      <div className="form-card">
        <div className="card-two-column">
          {/* Left Column - Form */}
          <div className="form-column">
            <div className="card-header d-flex flex-column">
              <h2 className="card-title">
                <AutoFixHighIcon className="icon-sm" />
                Story Details
              </h2>
              <p className="card-description">
                Provide the basic information for your story
              </p>
            </div>
            
            <div className="card-content">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Story Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter your story title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Story Description</label>
                <textarea
                  id="description"
                  placeholder="Describe your story's plot, theme, or setting..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  rows="5"
                />
                <p className="form-help">
                  This will help the AI understand your story's context
                </p>
              </div>

              <div className="button-group">
                <button
                  onClick={handleCreateStory}
                  disabled={isCreating}
                  className="btn-primary btn-large justify-content-center"
                >
                  {isCreating ? (
                    <>
                      <div className="loading-spinner"></div>
                      Creating Story...
                    </>
                  ) : (
                    <>
                      <AutoFixHighIcon className="icon-sm" />
                      Create Story
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="preview-column">
            <div className="card-header  d-flex flex-column">
              <h2 className="card-title">
                <VisibilityOutlinedIcon className="icon-sm" />
                Preview
              </h2>
              <p className="card-description">
                See how your story will appear
              </p>
            </div>
            
            <div className="card-content">
              {title || description ? (
                <div className="preview-content">
                  <div className="preview-story">
                    <h3 className="preview-title">
                      {title || "Your Story Title"}
                    </h3>
                    <p className="preview-description">
                      {description || "Your story description will appear here..."}
                    </p>
                  </div>
                  
                  <div className="preview-stats">
                    <div className="stat-card">
                      <div className="stat-number">0</div>
                      <div className="stat-label">Characters</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">0</div>
                      <div className="stat-label">Scenes</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="preview-empty">
                  <AutoFixHighIcon className="empty-icon" />
                  <p>Preview will appear here as you type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Info */}
      <div className="info-card">
        <div className="info-content">
          <h3 className="info-title">What happens next?</h3>
          <p className="info-description">
            After creating your story, you'll be able to:
          </p>
          <ul className="info-list">
            <li>• Create and customize characters with AI assistance</li>
            <li>• Generate scenes using your characters</li>
            <li>• Edit and refine your story elements</li>
            <li>• Export your completed story</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CreateStories
