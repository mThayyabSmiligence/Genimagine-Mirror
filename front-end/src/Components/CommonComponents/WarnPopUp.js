import React from 'react'
import '../../Css/WarnPopUp.css'

export default function WarnPopUp({ reason, setReason, handleWarnUser, showWarnPopUp, onHide }){
  return (
    <div className={`modal fade ${showWarnPopUp ? "show d-block" : "d-none"}`} tabIndex="-1" role="dialog">
          <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>
          <div className="modal-dialog modal-dialog-centered popup-container" role="document">
            <div className="modal-content p-4">
              <h5 className="mb-3">Warn User</h5>
    
              <div className="form-group mt-3">
                <label htmlFor="reason">Reason</label>
                <textarea
                  id="reason"
                  className="form-control textarea-container"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for Warn user"
                //   disabled={["suspended", "banned", "deleted"].includes(user?.status)}
                />
              </div>
    
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-secondary" onClick={onHide}>Cancel</button>
                <button className="btn btn-danger" 
                    onClick={() => {
                        handleWarnUser();
                        onHide(); 
                        }}
                    >
                    Warn
                </button>
              </div>
            </div>
          </div>
        </div>
  )
}

