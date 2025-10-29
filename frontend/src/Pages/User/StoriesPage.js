import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// Material UI Icons
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { axiosPrivate } from "../../API's/axios";
import { toast } from "react-toastify";
import "../../Css/StoriesPage.css";
import DeleteConfirmationModal from "../../Components/CommonComponents/DeleteConfirmationModal";

function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Use useRef for interval to avoid stale closures
  const pollingIntervalRef = useRef(null);
  const hasShownToastRef = useRef(new Set()); // Track which stories have shown completion toasts

  // Define the statuses that require polling for auto stories
  const ACTIVE_POLLING_STATUSES = ["started", "in-progress", "generating-characters", "generating-scenes"];
  const COMPLETED_STATUSES = ["completed", "failed", "partially-completed"];

  // Simple Status Badge Component
  const AutoGenerationStatusBadge = ({ status }) => {
    const getStatusInfo = () => {
      switch (status) {
        case "started":
          return { text: "Started", color: "#0ea5e9", bgColor: "#e0f2fe" };
        case "in-progress":
          return { text: "In Progress", color: "#6366f1", bgColor: "#e0e7ff" };
        case "generating-characters":
          return { text: "Generating Characters", color: "#f59e0b", bgColor: "#fef3c7" };
        case "generating-scenes":
          return { text: "Generating Scenes", color: "#8b5cf6", bgColor: "#ede9fe" };
        case "partially-completed":
          return { text: "Partially Completed", color: "#06b6d4", bgColor: "#cffafe" };
        case "completed":
          return { text: "Completed", color: "#10b981", bgColor: "#d1fae5" };
        case "failed":
          return { text: "Failed", color: "#ef4444", bgColor: "#fee2e2" };
        default:
          return { text: "Unknown", color: "#6b7280", bgColor: "#f3f4f6" };
      }
    };

    const statusInfo = getStatusInfo();
    if (!statusInfo) return null;

    return (
      <div
        className="auto-status-badge"
        style={{
          backgroundColor: statusInfo.bgColor,
          color: statusInfo.color,
          border: `1px solid ${statusInfo.color}30`,
        }}
      >
        {statusInfo.text}
      </div>
    );
  };

  // Fetch all stories from API
  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosPrivate.get("/get-all-story");
      console.log("API Response:", response.data);

      if (response.data.success) {
        const fetchedStories = response.data.stories || [];
        
        // Process stories to ensure proper structure
        const processedStories = fetchedStories.map(story => ({
          ...story,
          characterCount: story.characterCount || 0,
          sceneCount: story.sceneCount || 0,
          // For auto stories, track generated scenes
          ...(story.type === "auto" && {
            generated_scenes: story.generated_scenes || 0,
            total_scenes: story.total_scenes || 0
          })
        }));

        setStories(processedStories);
        console.log("Processed stories:", processedStories);
        
        // Log auto stories and their statuses for debugging
        const autoStories = processedStories.filter(s => s.type === "auto");
        if (autoStories.length > 0) {
          console.log("Auto stories status:", autoStories.map(s => `${s.name}: ${s.status}`));
        }
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
      setError("Failed to load stories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Refresh stories status using the same API
  const refreshStoriesStatus = async () => {
    try {
      console.log("🔄 Refreshing stories status...");
      const response = await axiosPrivate.get("/get-all-story");
      
      if (response.data.success) {
        const updatedStories = response.data.stories || [];
        
        // Log current auto stories status
        const autoStories = updatedStories.filter(s => s.type === "auto");
        console.log("Status refresh - auto stories:", autoStories.map(s => `${s.name}: ${s.status}`));
        
        // Update stories and check for status changes
        setStories(prevStories => {
          return updatedStories.map(updatedStory => {
            const prevStory = prevStories.find(s => s.id === updatedStory.id);
            
            // Show toast for status changes - only for auto stories
            if (updatedStory.type === "auto" && prevStory && prevStory.status !== updatedStory.status) {
              const toastKey = `${updatedStory.id}-${updatedStory.status}`;
              
              if (!hasShownToastRef.current.has(toastKey)) {
                if (updatedStory.status === "completed") {
                  toast.success(`🎉 "${updatedStory.name}" generation completed!`);
                  hasShownToastRef.current.add(toastKey);
                } else if (updatedStory.status === "failed") {
                  toast.error(`❌ "${updatedStory.name}" generation failed.`);
                  hasShownToastRef.current.add(toastKey);
                } else if (updatedStory.status === "partially-completed") {
                  toast.success(`✅ "${updatedStory.name}" partially completed!`);
                  hasShownToastRef.current.add(toastKey);
                }
              }
            }
            
            return {
              ...updatedStory,
              characterCount: updatedStory.characterCount || 0,
              sceneCount: updatedStory.sceneCount || 0,
              // For auto stories, also track generated scenes
              ...(updatedStory.type === "auto" && {
                generated_scenes: updatedStory.generated_scenes || 0,
                total_scenes: updatedStory.total_scenes || 0
              })
            };
          });
        });
      }
    } catch (error) {
      console.error('❌ Error refreshing stories status:', error);
    }
  };

  // MAIN POLLING LOGIC: Start/stop polling based on auto stories status
  useEffect(() => {
    // Find auto stories that need active polling
    const activeAutoStories = stories.filter(story => 
      story.type === "auto" && ACTIVE_POLLING_STATUSES.includes(story.status)
    );

    const hasActiveAutoStories = activeAutoStories.length > 0;

    console.log("🔍 Checking for active auto stories:", activeAutoStories.map(s => `${s.name} (${s.status})`));

    if (hasActiveAutoStories) {
      // Start polling if not already running
      if (!pollingIntervalRef.current) {
        console.log("🚀 Starting polling for active auto stories...");
        console.log("Active stories:", activeAutoStories.map(s => `${s.name} (${s.status})`));
        
        // Start polling every 5 seconds as per your requirement
        pollingIntervalRef.current = setInterval(refreshStoriesStatus, 5000);
        
        // // Do an immediate refresh when starting polling (except on initial load)
        // if (!isInitialLoad) {
        //   refreshStoriesStatus();
        // }
      }
    } else {
      // Stop polling if no active auto stories
      if (pollingIntervalRef.current) {
        console.log("🛑 Stopping polling - no active auto stories");
        const allAutoStories = stories.filter(s => s.type === "auto");
        if (allAutoStories.length > 0) {
          console.log("All auto stories status:", allAutoStories.map(s => `${s.name}: ${s.status}`));
        }
        
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Mark as no longer initial load after first check
    setIsInitialLoad(false);

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        console.log("🧹 Cleaning up polling interval");
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [stories, isInitialLoad]);

  // Initial fetch and handle navigation state
  useEffect(() => {
    const initializeStoriesPage = async () => {
      console.log("🚀 Initializing Stories Page...");
      await fetchStories();

      // Handle newly created auto story from navigation state
      const navigationState = location.state;
      if (navigationState?.newAutoStoryId && navigationState?.justCreated) {
        console.log("✨ New auto story created with ID:", navigationState.newAutoStoryId);
        
        if (navigationState.message) {
          toast.success(navigationState.message);
        }

        // Clear the navigation state
        setTimeout(() => {
          navigate(location.pathname, { replace: true, state: {} });
        }, 1000);
      }
    };

    initializeStoriesPage();

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        console.log("🧹 Component unmounting - cleaning up polling");
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency array for initial load only

  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
    });
  };

  const handleDeleteClick = (story) => {
    setStoryToDelete(story);
    setShowDeleteModal(true);
  };

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
        toast.success("Story deleted successfully");
        setStories(stories.filter((story) => story.id !== storyToDelete.id));
        handleCloseDeleteModal();
      } else {
        toast.error("Failed to delete story. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting story:", err);
      toast.error("Failed to delete story. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStoryScenes = (story) => {
    navigate(`/u/scenes/create/${story.id}`);
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
          <div className="loading-state" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 1rem", color: "#718096" }}>
            <p>Loading your stories...</p>
          </div>
        </div>
      </div>
    );
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
          <div className="error-state" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 1rem", color: "#e53e3e" }}>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => fetchStories()} style={{ marginTop: "1rem" }}>
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
              <p className="create-subtitle">Start your next creative adventure</p>
            </div>
          </div>
        </Link>

        {/* Story Cards */}
        {stories.map((story) => (
          <div key={story.id} className="story-card" onClick={() => handleStoryScenes(story)}>
            {/* Status Badge - ONLY for auto stories */}
            {story.type === "auto" && story.status && (
              <AutoGenerationStatusBadge status={story.status} />
            )}

            <div className="story-image">
              {story.thumbnail ? (
                <img
                  src={story.thumbnail}
                  alt={story.name || "Story thumbnail"}
                  className="story-thumbnail"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
              ) : null}
              <div className="story-overlay" style={{ display: story.thumbnail ? "none" : "block" }}></div>
            </div>
            
            <div className="story-header">
              <h3 title="story title" className="story-title">
                {story.name || "Untitled Story"}
              </h3>
              <p title="story description" className="story-description">
                {story.description || "No description available"}
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
                  <span>
                    {story.type === "auto" 
                      ? (story.generated_scenes || 0)
                      : (story.sceneCount || 0)
                    } scenes
                  </span>
                </div>
                {/* Auto-generate badge - ONLY for auto stories */}
                {story.type === "auto" && (
                  <div className="meta-item auto-badge">
                    <span className="auto-icon">⚡</span>
                    <span>Auto-Generated</span>
                  </div>
                )}
              </div>

              <div className="story-footer">
                <div className="story-date">
                  <AccessTimeRoundedIcon className="icon-xs" />
                  <span>{story.createdAt ? formatDate(story.createdAt) : "No date"}</span>
                </div>

                <div className="story-actions">
                  <Link to={`/u/stories/${story.id}/characters`} className="link-unstyled" onClick={(e) => e.stopPropagation()}>
                    <button className="story-action-btn" title="View characters">
                      <PeopleOutlineIcon className="icon-xs" />
                    </button>
                  </Link>
                  <Link to={`/u/scenes/create/${story.id}`} className="link-unstyled" onClick={(e) => e.stopPropagation()}>
                    <button className="story-action-btn" title="View Story">
                      <VisibilityOutlinedIcon className="icon-xs" />
                    </button>
                  </Link>
                  
                  {/* Edit Button - Disabled during active auto generation */}
                  {story.type === "auto" && ACTIVE_POLLING_STATUSES.includes(story.status) ? (
                    <button className="story-action-btn disabled" title="Edit not available during generation" disabled>
                      <EditOutlinedIcon className="icon-xs" />
                    </button>
                  ) : (
                    <Link to={`/u/stories/edit/${story.id}`} className="link-unstyled" onClick={(e) => e.stopPropagation()}>
                      <button className="story-action-btn" title="Edit Story">
                        <EditOutlinedIcon className="icon-xs" />
                      </button>
                    </Link>
                  )}
                  
                  {/* Delete Button - Disabled during active auto generation */}
                  {story.type === "auto" && ACTIVE_POLLING_STATUSES.includes(story.status) ? (
                    <button className="story-action-btn action-danger disabled" title="Delete not available during generation" disabled>
                      <DeleteOutlineIcon className="icon-xs" />
                    </button>
                  ) : (
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
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && stories.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <AutoStoriesRoundedIcon className="icon-xxl" />
          </div>
          <h3 className="empty-title">No stories yet</h3>
          <p className="empty-subtitle">Create your first AI-generated story to get started</p>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        itemName={storyToDelete?.name}
        itemType="story"
      />
    </div>
  );
}

export default StoriesPage;