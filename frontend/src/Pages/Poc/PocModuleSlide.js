import React from 'react'
import '../../Css/PocModuleSlide.css'
const modules = [
  {
    id: 1,
    title: "Introduction to POC",
    description: "Overview of the proof-of-concept module structure.",
    thumbnail: null,
  },
  {
    id: 2,
    title: "Module 1 — Setup",
    description: "Learn how to configure and initialize the POC environment.",
    thumbnail: null,
  },
  {
    id: 3,
    title: "Module 2 — Workflow",
    description: "Deep dive into module workflows and execution steps.",
    thumbnail: null,
  }
];

function PocModuleSlide() {
  return (
    <div className="poc-modules-container mt-5">
      {modules.map((module) => (
        <div key={module.id} className="poc-card-wrapper">
          
          <div className="poc-card-thumbnail">
            {module.thumbnail ? (
              <img
                src={module.thumbnail}
                alt={module.title}
                className="poc-card-image"
              />
            ) : (
              <div className="poc-card-image-placeholder">
                {module.title}
              </div>
            )}

            <div className="poc-card-overlay">
              <span className="poc-card-badge">Module</span>
            </div>
          </div>

          <div className="poc-card-content">
            <h3 className="poc-card-title">{module.title}</h3>
            <p className="poc-card-description">{module.description}</p>
          </div>

        </div>
      ))}
    </div>
  );
}

export default PocModuleSlide;
