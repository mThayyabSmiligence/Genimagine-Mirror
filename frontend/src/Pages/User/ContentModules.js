import React, { useEffect, useState } from "react";
import { CirclePlay } from "lucide-react";
import "../../Css/ContentModules.css";
import { axiosPrivate } from "../../API's/axios";

const SAMPLE_MODULES = [
  {
    id: 1,
    title: "Introduction to the Module",
    thumbnail: "", // could be a real image URL if you want
    time: "5:30"
  },
  {
    id: 2,
    title: "Understanding Core Concepts",
    thumbnail: "",
    time: "8:45"
  },
  {
    id: 3,
    title: "Practical Applications",
    thumbnail: "",
    time: "12:20"
  },
  {
    id: 4,
    title: "Advanced Techniques",
    thumbnail: "",
    time: "10:15"
  },
  {
    id: 5,
    title: "Real-world Examples",
    thumbnail: "",
    time: "15:40"
  }
];

function ContentModules() {
  const [modules, setModules] = useState(SAMPLE_MODULES);

//   useEffect(() => {
//     getModuleList();
//   }, []);

//   const getModuleList = async () => {
//     try {
//       const response = await axiosPrivate("/get-modules");
//       setModules(response.data); // expects [{id, title, thumbnail, time, description}]
//     } catch (error) {
//       setModules([]);
//     }
//   };

  return (
    <div className="modules-page-container mt-5">
      <h1 className="modules-header">Your Lessons</h1>
      <p className="modules-subtitle">
        Watch and learn from our comprehensive collection
      </p>
      <div className="modules-grid">
        {modules.map(module => (
          <div key={module.id} className="module-lesson-card">
            <div className="module-lesson-thumbnail">
              {/* <span className="play-icon">
                <CirclePlay size={44} />
              </span> */}
              {/* <span className="module-lesson-time">{module.time || "00:00"}</span> */}
            </div>
            <div className="module-lesson-info">
              <h2 className="module-lesson-title w-100 text-center">{module.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentModules;
