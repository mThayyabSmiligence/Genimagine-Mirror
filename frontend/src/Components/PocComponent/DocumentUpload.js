import React, { useState, useRef, useEffect } from "react";
import '../../Css/DocumentUpload.css'
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DocumentUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null)
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    console.log("Updated formData:", formData);
  }, [formData]);


  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError("");

    // Only allow PDFs – no size restriction (can be > 5MB)
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClickArea = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatSize = (sizeInBytes) => {
    const mb = sizeInBytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const onSubmit = async() =>{
    const response = {
        title: "functional spec",
        message: "extract data from the document"
    };
    console.log("uploaded sucessfully")
    setFormData(response);
    // console.log(formData);
    navigate("/poc-modules")

  }

  return (
    <div className="upload-container">
      <div
        className={`upload-area ${isDragging ? "drag-active" : ""} ${
          file ? "has-file" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickArea}
      >
        {!file && (
          <>
            <div className="upload-icon">
              {/* simple icon using text, replace with svg/icon if you want */}
              <span style={{ fontSize: "32px", fontWeight: "bold" }}>PDF</span>
            </div>
            <h3 className="upload-title">Upload or Drag & Drop PDF</h3>
            <p className="upload-description">
              Drag and drop your PDF here, or click to browse from your device.
            </p>
            <p className="upload-format">
              Supported format: <strong>.pdf</strong> | Large files (&gt; 5 MB) are allowed
            </p>
            <button
              type="button"
              className="choose-image-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleClickArea();
              }}
            >
              Choose PDF
            </button>
          </>
        )}

        {file && (
            <>
          <div className="uploaded-file">
            <div className="uploaded-file-header">
              <div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                className="action-btn remove-btn"
                onClick={handleRemove}
              >
                ✕
              </button>
            </div>
            <p className="file-hint">
              This PDF is only stored in the browser for now.  
              Backend upload API is not connected yet.
            </p>
          </div>

          <button className="button dark-button" 
                onClick={(e) => {
                    e.stopPropagation();    // prevent click from reaching the parent div
                    onSubmit();
                }} 
                type="button">
            Upload
          </button>
        </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="upload-error-text">{error}</p>}
    </div>
  );
}

export default DocumentUpload