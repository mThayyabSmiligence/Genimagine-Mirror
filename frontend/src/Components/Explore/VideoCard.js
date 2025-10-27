import React from "react";
import "../../Css/VideoCard.css";

const VideoCard = ({ video, onPlay }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onPlay(video);
  };

  return (
    <div className="video-card-wrapper" onClick={handleClick}>
      {/* Thumbnail Container */}
      <div className="video-card-thumbnail">
        <img
          src={video.thumbnail || 'https://via.placeholder.com/400x300?text=No+Thumbnail'}
          alt={video.title}
          className="video-card-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Thumbnail';
          }}
        />
        
        {/* Overlay with Play Button */}
        <div className="video-card-overlay">
          <div className="video-play-button-wrapper">
            <div className="video-play-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Title */}
      <div className="video-card-content">
        <h3 className="video-card-title">{video.title || 'Untitled'}</h3>
      </div>
    </div>
  );
};

export default VideoCard;
