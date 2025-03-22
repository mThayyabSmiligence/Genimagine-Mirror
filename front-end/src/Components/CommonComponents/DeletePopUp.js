import React from 'react'
import '../../Css/DeletePopUp.css'

export default function DeletePopUp({ onHide, message, showDeletePopUp, handelDelete }) {
  return (
	<div
      className={`modal fade ${showDeletePopUp ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      role="dialog"
    >
      <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>
      <div className="modal-dialog modal-dialog-centered popup-container" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Deletion</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <p>{message || "Are you sure you want to delete this item from your published image page?"}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={(e) => handelDelete(e)}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
