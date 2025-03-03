import React, { useEffect, useRef, useState } from 'react'
import "../../Css/PromptInputContainer.css"
import IGSettingPopUp from './IGSettingPopUp'

export default function PromptInPutContainer({promptText,setPromptText,generateImage,trackmodel,setTrackModel,selectedAspectRatio, setSelectedAspectRatio,loading}) {


  const [showIGSetting,setShowIGSetting]=useState(false)

  

  const pRef= useRef(null)


  const spinnerStyle = {
    width: '20px',
    height: '20px',
    border: '4px solid #ccc',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };


  const handelInput=(e)=>{
    setPromptText(e.target.innerText)
  }
  useEffect(()=>{
    if(promptText==""){
      pRef.current.innerText=""
    }
  },[promptText])
  const handelClick=()=>{
    if(pRef.current){
      pRef.current.innerText=""
    }
    if(promptText==""){
      alert("fill the prompt")
      return
    }
    generateImage()
    
  }
  const [width, setWidth] = useState(window.innerWidth);
          
        useEffect(() => {
          const handleResize = () => {
            setWidth(window.innerWidth);
          };
              
          window.addEventListener('resize', handleResize);
              
          return () => {
             window.removeEventListener('resize', handleResize);
          };
    }, []);

  return (
    <div className='prompt-outer-container light-grey-bg br-10 d-flex flex-column align-items-end p-2 mb-2'   >
      {
        showIGSetting&&<IGSettingPopUp trackmodel={trackmodel} setTrackModel={setTrackModel} selectedAspectRatio={selectedAspectRatio} setSelectedAspectRatio={setSelectedAspectRatio} closePopup={() => setShowIGSetting(false)}/>
      }
      {
        showIGSetting&&<div onClick={()=>setShowIGSetting(false)} className='blur-background'></div>
      }

      <div className='prompt-input-container'>
        <p ref={pRef}
          className='p-input'
          contentEditable="true" 
          onInput={(e)=>handelInput(e)}
        ></p>
      </div>

      <div className="chat-bottom-part d-flex align-items-center justify-content-between w-100 mt-2">
        <button className="image-setting-tag d-flex align-items-center   br-100 " onClick={()=>setShowIGSetting(true)}>
          <span class="material-symbols-outlined">
            settings
          </span>
          <p className='m-0 flex-1'> Image Setting</p>
        </button>

          <div>
            {
              
              loading? 
                    <div className='border-0 send-button d-flex align-items-center justify-content-center br-20' 
                    
                    >
                          <>
                          <div style={spinnerStyle}></div>
                          <style>{`
                          @keyframes spin {
                              0% { transform: rotate(0deg); }
                              100% { transform: rotate(360deg); }
                          }
                          `}</style>
                          </>
                      
                    </div>
              : 
              <button className='border-0 send-button d-flex align-items-center justify-content-center br-20' 
                      onClick={!loading&&handelClick}
                      >
                        <span className="material-symbols-outlined">arrow_forward</span>
                        
                </button>
            }
          </div>
      </div>
    </div>
  )
}