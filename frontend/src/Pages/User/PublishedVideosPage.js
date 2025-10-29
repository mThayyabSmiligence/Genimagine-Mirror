import React, { useEffect, useState } from "react";
import { axiosPrivate } from "../../API's/axios";
import { toast } from "react-toastify";
import VideoCard from "../../Components/Explore/VideoCard";
import ExploreVideoPlayerModal from "../../Components/CommonComponents/ExploreVideoPlayerModal";
import "../../Css/PublishedVideosPage.css";

function PublishedVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user's published videos
  const fetchUserVideos = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/published-videos");

      if (response.data.success) {
        setVideos(response.data.videos);
      }
    } catch (error) {
      console.error("Error fetching user videos:", error);
      toast.error("Failed to fetch your videos");
    } finally {
      setLoading(false);
    }
  };

  // Delete a video
  const handleDeleteVideo = async (videoId, e) => {
    e.stopPropagation(); // Prevent card click

    if (!window.confirm("Are you sure you want to unpublish this video?")) {
      return;
    }

    try {
      const response = await axiosPrivate.delete(`/published-videos/${videoId}`);

      if (response.data.success) {
        toast.success("Video unpublished successfully");
        // Remove from state
        setVideos(videos.filter((v) => v.id !== videoId));
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error(error.response?.data?.message || "Failed to unpublish video");
    }
  };

  const handleVideoPlay = (video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVideo(null), 300);
  };

  useEffect(() => {
    fetchUserVideos();
  }, []);

  return (
    <div className="mt-5 published-videos-page-container">
      <div className="published-videos-header-section">
        <div className="published-videos-heading text-start">
          <h1>My Published Videos</h1>
          <p className="published-videos-subtitle">
            Manage and view your published videos
          </p>
        </div>
      </div>

      <div className="published-videos-body">
        {loading ? (
          <div className="text-center my-4">
            <p>Loading your videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
            </div>
            <h3 className="empty-state-title">No Published Videos</h3>
            <p className="empty-state-description">
              You haven't published any videos yet. Create and publish your first video!
            </p>
          </div>
        ) : (
          <div className="published-videos-container">
            <div className="published-videos-grid">
              {videos.map((video, index) => (
                <div key={`${video.id}-${index}`} className="published-video-item">
                  <VideoCard video={video} onPlay={handleVideoPlay} />
                  
                  {/* Delete Button Overlay */}
                  <button
                    className="published-video-delete-btn"
                    onClick={(e) => handleDeleteVideo(video.id, e)}
                    title="Unpublish video"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <ExploreVideoPlayerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        video={selectedVideo}
      />
    </div>
  );
}

export default PublishedVideosPage;