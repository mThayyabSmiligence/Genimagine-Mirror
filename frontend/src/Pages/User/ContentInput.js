import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import DocumentUpload from "../../Components/LearningVideos/DocumentUpload";
import AIGeneration from "../../Components/LearningVideos/AIGeneration";
import "../../Css/ContentInput.css";

function ContentInput() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [slideCount, setSlideCount] = useState(10);
  const [promptError, setPromptError] = useState("");
  const [slideCountError, setSlideCountError] = useState("");

  const uploadFileToBackend = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const generateModuleFromPrompt = async (prompt, slideCount) => {
    try {
      const response = await axios.post("/generate", {
        prompt: prompt,
        slideCount: slideCount
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };


  const handleContinue = async (e) => {
    e.stopPropagation();

    if (activeTab === "upload") {
      if (!file) {
        toast.error("Please upload a file.");
        setError("Please upload a file.");
        return;
      }

      try {
        await uploadFileToBackend(file);
        toast.success("File uploaded successfully!");
        setError("");
        // Optionally navigate or reset state here
      } catch (err) {
        toast.error("File upload failed. Please try again.");
        setError("File upload failed. Please try again.");
      }
    } else if (activeTab === "prompt") {
      setPromptError("");
      setSlideCountError("");

      let hasError = false;

      if (!prompt.trim()) {
        setPromptError("Prompt is required.");
        toast.error("Prompt is required.");
        hasError = true;
      }
      // Clamp slideCount if needed for direct typing
      const slideVal = Number(slideCount);
      if (!slideVal || slideVal < 1 || slideVal > 10) {
        setSlideCountError("Slide count must be between 1 and 10.");
        toast.error("Slide count must be between 1 and 10.");
        hasError = true;
      }

      if (hasError) {
        return;
      }

      try {
        // Call the generate API with prompt and slideCount
        const response = await axios.post("/generate", {
          prompt: prompt,
          slideCount: slideVal,
        });
        toast.success("Module generated successfully!");
        // Optionally: use response.data, navigate, etc.
        // navigate("/next-step");
      } catch (err) {
        toast.error("Module generation failed. Please try again.");
      }
    }
  };


  return (
    <div className={`${activeTab === 'prompt' && 'mt-5'} content-input-page`}>
      <div className="content-input-inner">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <h1 className="input-title">Create Technical Module</h1>
        <p className="input-subtitle">Upload a document or describe your content</p>

        <div className="tab-row">
          <button
            className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <Upload size={20} style={{ marginRight: 8 }} />
            Upload Document
          </button>
          <button
            className={`tab-btn ${activeTab === "prompt" ? "active" : ""}`}
            onClick={() => setActiveTab("prompt")}
          >
            <Sparkles size={20} style={{ marginRight: 8 }} />
            AI Generation
          </button>
        </div>

        <div className="content-card-container">
          {activeTab === "upload" ? (
            <DocumentUpload
              file={file}
              setFile={setFile}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              error={error}
              setError={setError}
            />
          ) : (
            <AIGeneration
              prompt={prompt}
              setPrompt={setPrompt}
              slideCount={slideCount}
              setSlideCount={setSlideCount}
              promptError={promptError}
              slideCountError={slideCountError}
              setPromptError = {setPromptError}
              setSlideCountError = {setSlideCountError}
            />
          )}

          <div className="card-action-row">
            <button className="cancel-btn" onClick={() => navigate("/content-type")}>
              Cancel
            </button>
            <button className="content-input-continue-btn" onClick={handleContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentInput;
