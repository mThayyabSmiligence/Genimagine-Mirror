import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Material UI Icons
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import '../../Css/StoriesPage.css';

const mockStories = [
  {
    id: 1,
    title: "The Enchanted Kingdom",
    description: "A magical adventure through mystical lands filled with dragons and ancient secrets.",
    characters: 5,
    scenes: 12,
    createdAt: "2024-01-15",
    // status: "In Progress",
    image: "/lovable-uploads/15b38244-0823-4576-bfe7-bf7106f9a346.png"
  },
  {
    id: 2,
    title: "Cyberpunk Detective",
    description: "A noir mystery set in a dystopian future where technology and humanity collide.",
    characters: 3,
    scenes: 8,
    createdAt: "2024-01-10",
    // status: "Complete",
    image: "/lovable-uploads/15b38244-0823-4576-bfe7-bf7106f9a346.png"
  },
  {
    id: 3,
    title: "Space Pirates",
    description: "Swashbuckling adventures across the galaxy with unlikely heroes.",
    characters: 7,
    scenes: 15,
    createdAt: "2024-01-08",
    // status: "Draft",
    image: "/lovable-uploads/15b38244-0823-4576-bfe7-bf7106f9a346.png"
  }
];

function StoriesPage() {
  
    const [stories] = useState(mockStories);

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

        {/* Story Cards */}
        {stories.map((story) => (
          <div key={story.id} className="story-card">
            <div className="story-image">
              <div className="story-overlay"></div>
              {/* <span className={`status-badge ${story.status === "Complete" ? 'status-complete' : 'status-default'}`}>
                {story.status}
              </span> */}
            </div>
            
            <div className="story-header">
              <h3 className="story-title">{story.title}</h3>
              <p className="story-description">{story.description}</p>
            </div>
            
            <div className="story-body">
              <div className="story-meta">
                <div className="meta-item">
                  <PeopleOutlineIcon className="icon-xs" />
                  <span>{story.characters} characters</span>
                </div>
                <div className="meta-item">
                  <AutoStoriesRoundedIcon className="icon-xs" />
                  <span>{story.scenes} scenes</span>
                </div>
              </div>
              
              <div className="story-footer">
                <div className="story-date">
                  <AccessTimeRoundedIcon className="icon-xs" />
                  <span>{story.createdAt}</span>
                </div>
                
                <div className="story-actions">
                  <button className="action-btn" title="View Story">
                    <VisibilityOutlinedIcon className="icon-xs" />
                  </button>
                  {/* <button className="action-btn" title="Edit Story">
                    <EditOutlinedIcon className="icon-xs" />
                  </button> */}
                  <button className="action-btn action-danger" title="Delete Story">
                    <DeleteOutlineIcon className="icon-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {stories.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <AutoStoriesRoundedIcon className="icon-xxl" />
          </div>
          <h3 className="empty-title">No stories yet</h3>
          <p className="empty-subtitle">
            Create your first AI-generated story to get started
          </p>
          <Link to="/stories/create">
            <button className="btn-primary btn-large">
              Create Your First Story
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default StoriesPage