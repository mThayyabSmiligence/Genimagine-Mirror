import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosAdmin } from '../../API\'s/axios';
import '../../Css/ModeratorDetail.css'; // Create this CSS similar to PlanDetail.css

export default function ModeratorDetail() {
  const [moderatorDetail, setModeratorDetail] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    if (userId) {
      getModeratorData(userId);
    }
  }, [userId]);

  const getModeratorData = async () => {
    try {
      const response = await axiosAdmin.get(`get-moderator-detail/${userId}`); // Adjust route as needed
      setModeratorDetail(response.data.rows);
    } catch (error) {
      console.error('Failed to fetch moderator data', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // Format: dd/mm/yyyy
  };

  if (!moderatorDetail) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="container my-5 moderator-detail-container">
      <div className="moderator-detail-body">  

        <h5 className="moderator-detail-heading-title text-start mb-4">Moderator Details</h5>

        <div className="row gy-3 text-start">
          <div className="col-12 d-flex justify-content-start">
            <span className="text-muted detail-label">ID</span>
            <span className="detail-value">{moderatorDetail.user_id}</span>
          </div>

          <div className="col-12 d-flex justify-content-start">
            <span className="text-muted detail-label">Username</span>
            <span className="detail-value">{moderatorDetail.username}</span>
          </div>

          <div className="col-12 d-flex justify-content-start">
            <span className="text-muted detail-label">Email</span>
            <span className="detail-value">{moderatorDetail.email}</span>
          </div>

          <div className="col-12 d-flex justify-content-start">
            <span className="text-muted detail-label">Age</span>
            <span className="detail-value">{moderatorDetail.age}</span>
          </div>

          <div className="col-12 d-flex justify-content-start">
            <span className="text-muted detail-label">Date of Birth</span>
            <span className="detail-value">{formatDate(moderatorDetail.DOB)}</span>
          </div>

          <div className="col-12 d-flex justify-content-start">
            <span className="text-muted detail-label">Status</span>
            <span className={`detail-value ${moderatorDetail.status === 'active' ? 'text-success' : 'text-danger'}`}>
              {moderatorDetail.status}
            </span>
          </div>

          <div className="col-12 d-flex justify-content-start">
            <span className="text-muted detail-label">Verified</span>
            <span className="detail-value">{moderatorDetail.is_verified ? 'Yes' : 'No'}</span>
          </div>

          <div className="col-12 d-flex justify-content-start">
            <span className="text-muted detail-label">Deleted</span>
            <span className="detail-value">{moderatorDetail.is_deleted ? 'Yes' : 'No'}</span>
          </div>

          <div className="col-12 d-flex justify-content-start">
            <span className="text-muted detail-label">Created At</span>
            <span className="detail-value">{formatDate(moderatorDetail.created_at)}</span>
          </div>
        </div>

        <div className="text-center back-button-container">
          <button className="back-btn" onClick={() => window.history.back()}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
