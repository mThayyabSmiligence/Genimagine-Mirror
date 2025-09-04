import React from 'react';
import DateTimePickerValue from './DateTimePicker';
import '../../Css/SuspendPopUp.css'

function SuspendPopUp({ onHide, showSuspendPopup, handleSuspendUser, suspendDate, setSuspendDate, reason, setReason }) {
  return (
    <div className={`modal fade ${showSuspendPopup ? "show d-block" : "d-none"}`} tabIndex="-1" role="dialog">
      <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>
      <div className="modal-dialog modal-dialog-centered popup-container" role="document">
        <div className="modal-content p-4">
          <h5 className="mb-3">Suspend User</h5>

          <DateTimePickerValue value={suspendDate} setValue={setSuspendDate} />

          <div className="form-group mt-3">
            <label htmlFor="reason" className='d-flex'>Reason:</label>
            <textarea
              id="reason"
              className="form-control textarea-container"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for suspension"
            />
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn btn-secondary" onClick={onHide}>Cancel</button>
            <button className="btn btn-danger" onClick={handleSuspendUser}>Suspend</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuspendPopUp;
