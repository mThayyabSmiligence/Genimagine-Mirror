import React from 'react'

function RemoveFromLibrary({onHide, deleteFromLibrary, message, showRemoveLibraryPopUp}) {
  return (
    <div
      className={`modal fade ${showRemoveLibraryPopUp ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      role="dialog"
    >
      <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>
      <div className="modal-dialog modal-dialog-centered popup-container" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Remove from library</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <p>{message || "Are you sure you want to remove this item from your library?"}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={(e) => deleteFromLibrary(e)}>
              Remove from library
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemoveFromLibrary