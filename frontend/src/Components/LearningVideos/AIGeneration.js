import { useEffect, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import "../../Css/AIGeneration.css";

function AIGeneration({ 
  prompt, 
  setPrompt, 
  slideCount, 
  setSlideCount,
  promptError,
  slideCountError,
  setPromptError,
  setSlideCountError
}) {
  const aiGenRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        aiGenRef.current &&
        !aiGenRef.current.contains(event.target)
      ) {
        setPromptError("");
        setSlideCountError("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setPromptError, setSlideCountError]);

  const handleIncrement = () => {
    const newValue = Number(slideCount) + 1;
    if (newValue <= 10) {
      setSlideCount(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = Number(slideCount) - 1;
    if (newValue >= 1) {
      setSlideCount(newValue);
    }
  };

  const handleNumberChange = (e) => {
    let val = Number(e.target.value);
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    setSlideCount(val);
  };

  return (
    <div ref={aiGenRef} className="ai-gen-card">
      <label className="ai-gen-label text-start">Content Prompt</label>
      <textarea
        placeholder="Describe your technical content…"
        className={`ai-gen-textarea ${promptError ? "error" : ""}`}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      {promptError && <p className="ai-gen-error">{promptError}</p>}

      <div className="d-flex align-items-center ">
        <label className="ai-gen-label text-start">Number of Slides</label>
        <div className="ai-gen-spinner-wrapper ms-3">
          <input
            type="number"
            min={1}
            max={10}
            className={`ai-gen-slides-input ${slideCountError ? "error" : ""}`}
            value={slideCount}
            onChange={handleNumberChange}
            
          />
          <div className="spinner-buttons">
            <button 
              className="spinner-btn spinner-up" 
              onClick={handleIncrement}
              type="button"
              disabled={slideCount >= 10}
            >
              <ChevronUp size={16} />
            </button>
            <button 
              className="spinner-btn spinner-down" 
              onClick={handleDecrement}
              type="button"
              disabled={slideCount <= 1}
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
      {slideCountError && <p className="ai-gen-error">{slideCountError}</p>}

      <div className="ai-gen-slides-info">
        Recommended: 10-20 slides for comprehensive coverage
      </div>
    </div>
  );
}
export default AIGeneration;
