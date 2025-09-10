import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../../Css/CreateStories.css';
// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { axiosPrivate, axiosNoAUth } from '../../API\'s/axios';
import { toast } from 'react-toastify';
import Masonry from "react-masonry-css";

// Import your style images
import styleImage44 from '../../images/style/Realistic.png';
import styleImage45 from '../../images/style/Cinematic.png';
import styleImage46 from '../../images/style/Anime2.png';
import styleImage47 from '../../images/style/digital-painting.png';
import styleImage48 from '../../images/style/Watercolor.png';
import styleImage49 from '../../images/style/Cyberpunk.png';
import styleImage50 from '../../images/style/Fantasy.png';
import styleImage51 from '../../images/style/sketch.png';

function CreateStories() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedStyleName, setSelectedStyleName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isStylePopupOpen, setIsStylePopupOpen] = useState(false);
  const [styleList, setStyleList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Get story ID from URL params

  // Check if we're in edit mode
  const isEditMode = Boolean(id);

  const predefinedStyles = [
    { id: 44, style_name: "Realistic", style_image: styleImage44 },
    { id: 45, style_name: "Cinematic", style_image: styleImage45 },
    { id: 46, style_name: "Anime", style_image: styleImage46 },
    { id: 47, style_name: "Digital Painting", style_image: styleImage47 },
    { id: 48, style_name: "Watercolor", style_image: styleImage48 },
    { id: 49, style_name: "Cyberpunk", style_image: styleImage49 },
    { id: 50, style_name: "Fantasy", style_image: styleImage50 },
    { id: 51, style_name: "Sketch", style_image: styleImage51 }
  ];

  const fetchAllStyles = async () => {
    try {
      const response = await axiosNoAUth.post('/styles');
      if (response.data.success) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching styles:", error);
      return [];
    }
  };

  // Fetch existing story data for edit mode
  const fetchStoryData = async (storyId) => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(`/get-story/${storyId}`);
      
      if (response.data.success) {
        const story = response.data.story;
        setTitle(story.name || "");
        setDescription(story.description || "");
        setSelectedStyle(story.style_id);
        
        // Find and set the style name
        const allStyles = [...await fetchAllStyles(), ...predefinedStyles];
        const selectedStyleData = allStyles.find(style => style.id === story.style_id);
        if (selectedStyleData) {
          setSelectedStyleName(selectedStyleData.style_name);
        }
      } else {
        toast.error("Failed to load story data");
        navigate("/u/stories");
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      toast.error("Failed to load story data");
      navigate("/u/stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeComponent = async () => {
      // Fetch styles first
      const dbStyles = await fetchAllStyles();
      setStyleList([...dbStyles, ...predefinedStyles]);

      // If in edit mode, fetch story data
      if (isEditMode) {
        await fetchStoryData(id);
      }
    };

    initializeComponent();
  }, [id, isEditMode]);

  const handleStyleSelect = (style) => {
    setSelectedStyle(style.id);
    setSelectedStyleName(style.style_name);
    setIsStylePopupOpen(false);
  };

  const handleCreateStory = async () => {
    if (!title.trim()) {
      toast.error("Please enter a story title", "error");
      return;
    }

    if (!selectedStyle) {
      toast.error("Please select a story style", "error");
      return;
    }

    setIsCreating(true);

    try {
      let response;
      
      if (isEditMode) {
        // Update existing story
        response = await axiosPrivate.post(`/update-story/${id}`, {
          name: title,
          description,
          style_id: selectedStyle
        });
      } else {
        // Create new story
        response = await axiosPrivate.post("/create-story", {
          name: title,
          description,
          style_id: selectedStyle
        });
      }

      if (response?.data?.success) {
        toast.success(
          isEditMode 
            ? "Story updated successfully!" 
            : "Story created successfully!", 
          "success"
        );

        if (isEditMode) {
          // Navigate back to stories list after update
          navigate("/u/stories");
        } else {
          // Navigate to characters page after creation
          const newStoryId = response.data.story?.id;
          console.log("new story id", newStoryId);
          navigate(`/u/stories/${newStoryId}/characters`, { replace: true });
        }
      } else {
        toast.error(
          response?.data?.message || 
          `Failed to ${isEditMode ? 'update' : 'create'} story`, 
          "error"
        );
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} story:`, error);
      toast.error(
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const getSelectedStyleData = () => {
    return styleList.find(style => style.id === selectedStyle);
  };

  // Show loading state when fetching story data in edit mode
  if (isEditMode && loading) {
    return (
      <div className="create-story-container mt-5">
        <div className="create-story-header p-relative">
          <Link to="/u/stories" className="link-unstyled position-absolute top-0 start-0">
            <button className="btn-ghost">
              <ArrowBackIcon className="icon-sm" />
            </button>
          </Link>
          <div className="header-text">
            <h1 className="page-title">Loading Story...</h1>
          </div>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 1rem',
          color: '#718096'
        }}>
          <p>Loading story data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-story-container mt-5">
      {/* Header */}
      <div className="create-story-header p-relative">
        <Link to="/u/stories" className="link-unstyled position-absolute top-0 start-0">
          <button className="btn-ghost">
            <ArrowBackIcon className="icon-sm" />
          </button>
        </Link>
        <div className="header-text">
          <h1 className="page-title">
            {isEditMode ? "Edit Story" : "Create New Story"}
          </h1>
          <p className="page-subtitle">
            {isEditMode 
              ? "Update your story details and settings"
              : "Start your creative journey with AI-powered storytelling"
            }
          </p>
        </div>
      </div>

      {/* Single Card with Two Column Layout */}
      <div className="form-card">
        <div className="card-header d-flex flex-column">
          <h2 className="card-title">
            {isEditMode ? (
              <>
                <EditIcon className="icon-sm" />
                Edit Story Details
              </>
            ) : (
              <>
                <AutoFixHighIcon className="icon-sm" />
                Story Details
              </>
            )}
          </h2>
          <p className="card-description">
            {isEditMode 
              ? "Update the basic information and style for your story"
              : "Provide the basic information and style for your story"
            }
          </p>
        </div>

        <div className="card-two-column">
          {/* Left Column - Form */}
          <div className="form-column">
            <div className="card-content">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Story Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter your story title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">Story Description</label>
                <textarea
                  id="description"
                  placeholder="Describe your story's plot, theme, or setting..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  rows="5"
                />
                <p className="form-help">
                  This will help the AI understand your story's context
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Style Selection */}
          <div className="style-column">
            <div className="card-content">
              {selectedStyle ? (
                <div className="style-selected">
                  <div className="style-selected-content">
                    <div className="selected-style-preview">
                      <img 
                        src={getSelectedStyleData()?.style_image} 
                        alt={selectedStyleName}
                        className="selected-style-image"
                      />
                    </div>
                    <h3 className="style-selected-title">Style Selected</h3>
                    <p className="style-selected-text">"{selectedStyleName}"</p>
                    <button 
                      onClick={() => setIsStylePopupOpen(true)}
                      className="btn-outline btn-sm"
                    >
                      Change Style
                    </button>
                  </div>
                </div>
              ) : (
                <div className="style-empty">
                  <div className="style-empty-content">
                    <div className="style-empty-icon">
                      <PaletteOutlinedIcon className="empty-icon" />
                    </div>
                    <h3 className="style-empty-title">Choose Your Style</h3>
                    <p className="style-empty-text">
                      Select a visual style that matches your story's theme and atmosphere
                    </p>
                    <button 
                      onClick={() => setIsStylePopupOpen(true)}
                      className="btn-outline"
                    > 
                      <span className='gradient-text'>
                        <PaletteOutlinedIcon className="icon-sm" />
                        Browse Styles
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Button Section - Moved outside columns */}
          <div className="button-wrapper">
            <div className="button-group">
              <button
                onClick={handleCreateStory}
                disabled={isCreating}
                className="btn-primary btn-large justify-content-center"
              >
                {isCreating ? (
                  <>
                    <div className="loading-spinner"></div>
                    {isEditMode ? "Updating Story..." : "Creating Story..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <>
                        <EditIcon className="icon-sm" />
                        Update Story
                      </>
                    ) : (
                      <>
                        <AutoFixHighIcon className="icon-sm" />
                        Create Story
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Info - Only show in create mode */}
      {!isEditMode && (
        <div className="info-card">
          <div className="info-content">
            <h3 className="info-title">What happens next?</h3>
            <p className="info-description">
              After creating your story, you'll be able to:
            </p>
            <ul className="info-list">
              <li>• Create and customize characters with AI assistance</li>
              <li>• Generate scenes using your characters</li>
              <li>• Edit and refine your story elements</li>
              <li>• Export your completed story</li>
            </ul>
          </div>
        </div>
      )}

      {/* Style Selection Popup */}
      {isStylePopupOpen && (
        <div className="ig-popup-overlay" onClick={() => setIsStylePopupOpen(false)}>
          <div className="settings-pop-up pop-up-container white-bg mt-4" onClick={(e) => e.stopPropagation()}>
            <div className="pop-up-style-container">
              <div className="pop-up-title d-flex justify-content-between align-items-center">
                <h4 className="h-3">Select Story Style</h4>
                <CloseOutlinedIcon 
                  className="material-symbols-outlined pop-up-close d-flex align-items-center justify-content-center" 
                  onClick={() => setIsStylePopupOpen(false)}
                >
                  close
                </CloseOutlinedIcon>
              </div>
              <div className="style-popup">
                <Masonry
                  breakpointCols={{ default: 4, 600: 3, 300: 2 }}
                  className="platform-gallery-masonry"
                  columnClassName="platform-gallery-column"
                >
                  {styleList.length > 0 ? (
                    styleList.map((style, index) => (
                      <div 
                        className={`style-card mt-md-2 ${style.id === selectedStyle && "active"}`} 
                        key={index}
                      >
                        <img 
                          src={style.style_image} 
                          onClick={() => handleStyleSelect(style)} 
                          alt="style" 
                        />
                        <h3 
                          onClick={() => handleStyleSelect(style)} 
                          className='style-name-heading mt-md-1'
                        >
                          {style.style_name}
                        </h3>
                      </div>
                    ))
                  ) : (
                    <p className='text-center w-100'>No styles available</p>
                  )}
                </Masonry>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateStories;
