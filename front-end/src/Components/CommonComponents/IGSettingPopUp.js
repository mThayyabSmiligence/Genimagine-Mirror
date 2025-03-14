import React, { useContext, useEffect, useState } from "react";
import '../../Css/IGSettingPopUp.css'
import RefreshDataContext from "../../Context/RefreshDataProvider";


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
function IGSettingPopUp({closePopup,}) {

  const {refreshImageSettings,setRefreshImageSettings} = useContext(RefreshDataContext)


  const [tempTrackModel, setTempTrackModel] = useState(1);
  const [tempSelectedAspectRatio, setTempSelectedAspectRatio] = useState(aspectRatioList[0]);
  


 

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
  useEffect(()=>{

    if(localStorage.getItem("image_settings")){
      const settings = JSON.parse(localStorage.getItem("image_settings"));
      setTempTrackModel(settings.model);
      setTempSelectedAspectRatio(aspectRatioList.find( aspectRatio => aspectRatio.aspectRatio == settings.aspectRatio.aspectRatio));
      return;
    }

    localStorage.setItem("image_settings", JSON.stringify(
      {
        model:tempTrackModel,
        aspectRatio:tempSelectedAspectRatio
      }
    ))
    setRefreshImageSettings(!refreshImageSettings)
    
  },[])

  
  const handlesubmit = () => {  
    localStorage.setItem("image_settings", JSON.stringify(
      {
        model:tempTrackModel,
        aspectRatio:tempSelectedAspectRatio
      }))
      setRefreshImageSettings(!refreshImageSettings)
    closePopup();
  }

  return (
    <div className="settings-pop-up pop-up-container white-bg">
        <div className="pop-up-title d-flex justify-content-between align-items-center">
                <h4 className="h-2">Image Generation Settings</h4>
                <span className="material-symbols-outlined pop-up-close d-flex align-items-center justify-content-center" onClick={closePopup}>close</span>
        </div>
        <div className="pop-up-body ">
            <div className="pop-up-content d-flex flex-column text-start mt-3"> 
                <h5 className="pop-up-model h-3">Model</h5>
                <div className="model-list d-flex flex-wrap mt-2">
                {  
                  modelsList.map((model) => (

                      <div key={model.model_id} onClick={() => setTempTrackModel(model.model_id)} className={`pop-up-model-content ${model.model_id == tempTrackModel&&"active"} ms-3 d-flex justify-content-between align-items-center mb-3`}>
                        <div>   
                          <h5 className="h-4">{model.model_name}</h5>
                          <p className="p-primary m-0">{model.model_resolution}</p>
                        </div>
                        <div>
                          <p className="p-primary m-0 ms-2">{model.required_credits} cp<br/>/img</p>
                        </div>
                      </div>
                  ))
                }
                </div>

                <h5 className="h-3">Aspect Ratio</h5>
                <div className="d-flex justify-content-start flex-wrap mt-2">
                  {
                    aspectRatioList.map((shape) => (
                      <div key={shape.id} onClick={() => setTempSelectedAspectRatio(shape)}className={`aspect-ratio-box ${tempSelectedAspectRatio.id === shape.id && "active"} mb-3 `}
                      style={{ width: `${shape.width}px`, height: `${shape.height}px` }}
                    >
                      {shape.aspectRatio}
                    </div>
                    ))
                  }
                </div>

                <h5 className="h-3">Style</h5>
                <div className="d-flex justify-content-center">
                  <h4 className="h-3">Coming Soon...</h4>
                </div>

                <div className="pop-up-done d-flex justify-content-end me-3">
                  <button onClick={handlesubmit} className="button dark-button br-10 px-3 py-1 d-flex justify-content-between align-items-center">DONE</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default IGSettingPopUp;