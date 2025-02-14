import React, { useState } from "react";
import '../../Css/IGSettingPopUp.css'

function IGSettingPopUp({closePopup}) {

  const [trackmodel,setTrackModel] = useState('1')
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(2);

  const modelsList = [
    {
      model_id: 1,
      model_name: "Base Model",
      model_resolution: "480p",
      required_credits: 0
    },
    {
      model_id: 2,
      model_name : "Ultra Model",
      model_resolution: "720p",
      required_credits:5
    },
    {
      model_id: 3,
      model_name: "Master Model",
      model_resolution: "1080p",
      required_credits: 10
    }
  ]

  const aspectRatioList = [
    {
      id: 1,
      aspectRatio: "16:9",
      width: 80, 
      height: 45
    },
    // {
    //   id: 2,
    //   aspectRatio: "3:2"
    // },
    {
      id: 2,
      aspectRatio: "1:1",
      width: 50,
      height: 50
    },
    // {
    //   id: 4,
    //   aspectRatio: "4:5"
    // },
    {
      id: 3,
      aspectRatio: "9:16",
      width: 45,
      height: 80 
    },
  ]

  const styleList = [
    {
      img_url: "",
      style_name: "Style 1",
      style_id: 1
    },
    {
      img_url: "",
      style_name: "Style 2",
      style_id: 2
    },
    {
      img_url: "",
      style_name: "Style 3",
      style_id: 3
    }
  ]

  return (
    <div className="settings-pop-up pop-up-container white-bg">
        <div className="pop-up-title d-flex justify-content-between align-items-center">
                <h4>Image Generation Settings</h4>
                <span className="material-symbols-outlined pop-up-close d-flex align-items-center justify-content-center" onClick={closePopup}>close</span>
        </div>
        <div className="pop-up-body ">
            <div className="pop-up-content d-flex flex-column text-start mt-3"> 
                <h5 className="pop-up-model">Model</h5>
                <div className="d-flex justify-content-start flex-wrap mt-2">
                {  
                  modelsList.map((model) => (

                      <div key={model.model_id} onClick={() => setTrackModel(model.model_id)} className={`pop-up-model-content ${model.model_id == trackmodel&&"active"} ms-3 d-flex justify-content-between align-items-center mb-3`}>
                        <div>   
                          <h5>{model.model_name}</h5>
                          <p className="m-0">{model.model_resolution}</p>
                        </div>
                        <div>
                          <p>{model.required_credits} cp</p>
                        </div>
                      </div>
                  ))
                }
                </div>

                <h5 className="pop-up-headings">Aspect Ratio</h5>
                <div className="d-flex justify-content-start flex-wrap mt-2">
                  {
                    aspectRatioList.map((shape) => (
                      <div key={shape.id} onClick={() => setSelectedAspectRatio(shape.id)}className={`aspect-ratio-box ${selectedAspectRatio === shape.id && "active"} mb-3`}
                      style={{ width: `${shape.width}px`, height: `${shape.height}px` }}
                    >
                      {shape.aspectRatio}
                    </div>
                    ))
                  }
                </div>
                <h5 className="pop-up-headings">Style</h5>
                <div className="d-flex">
                  
                </div>
            </div>
        </div>
    </div>
  )
}

export default IGSettingPopUp;