// DeleteReportVideoPopUp.js

import React, { useState } from 'react';

export default function DeleteReportVideoPopUp({
  showDeletePopUp,
  onHide,
  handleDeleteVideo,
}) {
  const [reason, setReason] = useState('');

  const handleDelete = () => {
    if (!reason.trim()) {
      alert('Please provide a reason for deleting the video.');
      return;
    }
    handleDeleteVideo(reason);
    setReason('');
  };

  return (
    <div
      className={`modal fade ${showDeletePopUp ? 'show d-block' : 'd-none'}`}
      tabIndex="-1"
      role="dialog"
    >
      <div
        onClick={onHide}
        className="modal-backdrop fade show bgblur-container"
      ></div>
      <div
        className="modal-dialog modal-dialog-centered popup-container"
        role="document"
      >
        <div className="modal-content p-4">
          <h5 className="mb-3 text-danger">Delete Reported Video</h5>

          <div className="mt-2 mb-3">
            <p>
              Are you sure you want to delete this reported video? This action
              cannot be undone.
            </p>
            <textarea
              className="form-control"
              placeholder="Enter the reason for deleting this video"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
