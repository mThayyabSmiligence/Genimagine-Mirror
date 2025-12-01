import React, { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import "../../Css/DocumentUpload.css";

function DocumentUpload({ file, setFile, isDragging, setIsDragging, error, setError }) {
  const fileInputRef = useRef(null);
   const uploadRef = useRef(null);


   useEffect(() => {
    function handleClickOutside(event) {
      if (
        uploadRef.current &&
        !uploadRef.current.contains(event.target)
      ) {
        setError("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setError]);

  // DRAG-DROP HANDLERS
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
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only PDF, DOC, DOCX, PPT, and PPTX files are allowed.");
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

  return (
    <div
      ref={uploadRef}
      className={`doc-upload-card${isDragging ? " drag-active" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClickArea}
      role="button"
      tabIndex={0}
    >
      <input
        ref={fileInputRef}
        type="file"
        id="file-upload"
        className="doc-file-input"
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {!file ? (
        <label htmlFor="file-upload" className="doc-upload-label" onClick={e => e.stopPropagation()}>
          <div className="doc-upload-icon-bg">
            <FileText size={32} />
          </div>
          <div className="doc-upload-title">
            Drop your file here or click to browse
          </div>
          <div className="doc-upload-info">
            Supports PDF, DOC, DOCX, PPT, PPTX
          </div>
        </label>
      ) : (
        <div className="doc-upload-preview" onClick={e => e.stopPropagation()}>
          <div>
            <span className="doc-file-name">{file.name}</span>
            <span className="doc-file-size">{formatSize(file.size)}</span>
          </div>
          <button className="doc-remove-btn" onClick={handleRemove}>
            ✕
          </button>
        </div>
      )}
      {error && <p className="doc-upload-error">{error}</p>}
    </div>
  );
}

export default DocumentUpload;
