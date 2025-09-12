import React, { useEffect, useState, useRef } from 'react';
// Material UI Icons
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh'; 
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { toast } from 'react-toastify';
import '../../Css/CreateCharacters.css';
import { axiosPrivate } from '../../API\'s/axios';
import { useNavigate, useParams } from 'react-router-dom';

function CreateCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogMode, setDialogMode] = useState("generate"); // "generate" | "upload"
  const [anchorMenu, setAnchorMenu] = useState(false);
  const [showCharacterPreview, setShowCharacterPreview] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  
  
  // Updated upload state for drag and drop
  const [uploadedImage, setUploadedImage] = useState({
    file: null,
    preview: null,
    name: '',
    size: 0
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if Next button should be enabled
  const isNextEnabled = characters.length >= 1;

  const [showPreview, setShowPreview] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [imageRefresh, setImageRefresh] = useState(0);
  
  const { id } = useParams(); 
  const navigate = useNavigate(); 

  // Drag and drop handlers
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

  // Process uploaded file with validation
  const handleFile = (file) => {
    // File type validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload only image files');
      return;
    }

    // File size validation (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCreateCharacter = async () => {
    if (!newCharacter.name.trim()) {
      toast.error("Please enter a character name", 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await axiosPrivate.post("/generate-character-image", {
        name: newCharacter.name,
        description: newCharacter.description,
        story_id: parseInt(id)
      });

      if (response.data.success) {
        // Store the generated character and switch to preview mode
        setGeneratedCharacter(response.data.character);
        setShowPreview(true); // Show preview in same dialog
        
        toast.success("Character created successfully!");
      } else {
        toast.error(response.data.message || "Failed to create character");
      }
    } catch (err) {
      console.error('Error creating character:', err);
      toast.error(err.response?.data?.message || "Failed to create character. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (!generatedCharacter) return;

    setIsRegenerating(true);
    
    try {
      const response = await axiosPrivate.post("/regenerate-character", {
        character_id: generatedCharacter.id,
        name: newCharacter.name,
        description: newCharacter.description
      });

      if (response.data.success) {
        // Force image refresh by updating both character and refresh counter
        setGeneratedCharacter(response.data.character);
        setImageRefresh(prev => prev + 1);
        
        console.log('New image URL:', response.data.character.image_url);
        toast.success("Character image regenerated successfully!");
      } else {
        toast.error(response.data.message || "Failed to regenerate character image");
      }
    } catch (err) {
      console.error('Error regenerating character:', err);
      toast.error(err.response?.data?.message || "Failed to regenerate character image. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleUploadCharacter = async () => {
  if (!newCharacter.name.trim()) {
      toast.error("Please enter a character name", 'error');
      return;
    }

    if (!uploadedImage.file) {
      toast.error("Please upload an image", 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage.file);
      formData.append('name', newCharacter.name);
      formData.append('description', newCharacter.description);
      formData.append('story_id', parseInt(id));

      const response = await axiosPrivate.post("/upload-character-image", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // Store the uploaded character and switch to preview mode
        setGeneratedCharacter(response.data.character);
        setShowPreview(true);
        
        toast.success("Character created successfully!");
        // navigate("/");
      } else {
        toast.error(response.data.message || "Failed to upload character");
      }
    } catch (err) {
      console.error('Error uploading character:', err);
      toast.error(err.response?.data?.message || "Failed to upload character. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewNext = () => {
    // Add the character to the list
    if (generatedCharacter) {
      setCharacters(prev => [...prev, generatedCharacter]);
    }
    
    // Close dialog and reset all states
    setIsCreateDialogOpen(false);
    setShowPreview(false);
    setNewCharacter({ name: "", description: "" });
    setGeneratedCharacter(null);
    setUploadedImage({
      file: null,
      preview: null,
      name: '',
      size: 0
    });
    
    // Navigate to home
    navigate("/");
  };

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        setError(null);

        const story_id = parseInt(id)
        console.log("story 2", story_id)
        
        const response = await axiosPrivate.get(`/get-story-characters?story_id=${story_id}`);
        
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

    const character_id = characterToDelete.id; 

    try {
      console.log("Sending:", { character_id });

      const response = await axiosPrivate.post(`/delete-character`, {
        character_id
      });
      setCharacters(characters.filter(
        character => character.id !== character_id
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
    setShowPreview(false); 
    setNewCharacter({ name: "", description: "" });
    setGeneratedCharacter(null); 
    setUploadedImage({
      file: null,
      preview: null,
      name: '',
      size: 0
    });
    setDragActive(false);
    setImageRefresh(0);
  };

  const handleNext = () => {
    if (isNextEnabled) {
      // Handle next action here
      toast.success("Proceeding to next step!");
    }
  };

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
    setShowCharacterPreview(true);
  };

const closeCharacterPreview = () => {
  setShowCharacterPreview(false);
  setSelectedCharacter(null);
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
        {Array.isArray(characters) && characters.length > 0 && characters.map((character) => (
          <div 
            key={character.id || character._id || Math.random()} 
            className="character-card"
            onClick={() => handleCharacterClick(character)} // Add this
            style={{ cursor: 'pointer' }} // Add this for better UX
          >
            <div className="character-image">
              <div className="character-overlay"></div>
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
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    console.log('Edit character:', character.id);
                  }}
                >
                  <EditOutlinedIcon className="icon-xs" />
                </button>
                <button 
                  className="action-btn action-danger" 
                  title="Delete Character"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleDeleteClick(character);
                  }}
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
                {showPreview ? "Character Preview" : "Create New Character"}
              </h2>
              <div className="header-actions">
                {/* Only show mode switch when NOT in preview mode */}
                {!showPreview && (
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
                )}

                <button className="dialog-close" onClick={closeDialog}>
                  <CloseIcon className="icon-sm" />
                </button>
              </div>
              <p className="dialog-description text-start">
                {showPreview ? "Review your generated character" : "Design a unique character for your stories"}
              </p>
            </div>

            {/* --- Body --- */}
            <div className="dialog-body">
              {showPreview ? (
                /* PREVIEW SECTION - Replaces form fields */
                <div className="preview-section">
                  <div className="character-preview">
                    <div className="preview-image-wrapper">
                      <img 
                        src={`${generatedCharacter?.image_url}?refresh=${imageRefresh}&t=${new Date().getTime()}`}
                        alt={generatedCharacter?.name}
                        className="preview-character-image"
                        key={`character-${generatedCharacter?.id}-${imageRefresh}`}
                      />
                    </div>
                    <div className="preview-details">
                      <h3 className="preview-character-name">{generatedCharacter?.name}</h3>
                      <p className="preview-character-description">{generatedCharacter?.description}</p>
                    </div>
                  </div>
                  
                  <div className="preview-actions">
                    {dialogMode === "generate" && (
                      <button
                        onClick={handleRegenerateImage}
                        disabled={isRegenerating}
                        className="btn-outline btn-full"
                      >
                        {isRegenerating ? (
                          <>
                            <div className="loading-spinner"></div> Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshIcon className="icon-sm" /> Regenerate Image
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={handlePreviewNext}
                      className="btn-primary btn-full"
                    >
                      Next
                      <EastRoundedIcon className="icon-sm" />
                    </button>
                  </div>
                </div>
              ) : (
                /* FORM SECTION - Original name/description fields */
                <>
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
                      {/* No additional content needed for generate mode */}
                    </div>
                  ) : (
                    <div className="upload-section">
                      <div
                        className={`character-upload-area ${dragActive ? 'drag-active' : ''} ${uploadedImage.file ? 'has-image' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={!uploadedImage.file ? onButtonClick : undefined}
                      >
                        {!uploadedImage.file ? (
                          <>
                            <div className="upload-character-icon">
                              <UploadFileIcon className="icon-lg" />
                            </div>
                            <h3 className="upload-title">Upload Character Image</h3>
                            <p className="upload-description">Drag and drop your image here, or click to browse</p>
                            <p className="upload-format">Supported formats: PNG, JPEG, JPG, WEBP (Max 5MB)</p>
                            <button
                              className="choose-character-image-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onButtonClick();
                              }}
                              type="button"
                            >
                              <ImageOutlinedIcon className="icon-sm" />
                              Choose Image
                            </button>
                          </>
                        ) : (
                          <div className="image-preview-container">
                            <div className="image-actions">
                              <button
                                className="action-btn replace-btn"
                                onClick={replaceImage}
                                title="Replace image"
                                type="button"
                              >
                                <RefreshIcon className="icon-xs" />
                              </button>
                              <button
                                className="action-btn remove-btn"
                                onClick={removeImage}
                                title="Remove image"
                                type="button"
                              >
                                <CloseIcon className="icon-xs" />
                              </button>
                            </div>
                            <div className="uploaded-image">
                              <img src={uploadedImage.preview} alt={uploadedImage.name} />
                            </div>
                            <div className="image-details">
                              <p className="image-name">{uploadedImage.name}</p>
                              <p className="image-size">{formatFileSize(uploadedImage.size)}</p>
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
                    </div>
                  )}

                  {/* Actions */}
                  <div className="dialog-actions">
                    <button
                      onClick={dialogMode === "upload" ? handleUploadCharacter : handleCreateCharacter}
                      disabled={isGenerating || !newCharacter.name.trim() || (dialogMode === "upload" && !uploadedImage.file)}
                      className="btn-primary btn-full"
                    >
                      {isGenerating ? (
                        <>
                          <div className="loading-spinner"></div> {dialogMode === "upload" ? "Uploading..." : "Generating..."}
                        </>
                      ) : (
                        <>
                          {dialogMode === "upload" ? (
                            <>
                              <UploadFileIcon className="icon-sm" /> Upload Character
                            </>
                          ) : (
                            <>
                              <AutoFixHighIcon className="icon-sm" /> Generate Character
                            </>
                          )}
                        </>
                      )}
                    </button>
                    <button onClick={closeDialog} className="btn-ghost btn-full">
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal - keeping existing code */}
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

      {showCharacterPreview && selectedCharacter && (
        <div className="dialog-overlay" onClick={closeCharacterPreview}>
          <div className="character-preview-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="character-preview-header">
              <button className="dialog-close" onClick={closeCharacterPreview}>
                <CloseIcon className="icon-sm" />
              </button>
            </div>
            
            <div className="character-preview-content">
              <div className="character-preview-image-container">
                <img 
                  src={selectedCharacter.image_url}
                  alt={selectedCharacter.name}
                  className="character-preview-full-image"
                />
              </div>
              
              <div className="character-preview-info">
                <h3 className="character-preview-name">{selectedCharacter.name}</h3>
                {selectedCharacter.description && (
                  <p className="character-preview-desc">{selectedCharacter.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCharacters;
