import React, { useState } from 'react';
// Material UI Icons
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import '../../Css/CreateCharacters.css';

const mockCharacters = [
  {
    id: 1,
    name: "Aria Shadowheart",
    description: "A mysterious elven archer with silver hair and piercing blue eyes. Master of stealth and ancient magic.",
    story: "The Enchanted Kingdom",
    type: "Protagonist",
    image: "/lovable-uploads/15b38244-0823-4576-bfe7-bf7106f9a346.png"
  },
  {
    id: 2,
    name: "Commander Rex",
    description: "A battle-hardened space marine with cybernetic enhancements and unwavering loyalty.",
    story: "Space Pirates",
    type: "Supporting",
    image: "/lovable-uploads/15b38244-0823-4576-bfe7-bf7106f9a346.png"
  },
  {
    id: 3,
    name: "Dr. Elena Voss",
    description: "Brilliant scientist turned detective in a cyberpunk world. Haunted by her past discoveries.",
    story: "Cyberpunk Detective",
    type: "Protagonist",
    image: "/lovable-uploads/15b38244-0823-4576-bfe7-bf7106f9a346.png"
  }
];

function CreateCharacters() {
  const [characters] = useState(mockCharacters);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    description: "",
    story: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const handleCreateCharacter = async () => {
    if (!newCharacter.name.trim()) {
      showToast("Please enter a character name", 'error');
      return;
    }
    
    if (!newCharacter.description.trim()) {
      showToast("Please enter a character description", 'error');
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call for character creation and image generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    showToast("Character created successfully!");
    setIsGenerating(false);
    setIsCreateDialogOpen(false);
    setNewCharacter({ name: "", description: "", story: "" });
  };

  const handleGenerateImage = async () => {
    if (!newCharacter.description.trim()) {
      showToast("Please add a description first", 'error');
      return;
    }
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    showToast("Character image generated!");
    setIsGenerating(false);
  };

  const closeDialog = () => {
    setIsCreateDialogOpen(false);
    setNewCharacter({ name: "", description: "", story: "" });
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
        <button
          className="btn-primary btn-large"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <AddRoundedIcon className="icon-sm" />
          Create Character
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
        {characters.map((character) => (
          <div key={character.id} className="character-card">
            <div className="character-image">
              <div className="character-overlay"></div>
              {/* <span className="character-type-badge">
                {character.type}
              </span> */}
              <span className="character-story-badge">
                {character.story}
              </span>
            </div>
            
            <div className="character-header">
              <h3 className="character-title">{character.name}</h3>
              <p className="character-description">{character.description}</p>
            </div>
            
            <div className="character-footer">
              <div className="character-actions">
                <button className="action-btn" title="Edit Character">
                  <EditOutlinedIcon className="icon-xs" />
                </button>
                <button className="action-btn action-danger" title="Delete Character">
                  <DeleteOutlineIcon className="icon-xs" />
                </button>
              </div>
              <button className="btn-outline btn-small">
                {/* Use in Scene */}
                Select
              </button>
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
          <button 
            className="btn-primary btn-large"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Your First Character
          </button>
        </div>
      )}

      {/* Create Character Dialog */}
      {isCreateDialogOpen && (
        <div className="dialog-overlay" onClick={closeDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">
                <PersonOutlineIcon className="icon-sm" />
                Create New Character
              </h2>
              <p className="dialog-description text-start">
                Design a unique character for your stories
              </p>
              <button className="dialog-close" onClick={closeDialog}>
                <CloseIcon className="icon-sm" />
              </button>
            </div>
            
            <div className="dialog-body">
              <div className="form-group">
                <label htmlFor="char-name" className="form-label">Character Name</label>
                <input
                  id="char-name"
                  type="text"
                  placeholder="Enter character name..."
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="char-description" className="form-label">Character Description</label>
                <textarea
                  id="char-description"
                  placeholder="Describe your character's appearance, personality, and background..."
                  value={newCharacter.description}
                  onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                  className="form-textarea"
                  rows="4"
                />
              </div>

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

              <div className="dialog-actions">
                <button
                  onClick={handleCreateCharacter}
                  disabled={isGenerating}
                  className="btn-primary btn-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="loading-spinner"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <AutoFixHighIcon className="icon-sm" />
                      Create Character
                    </>
                  )}
                </button>
                <button
                  onClick={closeDialog}
                  className="btn-ghost btn-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default CreateCharacters