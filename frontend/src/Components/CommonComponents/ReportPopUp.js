import React from 'react'

export default function ReportPopUp({reportReason, setReportReason, handleReport,showReportPopUp,onHide}) {
  return (
    <div className={`modal fade ${showReportPopUp ? "show d-block" : "d-none"}`} tabIndex="-1" role="dialog">
          <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>
          <div className="modal-dialog modal-dialog-centered popup-container" role="document">
            <div className="modal-content p-4">
              <h5 className="mb-3 text start">Report User</h5>
    
              <div className="form-group mt-3 d-flex flex-column align-items-start">
                <label htmlFor="reason">Reason:</label>
                <textarea
                  id="reason"
                  className="form-control textarea-container"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Enter reason for Report image"
                //   disabled={["suspended", "banned", "deleted"].includes(user?.status)}
                />
              </div>
    
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-secondary" onClick={onHide}>Cancel</button>
                <button className="btn btn-danger" 
                    onClick={() => {
                        handleReport();
                        onHide(); 
                        }}
                    >
                    Report
                </button>
              </div>
            </div>
          </div>
        </div>
  )
}

