import React, { useState } from 'react'
import '../../Css/FeedbackPopUp.css'

function FeedbackPopUp({onHide, showFeedbackPopUp, handleSendFeedback}) {

    const [category, setCategory] = useState('bug_report');
    const [message, setMessage] = useState('');
    const [validateMessage,setValidateMessage]=useState(false)
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e) => {
    e.preventDefault();

    if (!category || !message) {
        console.error('Category and message are required fields.');
        return;
    }

    if (!message.trim()) {
        setValidateMessage(true);
        setErrorMessage('Message is required.');
        return;
    }

    const letterCount = message.length;
    if (letterCount < 15 || letterCount > 300) {
      setValidateMessage(true);
      return;
    }

    setValidateMessage(false);

    handleSendFeedback({ category, message });

    };

    const handleMessageChange = (e) => {
        const value = e.target.value;
        setMessage(value);
    
        const letterCount = value.length;

        if (!value.trim()) {
            setValidateMessage(true); 
            setErrorMessage('Message is required.');
        } else if (letterCount >= 15 && letterCount <= 300) {
            setValidateMessage(false);
            setErrorMessage('');
        } else {
            setValidateMessage(true);
            setErrorMessage('Message must be between 15 and 300 characters.');
        }
      };

  return (
     <div
      className={`modal fade ${showFeedbackPopUp ? "show d-block" : "d-none"}`}
      tabIndex="-1"
      role="dialog"
    >
      <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>
      <div className="modal-dialog modal-dialog-centered popup-container" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Submit Feedback</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <label className="form-label">Feedback Category</label>
              <select
                className="form-select mb-3 catregory-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="bug_report">Bug Report</option>
                <option value="feature_request">Feature Request</option>    
                <option value="complaint">Complaint</option>
              </select>

              <label className="form-label">Message</label>
              <textarea
                className={`form-control response-message-container ${validateMessage ? 'is-invalid' : ''}`}
                rows="4"
                placeholder="Write your feedback here..."
                value={message}
                onChange={handleMessageChange}
                required
              ></textarea>
              {validateMessage ? (
                <div className="invalid-feedback">
                  *Message must be between 15 and 300 words.
                </div>
              ):
              null
              
            }
            </div>
            <div className="modal-footer">
              {/* <button type="button" className="btn btn-secondary" onClick={onHide}>
                Cancel
              </button> */}
              <button type="submit" className="send-feedback-btn d-flex align-items-center justify-content-center">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FeedbackPopUp