import React, { useEffect, useRef } from 'react'
import '../../Css/ModeratorProfilePage.css'
import { useState } from 'react';
import { axiosModerator } from '../../API\'s/axios';
import { useNavigate } from 'react-router-dom';

function ModeratorProfilePage() {
    const navigate = useNavigate();
    const [moderatorDetail, setModeratorDetail] = useState(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        getModeratorDetail();
    },[])

   const getModeratorDetail = async () => {
    try {
      const response = await axiosModerator.post(`/get-moderator-detail`);
      console.log(response.data.rows);
      setModeratorDetail(response.data.rows);
    } catch (error) {
      console.error("Error fetching moderator detail", error);
    }
  };

  const handelResetPassword = async() =>{
    navigate('/moderator/change-password')
  }

   const handleUploadClick = () => {
    fileInputRef.current.click(); // triggers hidden input
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type) || file.size > 800000) {
      alert("Invalid file. Only JPG, PNG, GIF under 800KB are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("profile_image", file);

    try {
      setUploading(true);
      const res = await axiosModerator.post('/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert("Upload successful!");
      getModeratorDetail(); // Refresh profile
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };


  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'M';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!moderatorDetail) {
    return <div className='p-5 text-center'>Loading profile...</div>;
  }
  return (
    <div className='modrator-profile-page-container p-4 mx-4'>
      <div className='profile-wrapper p-4 rounded shadow bg-white'>
        <h1 className='plan-heading-title text-start mb-3'>Profile Details</h1>

        <div className='d-flex align-items-center mb-4'>
          <div className='profile-image-wrapper me-3'>
            <div
              className='profile-initial custum-profile-bg text-white rounded-circle d-flex align-items-center justify-content-center'
            >
              {getInitial(moderatorDetail.username)}
            </div>
          </div>
           <div>
            <button className='custom-btn d-flex ms-2' onClick={handleUploadClick} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload new photo'}
            </button>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/png, image/jpeg, image/gif'
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <p className='text-muted text-start mt-3 ms-2 profile-note'>
              Allowed formats are JPG, GIF, or PNG, with a maximum size of 800 KB.
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="profile-username-text d-flex mb-1">USER NAME</label>
            <input type="text" className="form-control" value={moderatorDetail.username} disabled />
          </div>
          <div className="col-md-6 mb-3">
            <label className="profile-role-text d-flex mb-1">ROLE</label>
            <input type="text" className="form-control" value={moderatorDetail.role} disabled />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="profile-email-text d-flex mb-1">E-MAIL</label>
            <input type="email" className="form-control" value={moderatorDetail.email} disabled />
          </div>
          <div className="col-md-6 mb-3">
            <label className="profile-dob-text d-flex mb-1">DATE OF BIRTH</label>
            <input type="text" className="form-control" value={formatDate(moderatorDetail.dob)} disabled />
          </div>
        </div>

        <div className='d-flex justify-content-between mt-4 responsive-btn-group'>
          <div className='back-btn-wrapper'>
            <button onClick={() => navigate('/moderator/user-management')} className='btn btn-secondary'>
              ← Back
            </button>
          </div>
          <div className='d-flex gap-2 action-profile-btn'>
            <button className='custom-btn update-btn-wrapper'>Update Profile</button>
            <button onClick={handelResetPassword} className='custom-btn reset-password-btn-wrapper'>
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ModeratorProfilePage