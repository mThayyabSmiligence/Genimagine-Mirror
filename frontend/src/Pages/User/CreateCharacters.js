import React, { useEffect, useState, useRef, useCallback } from 'react';
// Material UI Icons
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LoopRoundedIcon from '@mui/icons-material/LoopRounded';
import CloseIcon from '@mui/icons-material/Close';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { toast } from 'react-toastify';
import '../../Css/CreateCharacters.css';
import { axiosPrivate } from '../../API\'s/axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import DeleteConfirmationModal from '../../Components/CommonComponents/DeleteConfirmationModal';

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
  const [showCharacterPreview, setShowCharacterPreview] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [isNewCharacter, setIsNewCharacter] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [imageRefresh, setImageRefresh] = useState(0);

  // Story type state
  const [storyType, setStoryType] = useState(null); // 'auto' or 'manual'

  // Auto-generation state
  const [autoGenState, setAutoGenState] = useState({
    isActive: false,
    status: null,
    totalScenes: 0,
    generatedScenes: 0,
    characters: 0,
    lastCharacterCount: 0
  });

  // Use useRef for polling interval to avoid stale closures
  const statusPollingRef = useRef(null);
  
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();

  const isNextEnabled = characters.length >= 1;

  // Character Generation Starting Component
  const CharacterGenerationStarting = () => (
    <div className="character-generation-starting">
      <div className="starting-content">
        <div className="starting-icon">
          <AutoAwesomeIcon className="icon-xxl" style={{ color: '#667eea' }} />
        </div>
        <h3 className="starting-title">🚀 Preparing to Generate Characters</h3>
        <p className="starting-message">
          Setting up the AI to create unique characters for your story. This will take just a moment...
        </p>
        <div className="starting-spinner">
          <div className="simple-spinner"></div>
        </div>
      </div>
    </div>
  );

  // Character Generation In Progress Component
  const CharacterGenerationInProgress = () => (
    <div className="character-generation-in-progress">
      <div className="progress-content">
        <div className="progress-icon">
          <AutoAwesomeIcon className="icon-xxl" style={{ color: '#f59e0b' }} />
        </div>
        <h3 className="progress-title">✨ Characters Will Generate Soon</h3>
        <p className="progress-message">
          AI is analyzing your story and preparing to create characters. Character generation will begin shortly...
        </p>
        <div className="progress-spinner">
          <div className="simple-spinner"></div>
        </div>
      </div>
    </div>
  );

  // Simple Loading Spinner Component
  const SimpleLoadingSpinner = () => (
    <div className="simple-loading-container">
      <div className="simple-spinner-large"></div>
      <p className="loading-text">Loading characters...</p>
    </div>
  );

  // Auto Generation Failed Component
  const AutoGenerationFailed = () => (
    <div className="auto-generation-failed">
      <div className="failed-header">
        <div className="failed-icon">
          <span className="failed-emoji">❌</span>
        </div>
        <div className="failed-content">
          <h3 className="failed-title">Story Generation Failed</h3>
          <p className="failed-message">
            Something went wrong during the automated generation process. You can create characters and scenes manually.
          </p>
        </div>
      </div>
    </div>
  );

  // Simple Loading Character Card Component with spinner
  const LoadingCharacterCard = ({ characterNumber }) => (
    <div className="character-card loading-character">
      <div className="character-image">
        <div className="character-spinner-container">
          <div className="simple-spinner"></div>
        </div>
      </div>
      
      <div className="character-header">
        <h3 className="character-title">Generating Character #{characterNumber}...</h3>
        <p className="character-description">
          AI is creating a unique character
        </p>
      </div>
      
      <div className="character-footer">
        <div className="generating-indicator">
          <div className="simple-spinner-small"></div>
          <span className="generating-text">In Progress</span>
        </div>
      </div>
    </div>
  );

  // FIXED: Fetch story info to determine type
  const fetchStoryInfo = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(`/get-story/${id}`);
      
      if (response.data.success) {
        const story = response.data.story;
        setStoryType(story.type || 'manual'); // Default to manual if no type
        console.log('Story type detected:', story.type || 'manual');
      }
    } catch (error) {
      console.error('Error fetching story info:', error);
      setStoryType('manual'); // Default to manual on error
    }
  }, [id]);

  // Fetch existing characters function
  const fetchExistingCharacters = useCallback(async () => {
    try {
      const story_id = parseInt(id);
      const response = await axiosPrivate.get(`/get-story-characters?story_id=${story_id}`);
      
      const charactersWithSource = (response.data.characters || []).map(char => ({
        ...char,
        imageSource: char.imageSource || 'generated'
      }));
      
      setCharacters(charactersWithSource);
      console.log('Fetched characters:', charactersWithSource.length);
    } catch (err) {
      console.error('Error fetching characters:', err);
    }
  }, [id]);

  // UPDATED: Status checking function - ONLY for auto stories
  const checkStoryStatus = useCallback(async () => {
    if (!id || storyType !== 'auto') return; // Only check status for auto stories
    
    try {
      const response = await axiosPrivate.get(`/story/${id}/status`);
      
      if (response.data.success) {
        const statusData = response.data.data;
        console.log('Auto story status:', statusData);
        
        setAutoGenState(prev => {
          const newState = {
            // UPDATED: Removed 'partially-completed' from active statuses
            isActive: ['in-progress', 'generating-characters', 'generating-scenes'].includes(statusData.status),
            status: statusData.status,
            totalScenes: statusData.total_scenes || prev.totalScenes,
            generatedScenes: statusData.generated_scenes || 0,
            characters: statusData.characters || 0,
            lastCharacterCount: prev.characters
          };
          
          // If character count increased, fetch new characters
          if (statusData.characters > prev.characters) {
            fetchExistingCharacters();
          }
          
          return newState;
        });

        // UPDATED: Stop polling and show toast for completed, failed, OR partially-completed
        if (['completed', 'failed', 'partially-completed'].includes(statusData.status)) {
          // Clear the interval immediately
          if (statusPollingRef.current) {
            clearInterval(statusPollingRef.current);
            statusPollingRef.current = null;
            console.log('Polling stopped for status:', statusData.status);
          }
          
          // UPDATED: Use localStorage to persist toast flags across page navigations
          const completedToastKey = `story-${id}-completed-toast-shown`;
          const failedToastKey = `story-${id}-failed-toast-shown`;
          const partiallyCompletedToastKey = `story-${id}-partially-completed-toast-shown`; // NEW
          
          // Show completed toast only once per story
          if (statusData.status === 'completed' && !localStorage.getItem(completedToastKey)) {
            toast.success('🎉 Story generation completed!');
            localStorage.setItem(completedToastKey, 'true');
          } 
          // Show failed toast only once per story
          else if (statusData.status === 'failed' && !localStorage.getItem(failedToastKey)) {
            toast.error('❌ Story generation failed. Please try again.');
            localStorage.setItem(failedToastKey, 'true');
          }
          // UPDATED: Show partially completed toast only once per story
          else if (statusData.status === 'partially-completed' && !localStorage.getItem(partiallyCompletedToastKey)) {
            toast.success('✅ Story generation partially completed!');
            localStorage.setItem(partiallyCompletedToastKey, 'true');
          }
        }
      }
    } catch (error) {
      console.error('Error checking story status:', error);
      // Stop polling on API errors too
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
        console.log('Polling stopped due to API error');
      }
    }
  }, [id, storyType, fetchExistingCharacters]); // Add storyType dependency

  // FIXED: Modified useEffect for initialization
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, fetch story info to determine type
        await fetchStoryInfo();

        // Fetch existing characters
        await fetchExistingCharacters();
        
      } catch (err) {
        console.error('Error initializing component:', err);
        setError('Failed to load characters. Please try again later.');
        setCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();

    // Cleanup function
    return () => {
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
        console.log('Polling stopped on component unmount');
      }
    };
  }, [id, fetchStoryInfo, fetchExistingCharacters]); // Remove checkStoryStatus from here

  // NEW: Check status after story type is determined
  useEffect(() => {
    if (storyType === 'auto') {
      checkStoryStatus();
    }
  }, [storyType, checkStoryStatus]);

  // UPDATED: Separate useEffect to handle polling based on status changes - ONLY for auto stories
  useEffect(() => {
    if (storyType !== 'auto') return; // Skip polling for manual stories

    // UPDATED: Removed 'partially-completed' from polling conditions
    const shouldPoll = ['in-progress', 'generating-characters', 'generating-scenes'].includes(autoGenState.status);
    
    if (shouldPoll && !statusPollingRef.current) {
      // Start polling if we should poll and aren't already
      console.log('Starting status polling for auto story, status:', autoGenState.status);
      statusPollingRef.current = setInterval(checkStoryStatus, 5000);
    } else if (!shouldPoll && statusPollingRef.current) {
      // Stop polling if we shouldn't poll and we are currently polling
      console.log('Stopping status polling for auto story, status:', autoGenState.status);
      clearInterval(statusPollingRef.current);
      statusPollingRef.current = null;
    }

    // Cleanup when status changes
    return () => {
      if (!shouldPoll && statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
        statusPollingRef.current = null;
      }
    };
  }, [autoGenState.status, checkStoryStatus, storyType]); // Add storyType dependency

  // FIXED: Calculate how many loading cards to show - ONLY for auto stories
  const getLoadingCharacterCards = () => {
    if (storyType !== 'auto' || autoGenState.status !== 'generating-characters') return [];
    
    const loadingCards = [];
    
    // Show loading card for the next character being generated
    // This ensures there's always a loading card visible when status is "generating-characters"
    const nextCharacterNumber = Math.max(autoGenState.characters + 1, characters.length + 1);
    
    loadingCards.push(
      <LoadingCharacterCard key={`loading-${nextCharacterNumber}`} characterNumber={nextCharacterNumber} />
    );
    
    return loadingCards;
  };

  const handleCreateCharacter = async () => {
    if (!newCharacter.name.trim()) {
      toast.error("Please enter a character name");
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
        const newGeneratedCharacter = {
          ...response.data.character,
          imageSource: 'generated'
        };
        
        setGeneratedCharacter(newGeneratedCharacter);
        setImageRefresh(prev => prev + 1);
        setCharacters(prev => [...prev, newGeneratedCharacter]);
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
        const updatedCharacter = {
          ...response.data.character,
          imageSource: 'generated'
        };
        
        setGeneratedCharacter(updatedCharacter);
        setImageRefresh(prev => prev + 1);
        
        setCharacters(prev => 
          prev.map(char => 
            char.id === generatedCharacter.id 
              ? { 
                  ...char, 
                  name: newCharacter.name.trim(),
                  description: newCharacter.description,
                  image_url: updatedCharacter.image_url,
                  imageSource: 'generated',
                  updated_at: new Date().toISOString()
                }
              : char
          )
        );

        if (selectedCharacter && selectedCharacter.id === generatedCharacter.id) {
          setSelectedCharacter({
            ...selectedCharacter,
            image_url: updatedCharacter.image_url,
            name: newCharacter.name.trim(),
            description: newCharacter.description
          });
        }
        
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

  const handleEditClick = (character) => {
    setIsNewCharacter(false);
    setIsEditMode(true);
    setEditingCharacter(character);
    setNewCharacter({
      name: character.name || "",
      description: character.description || ""
    });

    setGeneratedCharacter(character);
    setIsCreateDialogOpen(true);
  };

  const handleOpenRegenerateMode = (character) => {
    setIsNewCharacter(false);
    setIsEditMode(true);
    setEditingCharacter(character);
    setNewCharacter({
      name: character.name || "",
      description: character.description || ""
    });

    setGeneratedCharacter(character);
    setShowCharacterPreview(false);
    setIsCreateDialogOpen(true);
  };

  const handleRegenerateCharacter = async () => {
    if (!editingCharacter || !newCharacter.name.trim()) {
      toast.error("Please enter a character name");
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await axiosPrivate.post("/regenerate-character", {
        character_id: editingCharacter.id,
        name: newCharacter.name.trim(),
        description: newCharacter.description
      });

      if (response.data.success) {
        const updatedCharacter = {
          ...response.data.character,
          name: newCharacter.name.trim(),
          description: newCharacter.description,
          imageSource: 'generated'
        };
        
        setGeneratedCharacter(updatedCharacter);
        setImageRefresh(prev => prev + 1);
        
        setCharacters(prev => 
          prev.map(char => 
            char.id === editingCharacter.id 
              ? { 
                  ...char, 
                  name: newCharacter.name.trim(),
                  description: newCharacter.description,
                  image_url: response.data.character.image_url,
                  imageSource: 'generated',
                  updated_at: new Date().toISOString()
                }
              : char
          )
        );

        if (selectedCharacter && selectedCharacter.id === editingCharacter.id) {
          setSelectedCharacter({
            ...selectedCharacter,
            image_url: response.data.character.image_url,
            name: newCharacter.name.trim(),
            description: newCharacter.description
          });
        }
        
        toast.success("Character regenerated successfully!");
      } else {
        toast.error(response.data.message || "Failed to regenerate character");
      }
    } catch (err) {
      console.error('Error regenerating character:', err);
      toast.error(err.response?.data?.message || "Failed to regenerate character. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (generatedCharacter) {
      if (isEditMode && editingCharacter) {
        setCharacters(prev => 
          prev.map(char => 
            char.id === editingCharacter.id 
              ? { 
                  ...char, 
                  id: editingCharacter.id,
                  name: newCharacter.name.trim(),
                  description: newCharacter.description,
                  image_url: generatedCharacter.image_url,
                  imageSource: generatedCharacter.imageSource || char.imageSource,
                  story_id: char.story_id,
                  created_at: char.created_at,
                  updated_at: new Date().toISOString()
                }
              : char
          )
        );
        
        toast.success("Character updated successfully!");
        
      } else {
        toast.success("Character created successfully!");
      }
    }
    
    closeDialog();
  };

  const handleDeleteClick = (character) => {
    setCharacterToDelete(character);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCharacterToDelete(null);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!characterToDelete) return;

    setIsDeleting(true);
    const character_id = characterToDelete.id; 

    try {
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
    setIsEditMode(false);
    setIsNewCharacter(false);
    setEditingCharacter(null);
    setNewCharacter({ name: "", description: "" });
    setGeneratedCharacter(null);
    setImageRefresh(0);
  };

  const handleNextBtn = () => {
    if (isNextEnabled) {
      navigate(`/u/scenes/create/${id}`)
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

      {/* Show failed state - ONLY for auto stories */}
      {storyType === 'auto' && autoGenState.status === 'failed' && (
        <AutoGenerationFailed />
      )}

      {/* Show loading spinner while fetching data */}
      {loading ? (
        <SimpleLoadingSpinner />
      ) : (
        <>
          <div className='mb-3 d-flex justify-content-end'>
            <button
              className="btn-primary next-btn"
              disabled={!isNextEnabled}
              onClick={handleNextBtn}
              title={!isNextEnabled ? "Create at least one character to proceed" : "Proceed to next step"}
            >
              Next
              <EastRoundedIcon className='icon-sm'/>
            </button>
          </div>

          {/* FIXED: Show different states based on story type and auto-generation status */}
          {storyType === 'auto' && autoGenState.status === 'started' ? (
            <CharacterGenerationStarting />
          ) : storyType === 'auto' && autoGenState.status === 'in-progress' ? (
            <CharacterGenerationInProgress />
          ) : (
            <>
              {/* Characters Grid - Show for manual stories OR completed/failed auto stories */}
              <div className="characters-grid">
                {/* Create New Character Card - Hide during active auto generation, show for manual stories and failed auto stories */}
                {(storyType === 'manual' || !autoGenState.isActive || autoGenState.status === 'failed') && (
                  <div
                    className="create-character-card"
                    onClick={() => {
                      setIsNewCharacter(true);
                      setIsCreateDialogOpen(true);
                    }}
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
                )}

                {/* Character Cards */}
                {Array.isArray(characters) && characters.length > 0 && characters.map((character) => (
                  <div 
                    key={character.id || character._id || Math.random()} 
                    className="character-card"
                    onClick={() => handleCharacterClick(character)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="character-image">
                      {character.image_url ? (
                        <img 
                          src={`${character.image_url}?t=${new Date().getTime()}`} 
                          alt={character.name}
                          className="character-card-image"
                        />
                      ) : (
                        <div className="character-placeholder">
                          <PersonOutlineIcon className="icon-lg" />
                        </div>
                      )}
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
                        {/* UPDATED: Edit Button - Disabled during active auto generation (UPDATED LOGIC) */}
                        {storyType === 'auto' && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status) && autoGenState.isActive ? (
                          <button 
                            className="character-preview-action-btn disabled" 
                            title="Edit not available during generation"
                            disabled
                          >
                            <EditOutlinedIcon className="icon-xs" />
                          </button>
                        ) : (
                          <button 
                            className="character-preview-action-btn" 
                            title="Edit Character"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(character);
                            }}
                          >
                            <EditOutlinedIcon className="icon-xs" />
                          </button>
                        )}
                        
                        {/* UPDATED: Delete Button - Disabled during active auto generation (UPDATED LOGIC) */}
                        {storyType === 'auto' && autoGenState.status && !["completed", "partially-completed", "failed"].includes(autoGenState.status) && autoGenState.isActive ? (
                          <button 
                            className="character-preview-action-btn action-danger disabled" 
                            title="Delete not available during generation"
                            disabled
                          >
                            <DeleteOutlineIcon className="icon-xs" />
                          </button>
                        ) : (
                          <button 
                            className="character-preview-action-btn action-danger" 
                            title="Delete Character"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(character);
                            }}
                          >
                            <DeleteOutlineIcon className="icon-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading Character Cards - Show dynamically based on status - ONLY for auto stories */}
                {getLoadingCharacterCards()}
              </div>

              {/* Empty State - Only show when no characters and not auto-generating */}
              {characters.length === 0 && (storyType === 'manual' || !autoGenState.isActive) && (
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
            </>
          )}
        </>
      )}

      {/* Create Character Dialog */}
      {isCreateDialogOpen && (
        <div className="dialog-overlay" onClick={closeDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="dialog-header">
              <h2 className="dialog-title">
                {isEditMode ? "Edit Character" : "Create New Character"}
              </h2>
              <div className="header-actions">
                <button className="dialog-close" onClick={closeDialog}>
                  <CloseIcon className="icon-sm" />
                </button>
              </div>
              <p className="dialog-description text-start">
                {isEditMode ? "Edit your character details and regenerate the image" : "Design a unique character for your stories"}
              </p>
            </div>

            {/* Body */}
            <div className="dialog-body">
              {/* Character Name */}
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

              {/* Character Description */}
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

              {/* Generated Character Image */}
              {generatedCharacter && (
                <div className="form-group">
                  <label className="form-label">
                    {isEditMode ? "Current Character Image" : "Generated Character Image"}
                  </label>
                  <div className="inline-character-preview">
                    <div className="image-container">
                      {(isRegenerating || isGenerating) ? (
                        <div className="image-loading-placeholder">
                          <div className="loading-spinner"></div>
                          <span className="loading-text">
                            {isRegenerating ? "Regenerating..." : "Generating..."}
                          </span>
                        </div>
                      ) : (
                        <img 
                          src={`${generatedCharacter.image_url}?refresh=${imageRefresh}&t=${new Date().getTime()}`}
                          alt={generatedCharacter.name}
                          className="inline-character-image"
                          key={`character-${generatedCharacter.id}-${imageRefresh}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="dialog-actions">
                {!generatedCharacter ? (
                  <button
                    onClick={isEditMode ? handleRegenerateCharacter : handleCreateCharacter}
                    disabled={isGenerating || !newCharacter.name.trim()}
                    className="btn-primary btn-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="loading-spinner"></div> 
                        {isEditMode ? "Regenerating..." : "Generating..."}
                      </>
                    ) : (
                      <>
                        {isEditMode ? (
                          <>
                            <LoopRoundedIcon className="icon-sm" /> Regenerate Character
                          </>
                        ) : (
                          <>
                            <AutoFixHighIcon className="icon-sm" /> Generate Character
                          </>
                        )}
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={isEditMode ? handleRegenerateCharacter : handleRegenerateImage}
                      disabled={isRegenerating || isGenerating}
                      className="btn-outline btn-full"
                    >
                      {(isRegenerating || isGenerating) ? (
                        <>
                          <div className="loading-spinner"></div> Regenerating...
                        </>
                      ) : (
                        <>
                          <LoopRoundedIcon className="icon-sm" /> Regenerate Image
                        </>
                      )}
                    </button>
                  </>
                )}
                
                <button onClick={closeDialog} className="btn-ghost btn-full">
                  {generatedCharacter && !isEditMode ? "Done" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        itemName={characterToDelete?.name}
        itemType="character"
      />

      {/* Character Preview Modal */}
      {showCharacterPreview && selectedCharacter && (
        <div className="dialog-overlay" onClick={closeCharacterPreview}>
          <div className="character-preview-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="character-preview-header">
              <div className="character-preview-actions">
                <button 
                  className="character-preview-btn regenerate-btn" 
                  onClick={() => handleOpenRegenerateMode(selectedCharacter)}
                  title="Regenerate character"
                  disabled={isRegenerating || isGenerating}
                >
                  <LoopRoundedIcon className="icon-sm" />
                </button>
                <button className="character-preview-btn close-btn" onClick={closeCharacterPreview}>
                  <CloseIcon className="icon-sm" />
                </button>
              </div>
            </div>
            
            <div className="character-preview-content">
              <div className="character-preview-image-container">
                {(isRegenerating || isGenerating) ? (
                  <div className="character-preview-loading-placeholder">
                    <div className="loading-spinner"></div>
                    <span className="loading-text">
                      {isRegenerating ? "Regenerating..." : "Generating..."}
                    </span>
                  </div>
                ) : (
                  <img 
                    src={`${selectedCharacter.image_url}?t=${new Date().getTime()}`}
                    alt={selectedCharacter.name}
                    className="character-preview-full-image"
                  />
                )}
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