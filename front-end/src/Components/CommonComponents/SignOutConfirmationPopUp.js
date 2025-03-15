import React from 'react'
import '../../Css/DeletePopUp.css'

export default function SignOutConfirmationPopUp({ onHide, message, showSignOutPopUp, handelSignOut }) {
  return (
	<div
      className={`modal fade ${showSignOutPopUp ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      role="dialog"
    >
      <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>
      <div className="modal-dialog modal-dialog-centered popup-container" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Sign Out?</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <p>{message || "Are you sure you want to Sign out?"}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={(e) => handelSignOut(e)}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


