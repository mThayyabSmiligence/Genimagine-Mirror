import React, { useState, useEffect } from 'react';
import '../../Css/StyleFormModal.css';
import { axiosAdmin } from '../../API\'s/axios';

function StyleFormModal({ onClose, refreshStyles, editStyleData }) {
  const isEditMode = !!editStyleData;

  const [name, setName] = useState('');
  const [fileName, setFileName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      setName(editStyleData.name || '');
      setFileName(editStyleData.image_path || '');
      setPreviewUrl(`https://genimagin.s3.ap-south-1.amazonaws.com/style/${editStyleData.image_path}`);
      setIsActive(editStyleData.is_active === 1);
    } else {
      setName('');
      setFileName('');
      setImageFile(null);
      setPreviewUrl('');
      setIsActive(true);
    }
  }, [editStyleData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !fileName || (!imageFile && !isEditMode)) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('image_path', fileName); // custom filename
      formData.append('is_active', isActive ? 1 : 0);
      if (imageFile) formData.append('styleImage', imageFile);

      const endpoint = isEditMode
        ? `/update-style/${editStyleData.id}`
        : `/create-style`;

      const res = await axiosAdmin.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        refreshStyles();
        onClose();
      } else {
        alert(res.data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="style-form-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className='style-form-title'>{isEditMode ? 'Edit Style' : 'Create New Style'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className='text-start style-name-text w-100 mb-1 required-label'>Style Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className='text-start image-path-text w-100 mb-1 required-label'>
              Enter Image Filename (e.g. modern-ink-style.png)
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className='text-start image-upload-text w-100 mb-1 required-label'>
              Upload Style Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={submitting}
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="style-preview-img mt-2"
              />
            )}
          </div>

          <div className="form-group switch-container d-flex flex-column">
            <label className='text-start status-text mb-1'>
              Status:
              <span className={`recent-status ${isActive ? 'Active' : 'Inactive'} ms-2`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </label>
            <label className="switch ms-2 text-start">
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
                disabled={submitting}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="modal-actions mt-3">
            <button className='cancel-btn' type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button className='submit-btn' type="submit" disabled={submitting}>
              {isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StyleFormModal;
