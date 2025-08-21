import React, { useEffect, useRef, useState, useContext } from 'react';
import '../../Css/AdminProfilePage.css';
import { useNavigate } from 'react-router-dom';
import RefreshDataContext from "../../Context/RefreshDataProvider";
import { axiosAdmin } from '../../API\'s/axios';

function AdminProfilePage() {
  const navigate = useNavigate();
  const [adminDetail, setAdminDetail] = useState(null);
  const { setRefreshUserData } = useContext(RefreshDataContext);

  const [uploadedImage, setUploadedImage] = useState({
    file: null,
    preview: null,
    name: '',
    size: 0
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getAdminDetail();
  }, []);

  const getAdminDetail = async () => {
    try {
      const response = await axiosAdmin.post(`/get-admin-detail`);
      console.log(response.data.rows);
      let details = response.data.rows;

      const storedImage = localStorage.getItem("adminProfileImage");
      if (storedImage) {
        details.profile_image = storedImage;
      }

      setAdminDetail(details);

      if (details.profile_image) {
        setUploadedImage({
          file: null,
          preview: details.profile_image,
          name: "profile.png",
          size: 0
        });
      }
    } catch (error) {
      console.error("Error fetching admin detail", error);
    }
  };


  const handelResetPassword = () => {
    navigate('/admin/change-password');
  };

  // --- Drag & Drop ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // --- File Validation + Preview ---
  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert("Only images are allowed.");
      return;
    }
    if (file.size > 800000) {
      alert("Max size allowed is 800KB.");
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

  const removeImage = () => {
  setUploadedImage({ file: null, preview: null, name: '', size: 0 });
  localStorage.removeItem("adminProfileImage"); 
};


  const replaceImage = () => {
    fileInputRef.current.click();
  };

  // --- Upload to backend ---
  const handleUpdateProfile = async () => {
    if (!uploadedImage.preview) {
      alert("Please select an image before updating profile.");
      return;
    }

    try {
      setUploading(true);
      localStorage.setItem("adminProfileImage", uploadedImage.preview);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Saving to local storage failed.");
    } finally {
      setUploading(false);
    }
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

  if (!adminDetail) {
    return <div className='p-5 text-center'>Loading profile...</div>;
  }

  return (
    <div className='admin-profile-page-container p-4 mx-4'>
      <div className='profile-wrapper p-4 rounded shadow bg-white'>
        <h1 className='plan-heading-title text-start mb-3'>Profile Details</h1>

        {/* --- Upload Area --- */}
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploadedImage.preview ? 'has-image' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!uploadedImage.preview ? () => fileInputRef.current.click() : undefined}
        >
          {!uploadedImage.preview ? (
            <>
              <div className="upload-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
              </div>
              <h3 className="upload-title">Upload Profile Photo</h3>
              <p className="upload-description">Drag & drop or click to browse</p>
              <p className="upload-format">Allowed: JPG, PNG, GIF (max 800KB)</p>
            </>
          ) : (
            <div className="image-preview-container">
              <div className="image-actions">
                <button className="action-btn replace-btn" onClick={replaceImage} type="button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <button className="action-btn remove-btn" onClick={removeImage} type="button">
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

        {/* --- Profile details --- */}
        <div className="row mt-4">
          <div className="col-md-6 mb-3">
            <label className="profile-username-text d-flex mb-1">USER NAME</label>
            <input type="text" className="form-control" value={adminDetail.username} disabled />
          </div>
          <div className="col-md-6 mb-3">
            <label className="profile-role-text d-flex mb-1">ROLE</label>
            <input type="text" className="form-control" value={adminDetail.role} disabled />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="profile-email-text d-flex mb-1">E-MAIL</label>
            <input type="email" className="form-control" value={adminDetail.email} disabled />
          </div>
          <div className="col-md-6 mb-3">
            <label className="profile-dob-text d-flex mb-1">DATE OF BIRTH</label>
            <input type="text" className="form-control" value={formatDate(adminDetail.dob)} disabled />
          </div>
        </div>

        {/* --- Buttons --- */}
        <div className='d-flex justify-content-between mt-4 responsive-btn-group'>
          <button onClick={() => navigate('/admin/user-management')} className='btn btn-secondary'>
            ← Back
          </button>
          <div className='d-flex gap-2 action-profile-btn'>
            <button className='custom-btn update-btn-wrapper' onClick={handleUpdateProfile} disabled={uploading}>
              {uploading ? "Updating..." : "Update Profile"}
            </button>
            <button onClick={handelResetPassword} className='custom-btn reset-password-btn-wrapper'>
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfilePage;
