import React, { useContext, useEffect, useRef, useState } from 'react'
import "../../Css/PromptInputContainer.css"
import IGSettingPopUp from './IGSettingPopUp'
import RefreshDataContext from '../../Context/RefreshDataProvider'

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

export default function PromptInPutContainer({promptText,setPromptText,generateImage,loading}) {


  const [showIGSetting,setShowIGSetting]=useState(false)
  const {refreshImageSettings,setRefreshImageSettings} = useContext(RefreshDataContext)

  

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
  useEffect(() => {
    // If there's nothing in promptText, clear the content and exit.
    if (promptText === "") {
      pRef.current.innerText = "";
      return;
    }
  
    // Get the current selection and caret offset if the element is focused.
    let sel = window.getSelection();
    let caretOffset = null;
    if (document.activeElement === pRef.current && sel.rangeCount > 0) {
      caretOffset = sel.getRangeAt(0).startOffset;
    }
  
    // Update the content
    pRef.current.innerText = promptText;
  
    // If we saved a caret position, restore it.
    if (caretOffset !== null) {
      const range = document.createRange();
      // Make sure there is at least one child node (a text node).
      const textNode = pRef.current.firstChild;
      if (textNode) {
        // Adjust caretOffset if it exceeds text length.
        const offset = Math.min(caretOffset, textNode.textContent.length);
        range.setStart(textNode, offset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [promptText]);
  
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

   useEffect(()=>{
      if(!localStorage.getItem("image_settings")){
        localStorage.setItem("image_settings", JSON.stringify(
          {
            model:1,
            aspectRatio:aspectRatioList[2]
          }
        ))
        setRefreshImageSettings(!refreshImageSettings)    
        return;
      }
      
    },[])

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
        showIGSetting&&<IGSettingPopUp closePopup={() => setShowIGSetting(false)}/>
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