import React, { useState } from 'react'
import '../../Css/feedbackResponsePopUp.css'

function FeedbackResponsePopUp({onHide, show, feedbackId, handleResponseSubmit }) {
    const [responseMessage, setResponseMessage] = useState('');
    const [validateMessage, setValidateMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();

      if (!responseMessage) {
        console.error('Response message is required.');
        return;
      }

      if (!responseMessage.trim()) {
          setValidateMessage(true);
          setErrorMessage('Response message is required.');
          return;
        }
    
      const letterCount = responseMessage.length;
      if (letterCount < 15 || letterCount > 300) {
        setValidateMessage(true);
        return;
      }

      setValidateMessage(false);
  
      // Call the API handler
      handleResponseSubmit(feedbackId, responseMessage);
  
      // Close the popup
      onHide();
    };

    const handleMessageChange = (e) => {
        const value = e.target.value;
        setResponseMessage(value); 
    
        const letterCount = value.length;

        if (!value.trim()) {
            setValidateMessage(true);
            setErrorMessage('Response message is required.');
          } else if (letterCount >= 15 && letterCount <= 300) {
            setValidateMessage(false);
            setErrorMessage('');
          } else {
            setValidateMessage(true);
            setErrorMessage('Response must be between 15 and 300 characters.');
          }
    };
  
    return (
      <div className={`modal fade ${show ? 'show d-block' : 'd-none'}`} tabIndex="-1" role="dialog">
        <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>
        <div className="modal-dialog modal-dialog-centered popup-container" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Respond to Feedback</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <textarea
                  className={`form-control feedback-response-container ${validateMessage ? 'is-invalid' : ''}`}
                  rows="4"
                  placeholder="Write your response here..."
                  value={responseMessage}
                  onChange={handleMessageChange}
                  required
                ></textarea>
                {validateMessage && (
                  <div className="invalid-feedback">
                    *Response must be between 15 and 300 words.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="send-response-btn d-flex align-items-center justify-content-center"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  
}

export default FeedbackResponsePopUp