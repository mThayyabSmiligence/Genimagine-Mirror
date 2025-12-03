// src/components/ModuleViewer.jsx
import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import Slider from "react-slick";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../Css/ContentModules.css";

export const ModuleViewer = ({ module, onClose }) => {
  const [viewMode, setViewMode] = useState("images"); // "images" | "video"
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!module) return;

    if (viewMode === "video" && videoRef.current && !playerRef.current && module.videoUrl) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: true,
        preload: "auto",
        // remove responsive + fluid, size is handled by CSS
        sources: [
          {
            src: module.videoUrl,
            type: "video/mp4",
          },
        ],
      });
    }

    if (viewMode === "images" && playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [viewMode, module]);

  const sliderSettings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const hasImages = Array.isArray(module.images) && module.images.length > 0;

  return (
    <Modal
      isOpen={!!module}
      onRequestClose={onClose}
      className="module-modal"
      overlayClassName="module-modal-overlay"
    >
      <div className="module-modal-header">
        <h2 className="module-modal-title">{module.title}</h2>

        <div className="module-modal-header-right">
          <div className="module-view-toggle">
            {hasImages && (
              <button
                className={"toggle-btn" + (viewMode === "images" ? " active" : "")}
                onClick={() => setViewMode("images")}
              >
                Slides
              </button>
            )}
            {module.videoUrl && (
              <button
                className={"toggle-btn" + (viewMode === "video" ? " active" : "")}
                onClick={() => setViewMode("video")}
              >
                Video
              </button>
            )}
          </div>
          <button className="module-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className="module-modal-body">
        {viewMode === "images" && hasImages ? (
          <div className="module-media-shell">
            <Slider {...sliderSettings}>
              {module.images.map((img, index) => (
                <div key={index} className="module-slide-item">
                  <img src={img} alt={`Slide ${index + 1}`} />
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          module.videoUrl && (
            <div className="module-video-wrapper">
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered module-video-player"
                playsInline
              />
            </div>
          )
        )}
      </div>
    </Modal>
  );
};
