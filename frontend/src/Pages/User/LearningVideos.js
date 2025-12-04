import React from 'react';
import '../../Css/LearningVideos.css';
import { CirclePlay, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MODULES = [
  { id: 1, title: "doc 1", lessons: 10, description: "Open doc 1 to learn the modules provided" },
  { id: 2, title: "doc 2", lessons: 18, description: "Open doc 2 to learn the modules provided" },
  { id: 3, title: "doc 3", lessons: 12, description: "Open doc 3 to learn the modules provided" },
  { id: 4, title: "doc 4", lessons: 15, description: "Open doc 4 to learn the modules provided" },
  { id: 5, title: "doc 5", lessons: 20, description: "Open doc 5 to learn the modules provided" }
];

function LearningVideos() {
  const navigate = useNavigate();

  const handleCreateModule = () => {
    navigate("/u/content-type")
  }

  const handleModuleSelect = (id) => {
    navigate(`/u/content-modules/${id}`);
  };

  return (
    <div className="learning-videos-container mt-5">
      <div className="page-header">
        <h1 className="page-title">Learning Modules</h1>
        <p className="page-subtitle">Create and manage your educational content</p>
      </div>
      <div className="modules-list">
        {/* Create New Module (styled as a card) */}
        <div onClick={handleCreateModule} className="module-card create-module-card" tabIndex={0}>
            <div className="create-card-content">
                <div className="create-icon">
                <Plus size={48} />
                </div>
                <div className="create-title">Create New Module</div>
                <div className="create-subtitle">Start building a new learning experience</div>
            </div>
        </div>


        {/* Generated Modules List */}
        {MODULES.map(module => (
          <div key={module.id} className="module-card">
            <div className="module-header">
              <span className="icon-play"><CirclePlay size={24} /></span>
              <div className="lessons-info">
                <span className="lessons-label">Lessons</span>
                <span className="lessons-count">{module.lessons}</span>
              </div>
            </div>
            <div className="module-content">
              <h3 className="module-title">{module.title}</h3>
              <p className="module-description">{module.description}</p>
              <button 
                className="continue-btn mt-4"
                onClick={() => handleModuleSelect(module.id)}
              >
                Continue Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LearningVideos;
