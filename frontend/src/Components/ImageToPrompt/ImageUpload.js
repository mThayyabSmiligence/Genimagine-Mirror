import React, { useState, useRef } from 'react';
import '../../Css/ImageToPrompt.css';
import { axiosNoAUth } from '../../API\'s/axios';

const ImageUpload = ({setConversationHistory,conversationHistory}) => {
  const [uploadedImage, setUploadedImage] = useState({
    file: null,
    preview: null,
    name: '',
    size: 0
  });
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);


  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle dropped files
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process uploaded file (single image only)
  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload only image files');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage({
        file: file,
        preview: e.target.result,
        name: file.name,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setUploadedImage({
      file: null,
      preview: null,
      name: '',
      size: 0
    });
  };

  const replaceImage = () => {
    fileInputRef.current.click();
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      console.log(uploadedImage.file instanceof File);  // should be true
      console.log(uploadedImage.file);

      const formData = new FormData();
      formData.append('image', uploadedImage.file);

      const result = await axiosNoAUth.post('/image-to-prompt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      
      if (result.data.result.success) {
        if(result.data.result.image_url){
          setConversationHistory((prevHistory)=>[result.data.result,...prevHistory]);
        }
        else{
          const conversation={
            image: uploadedImage.preview,
            prompt: result.data.result.prompt
          }
          console.log(conversationHistory);
          setConversationHistory((prevHistory) => prevHistory?  [conversation,...prevHistory] : [conversation]); 
          const history = JSON.parse(sessionStorage.getItem('GuestImageToPromptHistory'))||[];
          console.log(typeof history);
          history.unshift(conversation);
          sessionStorage.setItem('GuestImageToPromptHistory', JSON.stringify(history));
        }
        removeImage();
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploadedImage.file ? 'has-image' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!uploadedImage.file ? onButtonClick : undefined}
      >
        {!uploadedImage.file ? (
          <>
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="upload-title">Upload Image to Generate Prompt</h3>
            <p className="upload-description">Drag and drop your image here, or click to browse</p>
            <p className="upload-format">Supported formats: PNG, JPEG, JPG, WEBP (less than 5MB)</p>
            <button
              className="choose-image-btn"
              onClick={(e) => {
                e.stopPropagation(); // FIX: Prevent event bubbling
                onButtonClick();
              }}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Choose Image
            </button>
          </>
        ) : (
          <div className="image-preview-container">
            <div className="image-to-prompt image-actions">
              <button
                className="action-btn replace-btn"
                onClick={replaceImage}
                title="Replace image"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button
                className="action-btn remove-btn"
                onClick={removeImage}
                title="Remove image"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="uploaded-image">
              <img src={uploadedImage.preview} alt={uploadedImage.name} />
            </div>
            <div className="image-details">
              <p className="image-name">{uploadedImage.name}</p>
              <p className="image-size">{(uploadedImage.size / 1024).toFixed(1)} KB</p>
            </div>
            <button className="button dark-button" onClick={onSubmit} type="button">
              Generate
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>
      {loading && <div className="loading-container"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>}
    </div>
  );
};

export default ImageUpload;
