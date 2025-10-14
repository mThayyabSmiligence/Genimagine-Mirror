import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../../Css/CreateStories.css';
// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
// Material UI Components
import { Switch } from '@mui/material';
import { axiosPrivate, axiosNoAUth } from '../../API\'s/axios';
import { toast } from 'react-toastify';
import Masonry from "react-masonry-css";
// Import the new slider component
import NumberOfScenesSlider from '../../Components/CommonComponents/NumberOfScenesSlider';

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
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [numberOfScenes, setNumberOfScenes] = useState(3);
  
  const navigate = useNavigate();
  const { id } = useParams();

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

  const fetchStoryData = async (storyId) => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(`/get-story/${storyId}`);
      
      if (response.data.success) {
        const story = response.data.story;
        setTitle(story.name || "");
        setDescription(story.description || "");
        setSelectedStyle(story.style_id);
        setAutoGenerate(story.auto_generate || false);
        setNumberOfScenes(story.number_of_scenes || 3);
        
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
      const dbStyles = await fetchAllStyles();
      setStyleList([...dbStyles, ...predefinedStyles]);

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

  const handleAutoGenerateChange = (event) => {
    setAutoGenerate(event.target.checked);
    if (!event.target.checked) {
      setDescription("");
    }
  };

  const handleScenesChange = (newValue) => {
    setNumberOfScenes(newValue);
  };

  const handleCreateStory = async () => {
    if (!title.trim()) {
      toast.error("Please enter a story title");
      return;
    }

    if (autoGenerate && !description.trim()) {
      toast.error("Please enter a story description when auto-generate is enabled");
      return;
    }

    if (!selectedStyle) {
      toast.error("Please select a story style");
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
          style_id: selectedStyle,
          auto_generate: autoGenerate,
          number_of_scenes: numberOfScenes
        });
      } else {
        // Create new story
        if (autoGenerate) {
          // Call auto-story API for automated generation
          response = await axiosPrivate.post("/auto-story", {
            name: title,
            description: description,
            total_scenes: numberOfScenes,
            style_id: selectedStyle
          });
        } else {
          // Manual story creation
          response = await axiosPrivate.post("/create-story", {
            name: title,
            description,
            style_id: selectedStyle,
            auto_generate: autoGenerate,
            number_of_scenes: numberOfScenes
          });
        }
      }

      if (response?.data?.success) {
        const newStoryId = response.data.story?.id;
        const newStory = response.data.story;
        
        toast.success(
          isEditMode 
            ? "Story updated successfully!" 
            : autoGenerate
              ? "Automated story generation started!"
              : "Story created successfully!"
        );

        if (isEditMode) {
          // Always go back to stories page after editing
          navigate("/u/stories", { replace: true });
        } else {
          if (autoGenerate) {
            // For auto-generated stories, navigate to stories page where status badges are shown
            console.log('Auto-generation started, navigating to stories page...');
            navigate("/u/stories", { 
              replace: true,
              state: {
                newAutoStory: {
                  id: newStory.id,
                  name: newStory.name,
                  description: newStory.description,
                  auto_generate: true,
                  status: newStory.status || 'in-progress',
                  total_scenes: newStory.total_scenes || numberOfScenes,
                  generated_scenes: newStory.generated_scenes || 0,
                  characters: newStory.characters || 0,
                  character_count: 0,
                  scene_count: 0,
                  created_at: newStory.createdAt || new Date().toISOString(),
                  style_id: newStory.style_id
                },
                justCreated: true // Flag to indicate this was just created
              }
            });
          } else {
            // For manual stories, navigate to characters page as before
            navigate(`/u/stories/${newStoryId}/characters`, { 
              replace: true,
              state: { 
                isAutoGenerated: false,
                totalScenes: numberOfScenes 
              }
            });
          }
        }
      } else {
        toast.error(
          response?.data?.message || 
          `Failed to ${isEditMode ? 'update' : 'create'} story`
        );
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} story:`, error);
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const getSelectedStyleData = () => {
    return styleList.find(style => style.id === selectedStyle);
  };

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
          <div className="loading-spinner"></div>
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
          <h2 className="card-title w-100">
            {isEditMode ? (
              <>
                <EditIcon className="icon-sm" />
                Edit Story Details
              </>
            ) : (
              <>
              <div className='d-flex justify-content-between w-100 align-items-center'>
                <div className='d-flex align-items-center'>
                  <AutoFixHighIcon className="icon-sm me-1" />
                  Story Details
                </div>

                <div className='auto-generate-container'>
                  <div className='auto-generate-badge'>
                    <AutoAwesomeIcon className="spark-icon me-2"/>
                    Auto Generate
                    <Switch
                      checked={autoGenerate}
                      onChange={handleAutoGenerateChange}
                      size="small"
                      sx={{
                        marginLeft: 1,
                        width: 42,
                        height: 24,
                        padding: 0,
                        '& .MuiSwitch-track': {
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          opacity: 1,
                          borderRadius: 12,
                          border: '2px solid rgba(255,255,255,0.3)',
                          transition: 'all 0.3s ease',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: '2px solid rgba(255,255,255,1)',
                          opacity: 1,
                        },
                        '& .MuiSwitch-thumb': {
                          backgroundColor: '#cbd5e0',
                          width: 18,
                          height: 18,
                          border: '2px solid #ffffff',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                          transition: 'all 0.3s ease',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb': {
                          backgroundColor: '#667eea',
                          border: '2px solid #ffffff',
                          boxShadow: '0 3px 8px rgba(102, 126, 234, 0.4)',
                          transform: 'scale(1.1)',
                        },
                        '& .MuiSwitch-switchBase': {
                          margin: 0.4,
                          padding: 0,
                          transform: 'translateX(2px)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                          '&.Mui-checked': {
                            transform: 'translateX(18px)',
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked:hover': {
                          backgroundColor: 'rgba(255,255,255,0.12)',
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
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
                <label htmlFor="description" className="form-label">
                  Story Description
                  {autoGenerate && <span className="required-indicator"> *</span>}
                </label>
                <textarea
                  id="description"
                  placeholder={
                    autoGenerate 
                      ? "Describe your story's plot, theme, or setting... (Required for auto-generation)"
                      : "Describe your story's plot, theme, or setting..."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`form-textarea ${autoGenerate ? 'required' : ''}`}
                  rows="5"
                  required={autoGenerate}
                />
                <p className="form-help">
                  {autoGenerate 
                    ? "This will help the AI understand your story's context and generate scenes accordingly"
                    : "This will help the AI understand your story's context"
                  }
                </p>
              </div>

              {/* Number of Scenes Slider - Only show when auto-generate is enabled */}
              {autoGenerate && !isEditMode && (
                <div className="form-group">
                  <label className="form-label">Number of Scenes</label>
                  <NumberOfScenesSlider
                    value={numberOfScenes}
                    onChange={handleScenesChange}
                    min={1}
                    max={10}
                    disabled={false}
                  />
                  <p className="form-help">
                    The AI will automatically generate {numberOfScenes} scene{numberOfScenes !== 1 ? 's' : ''} based on your description
                  </p>
                </div>
              )}
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

          {/* Button Section */}
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
                    {isEditMode 
                      ? "Updating Story..." 
                      : autoGenerate 
                        ? "Starting Automated Generation..." 
                        : "Creating Story..."
                    }
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <>
                        <EditIcon className="icon-sm" />
                        Update Story
                      </>
                    ) : autoGenerate ? (
                      <>
                        <AutoAwesomeIcon className="icon-sm" />
                        Generate Story Automatically
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

      {/* Next Steps Info */}
      {!isEditMode && (
        <div className="info-card">
          <div className="info-content">
            <h3 className="info-title">What happens next?</h3>
            <p className="info-description">
              After {autoGenerate ? 'generating' : 'creating'} your story, you'll be able to:
            </p>
            <ul className="info-list">
              {autoGenerate ? (
                <>
                  <li>• Review and edit the automatically generated {numberOfScenes} scene{numberOfScenes !== 1 ? 's' : ''}</li>
                  <li>• Customize characters created by AI</li>
                  <li>• Refine the generated story elements</li>
                  <li>• Export your completed story</li>
                </>
              ) : (
                <>
                  <li>• Create and customize characters with AI assistance</li>
                  <li>• Generate scenes using your characters</li>
                  <li>• Edit and refine your story elements</li>
                  <li>• Export your completed story</li>
                </>
              )}
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
