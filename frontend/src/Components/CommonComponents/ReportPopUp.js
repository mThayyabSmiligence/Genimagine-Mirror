import React, { useState } from "react";
import { toast } from "react-toastify";

export default function ReportPopUp({
  reportReason,
  setReportReason,
  handleReport,
  showReportPopUp,
  onHide,
}) {
  const [showError, setShowError] = useState(false);

  const handleSubmit = () => {
    if (!reportReason.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    handleReport();
    onHide();
  };

  const handleReasonChange = (e) => {
    setReportReason(e.target.value);
    if (e.target.value.trim()) {
      setShowError(false);
    }
  };

  const handleClose = () => {
    setShowError(false);
    onHide();
  };

  return (
    <div
      className={`modal fade ${showReportPopUp ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      role="dialog"
    >
      <div
        onClick={handleClose}
        className="modal-backdrop fade show bgblur-container"
      ></div>
      <div
        className="modal-dialog modal-dialog-centered popup-container"
        role="document"
      >
        <div className="modal-content p-4">
          <h5 className="mb-3 text-start">Report Video</h5>

          <div className="form-group mt-3 d-flex flex-column align-items-start w-100">
            <label htmlFor="reason" className="fw-semibold">
              Reason: <span className="text-danger">*</span>
            </label>
            <textarea
              required
              id="reason"
              className={`form-control textarea-container ${showError ? 'border-danger' : ''}`}
              value={reportReason}
              onChange={handleReasonChange}
              placeholder="Enter reason for reporting this video"
              rows={4}
            />
            {showError && (
              <small className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                Reason is required
              </small>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleSubmit}>
              Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
