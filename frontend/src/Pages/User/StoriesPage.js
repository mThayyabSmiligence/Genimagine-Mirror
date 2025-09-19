import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Material UI Icons
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { axiosPrivate } from '../../API\'s/axios';
import { toast } from 'react-toastify';
import '../../Css/StoriesPage.css';


function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  // Fetch stories from API
  useEffect(() => {
  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosPrivate.get('/get-all-story');
      
      // DEBUG: Check what the API actually returns
      console.log('API Response:', response);
      console.log('Response Data:', response.data);
      console.log('Is Array?', Array.isArray(response.data));
      
      // Adjust this based on your actual API response structure
      setStories(response.data.stories || []);
      
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Failed to load stories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  fetchStories();
}, []);


  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (story) => {
    setStoryToDelete(story);
    setShowDeleteModal(true);
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setStoryToDelete(null);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!storyToDelete) return;

    setIsDeleting(true);
    
    try {
      const response = await axiosPrivate.post(`/delete-story/${storyToDelete.id}`);
      if (response.data.success) {
        toast.success('Story deleted successfully');
        setStories(stories.filter(story => story.id !== storyToDelete.id));
        handleCloseDeleteModal();
      } else {
        toast.error('Failed to delete story. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting story:', err);
      toast.error('Failed to delete story. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="stories-container mt-5">
        <div className="stories-header">
          <div className="header-content">
            <h1 className="page-title text-start">Your Stories</h1>
            <p className="page-subtitle text-start">
              Create and manage your AI-generated stories
            </p>
          </div>
          <Link to="/u/stories/create" className="link-unstyled">
            <button className="btn-primary btn-large">
              <AddRoundedIcon className="icon-sm" />
              Create New Story
            </button>
          </Link>
        </div>
        
        <div className="stories-grid">
          <div className="loading-state" style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '4rem 1rem',
            color: '#718096'
          }}>
            <p>Loading your stories...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleStoryScenes = (story) =>{
    navigate(`/u/scenes/create/${story.id}`)
  }

  // Error state
  if (error) {
    return (
      <div className="stories-container mt-5">
        <div className="stories-header">
          <div className="header-content">
            <h1 className="page-title text-start">Your Stories</h1>
            <p className="page-subtitle text-start">
              Create and manage your AI-generated stories
            </p>
          </div>
          <Link to="/u/stories/create" className="link-unstyled">
            <button className="btn-primary btn-large">
              <AddRoundedIcon className="icon-sm" />
              Create New Story
            </button>
          </Link>
        </div>
        
        <div className="stories-grid">
          <div className="error-state" style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '4rem 1rem',
            color: '#e53e3e'
          }}>
            <p>{error}</p>
            <button 
              className="btn-primary" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '1rem' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stories-container mt-5">
      {/* Header */}
      <div className="stories-header">
        <div className="header-content">
          <h1 className="page-title text-start">Your Stories</h1>
          <p className="page-subtitle text-start">
            Create and manage your AI-generated stories
          </p>
        </div>
        <Link to="/u/stories/create" className="link-unstyled">
          <button className="btn-primary btn-large">
            <AddRoundedIcon className="icon-sm" />
            Create New Story
          </button>
        </Link>
      </div>

      {/* Stories Grid */}
      <div className="stories-grid">
        {/* Create New Story Card */}
        <Link to="/u/stories/create" className="link-unstyled">
          <div className="create-card">
            <div className="create-card-content">
              <div className="create-icon">
                <AddRoundedIcon className="icon-lg" />
              </div>
              <h3 className="create-title">Create New Story</h3>
              <p className="create-subtitle">
                Start your next creative adventure
              </p>
            </div>
          </div>
        </Link>

        {/* Story Cards from API */}
        {stories.map((story) => (
          <div key={story.id} className="story-card" onClick={ ()=> handleStoryScenes(story)}>
            <div className="story-image">
              {story.thumbnail ? (
                <img 
                  src={story.thumbnail} 
                  alt={story.name || 'Story thumbnail'} 
                  className="story-thumbnail"
                  onError={(e) => {
                    // Fallback to default overlay if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <div 
                className="story-overlay" 
                style={{ display: story.thumbnail ? 'none' : 'block' }}
              ></div>
            </div>
            <div className="story-header">
              <h3 title='story title' className="story-title">{story.name || 'Untitled Story'}</h3>
              <p title='story description' className="story-description">
                {story.description || 'No description available'}
              </p>
            </div>
            
            <div className="story-body">
              <div className="story-meta">
                <div className="meta-item">
                  <PeopleOutlineIcon className="icon-xs" />
                  <span>{story.characterCount || 0} characters</span>
                </div>
                <div className="meta-item">
                  <AutoStoriesRoundedIcon className="icon-xs" />
                  <span>{story.scenes || 0} scenes</span>
                </div>
              </div>
              
              <div className="story-footer">
                <div className="story-date">
                  <AccessTimeRoundedIcon className="icon-xs" />
                  <span>
                    {story.createdAt ? formatDate(story.createdAt) : 'No date'}
                  </span>
                </div>
                
                <div className="story-actions">
                   <Link to={`/u/stories/${story.id}/characters`} className="link-unstyled" onClick={(e) => e.stopPropagation()}>
                    <button className="story-action-btn" title="View characters">
                       <PeopleOutlineIcon className="icon-xs" />
                    </button>
                  </Link>
                  <Link to={`/u/stories/${story.id}`} className="link-unstyled" onClick={(e) => e.stopPropagation()}>
                    <button className="story-action-btn" title="View Story">
                      <VisibilityOutlinedIcon className="icon-xs" />
                    </button>
                  </Link>
                  <Link to={`/u/stories/${story.id}/edit`} className="link-unstyled" onClick={(e) => e.stopPropagation()}>
                    <button className="story-action-btn" title="Edit Story">
                      <EditOutlinedIcon className="icon-xs" />
                    </button>
                  </Link>
                  <button 
                    className="story-action-btn action-danger" 
                    title="Delete Story"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(story);
                    }}
                  >
                    <DeleteOutlineIcon className="icon-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State - Only show when not loading and no stories */}
      {!loading && stories.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <AutoStoriesRoundedIcon className="icon-xxl" />
          </div>
          <h3 className="empty-title">No stories yet</h3>
          <p className="empty-subtitle">
            Create your first AI-generated story to get started
          </p>
        </div>
      )}

    {showDeleteModal && (
      <div 
        className={`modal fade ${showDeleteModal ? 'show' : ''}`}
        onClick={handleCloseDeleteModal}
        style={{ display: showDeleteModal ? 'block' : 'none' }}
        tabIndex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden={!showDeleteModal}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center">
                <div>
                  <WarningAmberIcon />
                </div>
                <h1 className="modal-title fs-5" id="deleteModalLabel">
                  Delete Story
                </h1>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseDeleteModal}
                aria-label="Close"
                disabled={isDeleting}
              ></button>
            </div>
            
            <div className="modal-body">
              <p className="text-muted mb-3">
                Are you sure you want to delete <strong>"{storyToDelete?.name}"</strong>?
              </p>
              <div className="alert alert-warning">
                <small className="text-dark">
                  <strong>Warning:</strong> This action cannot be undone. All characters, scenes, and content associated with this story will be permanently deleted.
                </small>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <DeleteOutlineIcon style={{ fontSize: '16px', marginRight: '4px' }} />
                    Delete Story
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

export default StoriesPage;
