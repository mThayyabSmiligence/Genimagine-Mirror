// src/pages/ModuleDetailPage.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SAMPLE_MODULES } from "./ContentModules";
import '../../Css/ModuleDetailPage.css'

function ModuleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const moduleId = Number(id);
  const module = SAMPLE_MODULES.find((m) => m.id === moduleId);

  const [viewMode, setViewMode] = useState("images");
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!module) {
    return (
      <div className="modules-page-container">
        {/* <button
          className="back-icon-btn"
          style={{ marginBottom: 16 }}
          onClick={() => navigate("/u/content-modules")}
        >
          ←
        </button> */}
        <p>Module not found.</p>
      </div>
    );
  }

  const hasImages = Array.isArray(module.images) && module.images.length > 0;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % module.images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + module.images.length) % module.images.length);
  };

  return (
    <div className="detail-page-root">
      {/* top header bar, full width */}
      <div className="detail-header-bar mt-5">
        <div className="detail-header-inner">
          <div className="detail-header-left">
            <button
              className="back-icon-btn"
              onClick={() => navigate(-1)}
            >
              ←
            </button>
            <h1 className="detail-title">{module.title}</h1>
          </div>

          <div className="detail-header-right">
            <div className="module-view-toggle">
              {hasImages && (
                <button
                  className={
                    "toggle-btn" + (viewMode === "images" ? " active" : "")
                  }
                  onClick={() => setViewMode("images")}
                >
                  Slides
                </button>
              )}
              {module.videoUrl && (
                <button
                  className={
                    "toggle-btn" + (viewMode === "video" ? " active" : "")
                  }
                  onClick={() => setViewMode("video")}
                >
                  Video
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* light gray background like lovable */}
      <main className="detail-main">
        {/* center card for media */}
        <div className="detail-media-card">
          <div className="module-media-shell detail-media-shell">
            {viewMode === "images" && hasImages ? (
              <div className="module-slide-item detail-slide-wrapper">
                <img
                  src={module.images[currentSlide]}
                  alt={`Slide ${currentSlide + 1}`}
                  className="detail-slide-img"
                />

                {module.images.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="detail-nav-btn detail-nav-left"
                    >
                      <span>‹</span>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="detail-nav-btn detail-nav-right"
                    >
                      ›
                    </button>
                  </>
                )}

                <div className="detail-slide-counter">
                  {currentSlide + 1} / {module.images.length}
                </div>
              </div>
            ) : (
              module.videoUrl && (
                <div className="module-video-wrapper detail-video-wrapper">
                  <video
                    src={module.videoUrl}
                    controls
                    autoPlay
                    className="module-video-player detail-video-player"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ModuleDetailPage;
