import React, { useState, useEffect } from 'react';
import '../../Css/StyleFormModal.css'
import { axiosAdmin } from '../../API\'s/axios';

function StyleFormModal({ onClose, refreshStyles, editStyleData }) {
  const isEditMode = !!editStyleData;

  const [name, setName] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { 
    if (isEditMode) {
      setName(editStyleData.name || '');
      setImagePath(editStyleData.image_path || '');
      setIsActive(editStyleData.is_active === 1);
    } else {
      setName('');
      setImagePath('');
      setIsActive(true);
    }
  }, [editStyleData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !imagePath) {
      alert('Please fill in all fields.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name,
        image_path: imagePath,
        is_active: isActive ? 1 : 0,
      };

      const endpoint = isEditMode
        ? `/update-style/${editStyleData.id}`
        : '/create-style';

      const res = await axiosAdmin.post(endpoint, payload);
      if (res.data.success) {
        refreshStyles();
        onClose();
      } else {
        alert(res.data.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Style submit error:', err);
      alert('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="style-form-modal" onClick={(e) => e.stopPropagation()} >
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
            <label className='text-start image-path-text w-100 mb-1 required-label'>Image Path (e.g. textured-oil-painting.png)</label>
            <input
              type="text"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group switch-container d-flex flex-column">
          <label className='text-start status-text mb-1'>Status: <span className={`recent-status ${isActive ? 'Active' : 'Inactive'}`}>{isActive ? 'Active' : 'Inactive'}</span></label>
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
