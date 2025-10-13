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

function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Use useRef for interval and toast flags to avoid stale closures
  const pollingIntervalRef = useRef(null);
  const hasShownToastRef = useRef(new Set()); // Track which stories have shown completion toasts

  // Simple Status Badge Component
  const AutoGenerationStatusBadge = ({ status }) => {
    const getStatusInfo = () => {
      switch (status) {
        case "started":
          return {
            text: "Started",
            color: "#0ea5e9",
            bgColor: "#e0f2fe",
          };
        case "in-progress":
          return {
            text: "In Progress",
            color: "#6366f1",
            bgColor: "#e0e7ff",
          };
        case "generating-characters":
          return {
            text: "Generating Characters",
            color: "#f59e0b",
            bgColor: "#fef3c7",
          };
        case "generating-scenes":
          return {
            text: "Generating Scenes",
            color: "#8b5cf6",
            bgColor: "#ede9fe",
          };
        case "partially-completed":
          return {
            text: "Partially Completed",
            color: "#06b6d4",
            bgColor: "#cffafe",
          };
        case "completed":
          return {
            text: "Completed",
            color: "#10b981",
            bgColor: "#d1fae5",
          };
        case "failed":
          return {
            text: "Failed",
            color: "#ef4444",
            bgColor: "#fee2e2",
          };
        default:
          return {
            text: "Unknown",
            color: "#6b7280",
            bgColor: "#f3f4f6",
          };
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

  // Fetch stories from API
  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosPrivate.get("/get-all-story");

      console.log("API Response:", response);
      console.log("Response Data:", response.data);

      let fetchedStories = response.data.stories || [];

      // For auto stories, fetch their current status
      const storiesWithStatus = await Promise.all(
        fetchedStories.map(async (story) => {
          // Check if story type is "auto"
          if (story.type === "auto") {
            try {
              // Get current status for auto stories
              const statusResponse = await axiosPrivate.get(
                `/story/${story.id}/status`
              );

              if (statusResponse.data.success) {
                const statusData = statusResponse.data.data;
                console.log(`Auto story "${story.name}" status:`, statusData);

                return {
                  ...story,
                  status: statusData.status,
                  generated_scenes: statusData.generated_scenes,
                  total_scenes: statusData.total_scenes,
                  characters: statusData.characters,
                  // Set counts from status API for auto stories
                  characterCount: statusData.characters || story.characterCount || 0,
                  sceneCount: statusData.generated_scenes || story.sceneCount || 0
                };
              }
            } catch (error) {
              console.error(
                `Error fetching status for story ${story.id}:`,
                error
              );
            }
          }

          // Return original story (for manual stories or if status fetch fails)
          return story;
        })
      );

      setStories(storiesWithStatus);
    } catch (err) {
      console.error("Error fetching stories:", err);
      setError("Failed to load stories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Polling function to update auto story statuses and counts
  const pollAutoGeneratedStories = async () => {
    try {
      // Get current stories from state using a ref to avoid stale closure
      const currentStories = storiesRef.current;
      
      // Filter stories that have type === 'auto' and are not completed or failed
      const autoStories = currentStories.filter(
        (story) =>
          story.type === "auto" &&
          story.status &&
          !["completed", "failed"].includes(story.status)
      );

      if (autoStories.length === 0) {
        // No auto stories to poll, stop polling
        if (pollingIntervalRef.current) {
          console.log("No auto stories to poll, stopping interval");
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }

      console.log(`Polling ${autoStories.length} auto stories:`, autoStories.map(s => s.name));

      // Poll each auto-generated story
      const promises = autoStories.map(async (story) => {
        try {
          const response = await axiosPrivate.get(
            `/story/${story.id}/status`
          );

          if (response.data.success) {
            const statusData = response.data.data;
            console.log(`Status update for "${story.name}":`, statusData);

            return {
              id: story.id,
              status: statusData.status,
              generated_scenes: statusData.generated_scenes,
              total_scenes: statusData.total_scenes,
              characters: statusData.characters,
              // Map status API data to story meta counts
              characterCount: statusData.characters || story.characterCount || 0,
              sceneCount: statusData.generated_scenes || story.sceneCount || 0
            };
          }
        } catch (error) {
          console.error(`Error polling story ${story.id}:`, error);
          return null;
        }
        return null;
      });

      const results = await Promise.all(promises);

      // Update stories with new status data
      const validResults = results.filter((result) => result !== null);

      if (validResults.length > 0) {
        setStories((prev) =>
          prev.map((story) => {
            const update = validResults.find((r) => r.id === story.id);
            if (update) {
              // Show completion toast only once per story
              const toastKey = `${story.id}-${update.status}`;
              
              if (update.status === "completed" && story.status !== "completed" && !hasShownToastRef.current.has(toastKey)) {
                toast.success(`🎉 "${story.name}" generation completed!`);
                hasShownToastRef.current.add(toastKey);
              } else if (update.status === "failed" && story.status !== "failed" && !hasShownToastRef.current.has(toastKey)) {
                toast.error(`❌ "${story.name}" generation failed.`);
                hasShownToastRef.current.add(toastKey);
              }
              
              return { 
                ...story, 
                ...update,
                // Ensure the counts are updated for auto stories
                characterCount: update.characterCount,
                sceneCount: update.sceneCount
              };
            }
            return story;
          })
        );
      }
    } catch (error) {
      console.error('Error during polling:', error);
    }
  };

  // Use ref to store current stories to avoid stale closure in polling
  const storiesRef = useRef(stories);
  useEffect(() => {
    storiesRef.current = stories;
  }, [stories]);

  // Start/stop polling based on auto stories
  useEffect(() => {
    const hasActiveAutoStories = stories.some(
      (story) =>
        story.type === "auto" &&
        story.status &&
        !["completed", "failed"].includes(story.status)
    );

    if (hasActiveAutoStories) {
      // Start polling if not already started
      if (!pollingIntervalRef.current) {
        console.log("🚀 Starting status polling every 5 seconds...");
        pollingIntervalRef.current = setInterval(pollAutoGeneratedStories, 5000);
        
        // Also poll immediately
        pollAutoGeneratedStories();
      }
    } else {
      // Stop polling if no active auto stories
      if (pollingIntervalRef.current) {
        console.log("🛑 Stopping status polling...");
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [stories]); // Only depend on stories

  // Initial fetch and handle navigation state
  useEffect(() => {
    const initializeStoriesPage = async () => {
      await fetchStories();

      // Handle newly created auto story from navigation state
      const navigationState = location.state;
      if (navigationState?.newAutoStory && navigationState?.justCreated) {
        console.log(
          "Adding new auto story from navigation:",
          navigationState.newAutoStory
        );
        // Add the new story to the beginning of the list
        setStories((prev) => {
          // Check if story already exists to avoid duplicates
          const exists = prev.some(
            (story) => story.id === navigationState.newAutoStory.id
          );
          if (!exists) {
            return [navigationState.newAutoStory, ...prev];
          }
          return prev;
        });

        // Clear the navigation state
        navigate(location.pathname, { replace: true, state: {} });
      }
    };

    initializeStoriesPage();

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
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
      const response = await axiosPrivate.post(
        `/delete-story/${storyToDelete.id}`
      );
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
          <div
            className="loading-state"
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "4rem 1rem",
              color: "#718096",
            }}
          >
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
          <div
            className="error-state"
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "4rem 1rem",
              color: "#e53e3e",
            }}
          >
            <p>{error}</p>
            <button
              className="btn-primary"
              onClick={() => fetchStories()}
              style={{ marginTop: "1rem" }}
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
          <div
            key={story.id}
            className="story-card"
            onClick={() => handleStoryScenes(story)}
          >
            {/* Status Badge - ONLY for stories with type === 'auto' */}
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
                    // Fallback to default overlay if image fails to load
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
              ) : null}
              <div
                className="story-overlay"
                style={{ display: story.thumbnail ? "none" : "block" }}
              ></div>
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
                  <span>
                    {story.type === "auto" 
                      ? (story.characters || story.characterCount || 0)
                      : (story.characterCount || 0)
                    } characters
                  </span>
                </div>
                <div className="meta-item">
                  <AutoStoriesRoundedIcon className="icon-xs" />
                  <span>
                    {story.type === "auto" 
                      ? (story.generated_scenes || story.sceneCount || 0)
                      : (story.sceneCount || 0)
                    } scenes
                  </span>
                </div>
                {/* Auto-generate badge - ONLY for stories with type === 'auto' */}
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
                  <span>
                    {story.createdAt ? formatDate(story.createdAt) : "No date"}
                  </span>
                </div>

                <div className="story-actions">
                  <Link
                    to={`/u/stories/${story.id}/characters`}
                    className="link-unstyled"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="story-action-btn"
                      title="View characters"
                    >
                      <PeopleOutlineIcon className="icon-xs" />
                    </button>
                  </Link>
                  <Link
                    to={`/u/scenes/create/${story.id}`}
                    className="link-unstyled"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="story-action-btn" title="View Story">
                      <VisibilityOutlinedIcon className="icon-xs" />
                    </button>
                  </Link>
                  {/* Edit Button - Enabled for completed, partially-completed, failed auto stories */}
                  {story.type === "auto" && story.status && !["completed", "partially-completed", "failed"].includes(story.status) ? (
                    <button
                      className="story-action-btn disabled"
                      title="Edit not available during generation"
                      disabled
                    >
                      <EditOutlinedIcon className="icon-xs" />
                    </button>
                  ) : (
                    <Link
                      to={`/u/stories/edit/${story.id}`}
                      className="link-unstyled"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="story-action-btn" title="Edit Story">
                        <EditOutlinedIcon className="icon-xs" />
                      </button>
                    </Link>
                  )}
                  
                  {/* Delete Button - Enabled for completed, partially-completed, failed auto stories */}
                  {story.type === "auto" && story.status && !["completed", "partially-completed", "failed"].includes(story.status) ? (
                    <button
                      className="story-action-btn action-danger disabled"
                      title="Delete not available during generation"
                      disabled
                    >
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
          className={`modal fade ${showDeleteModal ? "show" : ""}`}
          onClick={handleCloseDeleteModal}
          style={{ display: showDeleteModal ? "block" : "none" }}
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
                  Are you sure you want to delete{" "}
                  <strong>"{storyToDelete?.name}"</strong>?
                </p>
                <div className="alert alert-warning">
                  <small className="text-dark">
                    <strong>Warning:</strong> This action cannot be undone. All
                    characters, scenes, and content associated with this story
                    will be permanently deleted.
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
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <DeleteOutlineIcon
                        style={{ fontSize: "16px", marginRight: "4px" }}
                      />
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