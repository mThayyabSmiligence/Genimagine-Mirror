import React, { useEffect, useState } from "react";
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import "../../Css/VideoCard.css";
import { axiosNoAUth, axiosPrivate } from "../../API's/axios";
import ReportPopUp from "../CommonComponents/ReportPopUp";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const VideoCard = ({ video, onPlay, loggedIn }) => {
  const [showReportPopUp, setShowReportPopUp] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReported, setIsReported] = useState(video.isUserReported || false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsReported(video.isUserReported || false);
  }, [video.isUserReported]);


  const handleClick = (e) => {
    e.preventDefault();
    onPlay(video);
  };

  const handleFlagClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isReported) {
      toast.info("You have already reported this video");
      return;
    }
    
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
        reason: reportReason
      });

      if (response.data.success) {
        toast.success("Video reported successfully");
        setIsReported(true);
        setReportReason("");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info("You have already reported this video");
        setIsReported(true);
      } else {
        toast.error("Failed to report video. Please try again.");
      }
      console.error("Error reporting video:", error);
    }
  };

  return (
    <>
      <div className="video-card-wrapper" onClick={handleClick}>
        <div className="video-card-thumbnail">
          <img
            src={video.thumbnail || 'https://via.placeholder.com/400x300?text=No+Thumbnail'}
            alt={video.title}
            className="video-card-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Thumbnail';
            }}
          />

          {location.pathname !== "/u/published-videos" && (
            <button
              className={`video-report-button ${isReported ? 'reported' : ''}`}
              onClick={handleFlagClick}
              title={isReported ? "Already reported" : "Report this video"}
              aria-label="Report video"
            >
              <OutlinedFlagIcon sx={{ fontSize: 20 }} />
            </button>
          )}

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
