import React from 'react';
import '../../Css/ScheduleGenerationPopUp.css'
import { useRef, useEffect, useState } from "react";

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
  promptText
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

          <div className="form-group mb-3">
            <label className="form-label">Prompt
              <span className="read-only-text ms-1">(Read only)</span>
            </label>
            <textarea
              ref={textareaRef}
              className={`form-control prompt-textarea 
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

          <div className="form-group mb-3">
            <label className="form-label">Model
              <span className="read-only-text ms-1">(Read only)</span>
            </label>
            <input
              type="text"
              className="form-control"
              min="1"
              value={selectSetting.modelname}
              readOnly
            />
          </div>

           <div className="d-flex justify-content-between mb-3">
            <div style={{flex: '1 1 48%'}}>
              <label className="form-label">Aspect Ratio
                <span className="read-only-text ms-1">(Read only)</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={selectSetting.aspectRatio}
                readOnly
              />
            </div>

            <div style={{flex: '1 1 48%'}}>
              <label className="form-label">Quality
                 <span className="read-only-text ms-1">(Read only)</span>
              </label>
              <input
                type="text"
                min="1"
                className="form-control"
                value={selectSetting.qualityResolution}
                readOnly
              />
            </div>
          </div>

          {/* <div className="form-group mb-3">
            <label className="form-label">Style</label>
            <input
              type="text"
              className="form-control"
              min="1"
              value={selectSetting.qualityResolution}
              readOnly
            />
          </div> */}

          <div className="form-group mb-3">
            <label className="form-label">Schedule Type</label>
            <select
              className="form-select"
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
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-select"
                    value={scheduleFrequency}
                    onChange={e => setScheduleFrequency(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div style={{ flex: '1 1 48%' }}>
                  <label className="form-label required-label">Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            {!isRecurring && (
              <div className="form-group mb-3">
                <label className="form-label required-label">Run At (Date & Time)</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={scheduleRunAt}
                  onChange={e => setScheduleRunAt(e.target.value)}
                />
              </div>
            )}

          <div className="form-group mb-3">
            <label className="form-label">Images Per Run</label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={imagesPerRun}
              onChange={e => setImagesPerRun(Number(e.target.value))}
            />
          </div>


          {/* <div className="form-group mb-3">
            <label className="form-label">Frequency</label>
            <select
              className="form-select"
              value={scheduleFrequency}
              onChange={e => setScheduleFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <div style={{flex: '1 1 48%'}}>
              <label className="form-label">Time</label>
              <input
                type="time"
                className="form-control"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
              />
            </div> */}

            {/* <div style={{flex: '1 1 48%'}}>
              <label className="form-label">Images per run</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={imagesPerRun}
                onChange={e => setImagesPerRun(e.target.value)}
              />
            </div>
          </div> */}

          {/* <div className="form-group mb-3">
            <label htmlFor="endDateInput" className="form-label">End Date (Optional)</label>
            <input
              id="endDateInput"
              type="date"
              className="form-control"
              value={scheduleEndDate}
              onChange={e => setScheduleEndDate(e.target.value)}
            />
          </div> */}

          {/* <div className="custom-toggle-container">
            <label className="custom-toggle-label" htmlFor="enableScheduleSwitch">
              <span className="custom-toggle-icon">⚡</span> Enable Schedule
            </label>
            <div className="custom-toggle-switch">
              <input
                type="checkbox"
                className="custom-checkbox"
                id="enableScheduleSwitch"
                checked={isScheduleEnabled}
                onChange={e => setIsScheduleEnabled(e.target.checked)}
              />
            </div>
          </div> */}

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-secondary" onClick={onHide}>Cancel</button>
            <button
              className="btn btn-success"
              onClick={() => {
                handleSchedule();
                // onHide();
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
