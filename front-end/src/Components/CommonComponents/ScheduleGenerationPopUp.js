import React, { useRef, useEffect, useState } from "react";
import "../../Css/ScheduleGenerationPopUp.css";

export default function ScheduleGenerationPopUp({
  onHide,
  handleSchedule,
  scheduleFrequency,
  setScheduleFrequency,
  scheduleTime,
  setScheduleTime,
  imagesPerRun,
  setImagesPerRun, 
  isRecurring,
  setIsRecurring,
  scheduleRunAt,
  setScheduleRunAt,
  selectSetting,
  promptText,
  styleList
}) {

  const textareaRef = useRef(null);
  const [textareaHeight, setTextareaHeight] = useState("auto");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset before measuring
      const newHeight = textareaRef.current.scrollHeight;
      setTextareaHeight(newHeight > 100 ? "100px" : `${newHeight}px`);
    }
  }, [promptText]);


  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
      <div onClick={onHide} className="modal-backdrop fade show bgblur-container"></div>

      <div className="modal-dialog modal-dialog-centered popup-container mt-5" role="document">
        <div className="modal-content p-4">
          <h5 className="mb-3 text-start">Schedule Automated Generation</h5>

          <div className="sg-group mb-3">
            <label className="sg-label d-flex mb-1">Prompt
              <span className="read-only-text ms-1">(Read only)</span>
            </label>
            <textarea
              ref={textareaRef}
              className={`sg-input prompt-textarea 
                ${textareaHeight === "100px" ? "scrollable" : ""}
                ${!promptText ? "no-prompt" : ""}
              `}
              style={{ height: textareaHeight }}
              value={
                promptText?.trim()
                  ? promptText
                  : "NO PROMPT ENTERED, Please enter prompt"
              }
              readOnly
            />
          </div>

          <div className="sg-group mb-3">
            <label className="sg-label d-flex mb-1">Model
              <span className="read-only-text ms-1">(Read only)</span>
            </label>
            <input
              type="text"
              className="sg-input"
              min="1"
              value={selectSetting.modelname}
              readOnly
            />
          </div>

          <div className="d-flex justify-content-between mb-3">
            <div style={{flex: '1 1 48%'}}>
              <label className="sg-label d-flex mb-1">Aspect Ratio
                <span className="read-only-text ms-1">(Read only)</span>
              </label>
              <input
                type="text"
                className="sg-input"
                value={selectSetting.aspectRatio}
                readOnly
              />
            </div>

            <div style={{flex: '1 1 48%'}}>
              <label className="sg-label d-flex mb-1">Quality
                 <span className="read-only-text ms-1">(Read only)</span>
              </label>
              <input
                type="text"
                min="1"
                className="sg-input"
                value={selectSetting.qualityResolution}
                readOnly
              />
            </div>
          </div>

          {/* <div className="sg-group mb-3">
            <label className="sg-label d-flex mb-1">Style
              <span className="read-only-text ms-1">(Read only)</span>
            </label>
            <input
              type="text"
              className="sg-input"
              min="1"
              value={styleList?.find((s) => s.id === selectSetting.style)?.style_name }
              readOnly
            />
          </div> */}

          <div className="sg-group mb-3">
            <label className="sg-label d-flex mb-1">Schedule Type</label>
            <select
              className="sg-select"
              value={isRecurring ? 'recurring' : 'one-time'}
              onChange={e => setIsRecurring(e.target.value === 'recurring')}
            >
              <option value="recurring">Recurring</option>
              <option value="one-time">One-Time</option>
            </select>
          </div>

          {isRecurring && (
              <div className="d-flex justify-content-between mb-3">
                <div style={{ flex: '1 1 48%' }}>
                  <label className="sg-label d-flex mb-1">Frequency</label>
                  <select
                    className="sg-select"
                    value={scheduleFrequency}
                    onChange={e => setScheduleFrequency(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div style={{ flex: '1 1 48%' }}>
                  <label className="sg-label required-label d-flex mb-1">Time</label>
                  <input
                    type="time"
                    className="sg-input"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            {!isRecurring && (
              <div className="sg-group mb-3">
                <label className="sg-label required-label d-flex mb-1">Run At (Date & Time)</label>
                <input
                  type="datetime-local"
                  className="sg-input"
                  value={scheduleRunAt}
                  onChange={e => setScheduleRunAt(e.target.value)}
                />
              </div>
            )}

          <div className="sg-group mb-3">
            <label className="sg-label d-flex mb-1">Images Per Run</label>
            <input
              type="number"
              className="sg-input"
              min="1"
              value={imagesPerRun}
              // onChange={e => setImagesPerRun(Number(e.target.value))}
              onChange={e => {
                const val = Number(e.target.value);
                if (val >= 1) {
                  setImagesPerRun(val);
                } else {
                  setImagesPerRun(1);
                }
              }}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button className="btn-secondary" onClick={onHide}>Cancel</button>
            <button
              className="btn-success"
              onClick={() => {
                handleSchedule();
              }}
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
