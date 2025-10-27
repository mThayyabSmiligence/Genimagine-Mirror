import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "../../Css/ExploreVideoPlayerModal.css";

const ExploreVideoPlayerModal = ({ isOpen, onClose, video }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && videoRef.current && !playerRef.current) {
      // Initialize Video.js player
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: true,
        preload: "auto",
        fluid: true,
        responsive: true,
        aspectRatio: "16:9",
        playbackRates: [0.5, 1, 1.5, 2],
        controlBar: {
          volumePanel: {
            inline: false,
          },
        },
      });

      // Set video source
      playerRef.current.src({
        src: video?.video_url,
        type: "video/mp4",
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [isOpen, video]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="explore-video-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="explore-video-modal-content">
        {/* Close button */}
        <button
          className="explore-video-modal-close"
          onClick={handleClose}
          aria-label="Close"
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
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Video player */}
        <div className="explore-video-player-wrapper">
          <div data-vjs-player>
            <video
              ref={videoRef}
              className="video-js vjs-big-play-centered"
              playsInline
              poster={video?.thumbnail}
            />
          </div>
        </div>

        {/* Video info */}
        {video?.title && (
          <div className="explore-video-info">
            <h2 className="explore-video-title">{video.title}</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreVideoPlayerModal;
