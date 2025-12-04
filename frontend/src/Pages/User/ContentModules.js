// src/pages/ContentModules.jsx
import React, { useState } from "react";
import "../../Css/ContentModules.css";
import { ModuleViewer } from "../../Components/LearningVideos/ModuleViewer";
import { useNavigate } from "react-router-dom";


export const SAMPLE_MODULES = [
  {
    id: 1,
    title: "Introduction to the Module",
    description:
      "Learn the fundamentals and get started with the basics of this training module",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
      "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&q=80",
    ],
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: 2,
    title: "Understanding Core Concepts",
    description:
      "Deep dive into the essential concepts and principles you need to master",
    thumbnail:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",
    ],
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: 3,
    title: "Practical Applications",
    description:
      "Apply what you've learned with real-world examples and hands-on exercises",
    thumbnail:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    ],
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
  {
    id: 4,
    title: "Advanced Techniques",
    description:
      "Master advanced strategies and techniques used by industry professionals",
    thumbnail:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
    ],
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  },
  {
    id: 5,
    title: "Real-world Examples",
    description:
      "Explore case studies and practical implementations from successful projects",
    thumbnail:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
    ],
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
];

function ContentModules() {
  const [modules] = useState(SAMPLE_MODULES);
  // const [selectedModule, setSelectedModule] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="modules-page-container mt-3">
      <header className="modules-header-wrap">
        <h1 className="modules-header">Your Lessons</h1>
        <p className="modules-subtitle">
          Watch and learn from our comprehensive collection
        </p>
      </header>

      <div className="modules-grid">
        {modules.map((module) => (
          <div
            key={module.id}
            className="module-lesson-card"
            // onClick={() => setSelectedModule(module)}
            onClick={() => navigate(`/u/modules/${module.id}`)}
          >
            <div className="module-lesson-thumbnail">
              {module.thumbnail && (
                <img src={module.thumbnail} alt={module.title} />
              )}
            </div>
            <div className="module-lesson-info">
              <h2 className="module-lesson-title">{module.title}</h2>
              <p className="module-lesson-desc">{module.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* {selectedModule && (
        <ModuleViewer
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )} */}
    </div>
  );
}

export default ContentModules;
