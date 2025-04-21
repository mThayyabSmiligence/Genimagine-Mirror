import React from 'react'

export default function DeleteReportImagePopUp({ showDeletePopUp, onHide, handleDeleteImage }) {
  return (
    <div className={`modal fade ${showDeletePopUp ? "show d-block" : "d-none"}`} tabIndex="-1" role="dialog">
      <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>
      <div className="modal-dialog modal-dialog-centered popup-container" role="document">
        <div className="modal-content p-4">
          <h5 className="mb-3 text-danger">Delete Reported Image</h5>

          <div className="mt-2 mb-3">
            Are you sure you want to delete this reported image? This action cannot be undone.
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn btn-secondary" onClick={onHide}>Cancel</button>
            <button
              className="btn btn-danger"
              onClick={() => {
                handleDeleteImage();
                onHide();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

