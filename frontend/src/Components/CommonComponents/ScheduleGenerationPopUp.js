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
    <div className="popup-modal" role="dialog" aria-modal="true">
      <div onClick={onHide} className="popup-backdrop bgblur-container"></div>

      <div className="popup-container">
        <div className="popup-modal-content popup-padding">
          <h5 className="popup-title">Schedule Automated Generation</h5>

          <div className="sg-group mb-3">
            <label className="sg-label label-flex text-start mb-2">Prompt
              <span className="read-only-text label-margin">(Read only)</span>
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
            <label className="sg-label label-flex text-start mb-2">Model
              <span className="read-only-text label-margin">(Read only)</span>
            </label>
            <input
              type="text"
              className="sg-input"
              value={selectSetting.modelname}
              readOnly
            />
          </div>

          <div className="flex-row space-between sg-group mb-3">
            <div className="flex-item">
              <label className="sg-label label-flex text-start mb-2">Aspect Ratio
                <span className="read-only-text label-margin">(Read only)</span>
              </label>
              <input
                type="text"
                className="sg-input"
                value={selectSetting.aspectRatio}
                readOnly
              />
            </div>

            <div className="flex-item">
              <label className="sg-label label-flex text-start mb-2">Quality
                <span className="read-only-text label-margin">(Read only)</span>
              </label>
              <input
                type="text"
                className="sg-input"
                value={selectSetting.qualityResolution}
                readOnly
              />
            </div>
          </div>

          <div className="sg-group mb-3">
            <label className="sg-label label-flex text-start mb-2">Schedule Type</label>
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
            <div className="flex-row space-between sg-group mb-3">
              <div className="flex-item">
                <label className="sg-label label-flex text-start mb-2">Frequency</label>
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

              <div className="flex-item">
                <label className="sg-label required-label label-flex text-start mb-2">Time</label>
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
              <label className="sg-label required-label label-flex text-start mb-2">Run At (Date & Time)</label>
              <input
                type="datetime-local"
                className="sg-input"
                value={scheduleRunAt}
                onChange={e => setScheduleRunAt(e.target.value)}
              />
            </div>
          )}

          <div className="sg-group mb-3">
            <label className="sg-label label-flex text-start mb-2">Images Per Run</label>
            <input
              type="number"
              className="sg-input"
              min="1"
              value={imagesPerRun}
              onChange={e => {
                const val = Number(e.target.value);
                setImagesPerRun(val >= 1 ? val : 1);
              }}
            />
          </div>

          <div className="flex-row row-end gap-small">
            <button className="btn-cancel" onClick={onHide}>Cancel</button>
            <button
              className="btn-submit"
              onClick={handleSchedule}
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
