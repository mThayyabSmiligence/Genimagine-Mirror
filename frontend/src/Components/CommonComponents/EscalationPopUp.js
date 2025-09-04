import React, { useState } from 'react';
// import '../../Css/EscalationPopUp.css';

function EscalationPopUp({ onHide, show, feedbackId, handleEscalationSubmit }) {
  const [escalationNote, setEscalationNote] = useState('');
  const [validateNote, setValidateNote] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); 

    if (!escalationNote) {
        console.error('*Escalation note is required.');
        return;
    }

    if (!escalationNote.trim()) {
        setValidateNote(true);
        setErrorMessage('*Escalation note is required.');
        return;
      }

    const letterCount = escalationNote.length;
    if (letterCount < 15 || letterCount > 300) {
      setValidateNote(true);
      setErrorMessage('*Escalation note must be between 15 and 300 characters.');
      return;
    }


    setValidateNote(false);
    // setErrorMessage('');

    handleEscalationSubmit(feedbackId, escalationNote);

    onHide();
  };

    const handleNoteChange = (e) => {
        const value = e.target.value;
        setEscalationNote(value); 
    
        const letterCount = value.length;
    
        if (!value.trim()) {
            setValidateNote(true);
            setErrorMessage('*Escalation note is required.');
          } else if (letterCount >= 15 && letterCount <= 300) {
            setValidateNote(false);
            setErrorMessage('');
          } else {
            setValidateNote(true);
            setErrorMessage('*Escalation note must be between 15 and 300 characters.');
          }
    }

  return (
    <div className={`modal fade ${show ? 'show d-block' : 'd-none'}`} tabIndex="-1" role="dialog">
      <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>
      <div className="modal-dialog modal-dialog-centered popup-container" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Notify to Admin</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <textarea
                className={`form-control escalation-note-container ${validateNote ? 'is-invalid' : ''}`}
                placeholder="Write your escalation note here..."
                value={escalationNote}
                onChange={handleNoteChange}
                rows="4"
                required
              ></textarea>
              {validateNote && (
                <div className="invalid-feedback">
                    {errorMessage}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {/* <button
                type="button"
                className="btn btn-secondary"
                onClick={onHide}
              >
                Cancel
              </button> */}
              <button
                type="submit"
                className="send-escalation-btn"
              >
                Notify
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EscalationPopUp;