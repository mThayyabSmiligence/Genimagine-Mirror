import React, { useEffect, useState } from 'react';
// Material UI Icons
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { toast } from 'react-toastify';
import '../../Css/CreateCharacters.css';
import { axiosPrivate } from '../../API\'s/axios';

function CreateCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
    story: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogMode, setDialogMode] = useState("generate"); // "generate" | "upload"
  const [anchorMenu, setAnchorMenu] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if Next button should be enabled
  const isNextEnabled = characters.length >= 1;

  const handleCreateCharacter = async () => {
    if (!newCharacter.name.trim()) {
      toast.error("Please enter a character name", 'error');
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call for character creation and image generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success("Character created successfully!");
    setIsGenerating(false);
    setIsCreateDialogOpen(false);
    setNewCharacter({ name: "", description: "", story: "" });
  };

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosPrivate.get('/get-all-characters');
        
        console.log('API Response:', response);
        console.log('Response Data:', response.data);
        console.log('Characters Array:', response.data.characters);
        console.log('Is Characters Array?', Array.isArray(response.data.characters));
        
        setCharacters(response.data.characters || []);
        
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError('Failed to load characters. Please try again later.');
        setCharacters([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const handleGenerateImage = async () => {
    if (!newCharacter.description.trim()) {
      toast.error("Please add a description first", 'error');
      return;
    }
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.error("Character image generated!");
    setIsGenerating(false);
  };

   const handleDeleteClick = (character) => {
    setCharacterToDelete(character);
    setShowDeleteModal(true);
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCharacterToDelete(null);
    setIsDeleting(false);
  };

  // Confirm delete character
  const handleConfirmDelete = async () => {
    if (!characterToDelete) return;

    setIsDeleting(true);
    
    try {
      await axiosPrivate.delete(`/delete-character/${characterToDelete.id || characterToDelete._id}`);
      setCharacters(characters.filter(character => 
        character.id !== characterToDelete.id && character._id !== characterToDelete._id
      ));
      toast.success("Character deleted successfully!");
      handleCloseDeleteModal();
    } catch (err) {
      console.error('Error deleting character:', err);
      toast.error('Failed to delete character. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setNewCharacter({ name: "", description: "", story: "" });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  const handleNext = () => {
    if (isNextEnabled) {
      // Handle next action here
      toast.success("Proceeding to next step!");
    }
  };
  

  return (
    <div className="characters-container mt-5">
      {/* Header */}
      <div className="characters-header">
        <div className="header-content">
          <h1 className="page-title">Characters</h1>
          <p className="page-subtitle">
            Create and manage your story characters
          </p>
        </div>
      </div>

      <div className='mb-3 d-flex justify-content-end'>
        <button
          className="btn-primary next-btn"
          disabled={!isNextEnabled}
          onClick={handleNext}
          title={!isNextEnabled ? "Create at least one character to proceed" : "Proceed to next step"}
        >
          Next
          <EastRoundedIcon className='icon-sm'/>
        </button>
      </div>

      {/* Characters Grid */}
      <div className="characters-grid">
        {/* Create New Character Card */}
        <div
          className="create-character-card"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <div className="create-card-content">
            <div className="create-icon">
              <AddRoundedIcon className="icon-lg" />
            </div>
            <h3 className="create-title">Create Character</h3>
            <p className="create-subtitle">
              Design a new character for your story
            </p>
          </div>
        </div>

        {/* Character Cards */}
         {/* Character Cards from API */}
        {Array.isArray(characters) && characters.length > 0 && characters.map((character) => (
          <div key={character.id || character._id || Math.random()} className="character-card">
            <div className="character-image">
              <div className="character-overlay"></div>
              <span className="character-story-badge">
                {character.story || character.story_name || 'No Story'}
              </span>
            </div>
            
            <div className="character-header">
              <h3 className="character-title">{character.name || 'Untitled Character'}</h3>
              <p className="character-description">
                {character.description || 'No description available'}
              </p>
            </div>
            
            <div className="character-footer">
              <div className="character-actions">
                <button 
                  className="action-btn" 
                  title="Edit Character"
                  onClick={() => console.log('Edit character:', character.id)}
                >
                  <EditOutlinedIcon className="icon-xs" />
                </button>
                <button 
                  className="action-btn action-danger" 
                  title="Delete Character"
                  onClick={() => handleDeleteClick(character)}
                >
                  <DeleteOutlineIcon className="icon-xs" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {characters.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <PeopleOutlineIcon className="icon-xxl" />
          </div>
          <h3 className="empty-title">No characters yet</h3>
          <p className="empty-subtitle">
            Create your first character to bring your stories to life
          </p>
        </div>
      )}

      {/* Create Character Dialog */}
      {isCreateDialogOpen && (
        <div className="dialog-overlay" onClick={closeDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            {/* --- Header --- */}
            <div className="dialog-header">
              <h2 className="dialog-title">
                Create New Character
              </h2>
              <div className="header-actions">
                {/* 3-dot menu */}
               <div className="mode-switch">
                    <div className="custom-select-wrapper">
                        <select
                        value={dialogMode}
                        onChange={(e) => setDialogMode(e.target.value)}
                        className="custom-select"
                        >
                        <option value="generate" className='dialog-custom-option'>Generate Image</option>
                        <option value="upload" className='dialog-custom-option'>Upload Image</option>
                        </select>
                        <KeyboardArrowDownIcon className="select-icon" />
                    </div>
                </div>
               {anchorMenu && (
                <div className="dropdown-menu">
                    {dialogMode === "generate" ? (
                    <button
                        onClick={() => {
                        setDialogMode("upload");
                        setAnchorMenu(false);
                        }}
                    >
                        <UploadFileIcon className="icon-xs" /> Upload Image
                    </button>
                    ) : (
                    <button
                        onClick={() => {
                        setDialogMode("generate");
                        setAnchorMenu(false);
                        }}
                    >
                        <ImageOutlinedIcon className="icon-xs" /> Generate Image
                    </button>
                    )}
                </div>
                )}

                <button className="dialog-close" onClick={closeDialog}>
                  <CloseIcon className="icon-sm" />
                </button>
              </div>
              <p className="dialog-description text-start">
                Design a unique character for your stories
              </p>
            </div>

            {/* --- Body --- */}
            <div className="dialog-body">
              {/* Character Fields */}
              <div className="form-group">
                <label className="form-label">Character Name</label>
                <input
                  type="text"
                  value={newCharacter.name}
                  onChange={(e) =>
                    setNewCharacter((p) => ({ ...p, name: e.target.value }))
                  }
                  className="form-input"
                  placeholder="Enter character name..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Character Description</label>
                <textarea
                  value={newCharacter.description}
                  onChange={(e) =>
                    setNewCharacter((p) => ({ ...p, description: e.target.value }))
                  }
                  className="form-textarea"
                  rows="4"
                  placeholder="Describe your character..."
                />
              </div>

              {/* Mode Switch */}
              {dialogMode === "generate" ? (
                <div className="generate-image-section">
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                    className="btn-outline btn-full"
                  >
                    {isGenerating ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <ImageOutlinedIcon className="icon-sm" />
                    )}
                    Generate Image
                  </button>
                </div>
              ) : (
                <div className="upload-section">
                  {!uploadedImage ? (
                    <label className="upload-dropzone">
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileSelect}
                      />
                      <UploadFileIcon className="icon-lg" />
                      <p>Drag & Drop or Click to Upload</p>
                    </label>
                  ) : (
                    <div className="preview-wrapper">
                      <img src={uploadedImage} alt="preview" className="preview-img" />
                      <button onClick={handleRemoveImage} className="remove-btn">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="dialog-actions">
                <button
                  onClick={handleCreateCharacter}
                  disabled={isGenerating}
                  className="btn-primary btn-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="loading-spinner"></div> Creating...
                    </>
                  ) : (
                    <>
                      <AutoFixHighIcon className="icon-sm" /> Create Character
                    </>
                  )}
                </button>
                <button onClick={closeDialog} className="btn-ghost btn-full">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div 
          className={`modal fade ${showDeleteModal ? 'show' : ''}`}
          style={{ 
            display: showDeleteModal ? 'block' : 'none',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
          tabIndex="-1"
          aria-labelledby="deleteCharacterModalLabel"
          aria-hidden={!showDeleteModal}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center">
                  <div 
                    className="d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#fee2e2',
                      borderRadius: '50%'
                    }}
                  >
                    <WarningAmberIcon style={{ color: '#dc2626', fontSize: '20px' }} />
                  </div>
                  <h1 className="modal-title fs-5 mb-0" id="deleteCharacterModalLabel">
                    Delete Character
                  </h1>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseDeleteModal}
                  aria-label="Close"
                  disabled={isDeleting}
                ></button>
              </div>
              
              <div className="modal-body pt-2">
                <p className="text-muted mb-3">
                  Are you sure you want to delete <strong>"{characterToDelete?.name}"</strong>?
                </p>
                <div className="alert alert-warning border-0" style={{ backgroundColor: '#fef3c7' }}>
                  <small className="text-dark">
                    <strong>Warning:</strong> This action cannot be undone. The character and all associated content will be permanently deleted from your story.
                  </small>
                </div>
              </div>
              
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={handleCloseDeleteModal}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <DeleteOutlineIcon style={{ fontSize: '16px', marginRight: '4px' }} />
                      Delete Character
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCharacters;
