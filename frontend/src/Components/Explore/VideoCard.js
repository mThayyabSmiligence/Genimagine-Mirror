import React, { useState } from "react";
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import "../../Css/VideoCard.css";
import { axiosNoAUth, axiosPrivate } from "../../API's/axios";
import ReportPopUp from "../CommonComponents/ReportPopUp";
import { useLocation, useNavigate } from "react-router-dom";


const VideoCard = ({ video, onPlay, loggedIn }) => {
  const [showReportPopUp, setShowReportPopUp] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const navigate = useNavigate();
  const location = useLocation()

  const handleClick = (e) => {
    e.preventDefault();
    onPlay(video);
  };

  const handleFlagClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReportPopUp(true);
  };

  const handleReport = async () => {
    try {
      if (!loggedIn) {
        navigate('/login', { state: { from: location }, replace: true });
        return;
      }

      const response = await axiosPrivate.post('/report-video', {
        story_id: video.story_id,
        reason: reportReason || "violence"
      });

      if (response.data.success) {
        console.log("Video reported successfully");
        setReportReason("");
      }
    } catch (error) {
      console.error("Error reporting video:", error);
    }
  };

  return (
    <>
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

          {/* Report Flag Icon Button */}
          {location.pathname !== "/u/published-videos" && (
            <button
              className="video-report-button"
              onClick={handleFlagClick}
              title="Report this video"
              aria-label="Report video"
            >
              <OutlinedFlagIcon sx={{ fontSize: 20 }} />
            </button>
          )}

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

        <div className="video-card-content">
          <h3 className="video-card-title">{video.title || 'Untitled'}</h3>
        </div>
      </div>

      <ReportPopUp
        reportReason={reportReason}
        setReportReason={setReportReason}
        handleReport={handleReport}
        showReportPopUp={showReportPopUp}
        onHide={() => {
          setShowReportPopUp(false);
          setReportReason("");
        }}
      />
    </>
  );
};

export default VideoCard;
