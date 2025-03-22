import React, { useContext, useEffect, useRef, useState } from 'react'
import "../../Css/PromptInputContainer.css"
import IGSettingPopUp from './IGSettingPopUp'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import AuthContext from '../../Context/AuthProvider';
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
        { id: 1, style_name: "Textured Oil Painting", },
        { id: 2, style_name: "Chalk and Charcoal", },
        { id: 3, style_name: "Chinese Ink Painting", },
        { id: 4, style_name: "Realism", },
        { id: 5, style_name: "3D Render", },
        { id: 6, style_name: "Ink & Wash", },
        { id: 7, style_name: "Bright and Exaggerated Cartoon World", },
        { id: 8, style_name: "Anime", },
        { id: 9, style_name: "Black & White", },
        { id: 10, style_name: "Bokeh",  },
        { id: 11, style_name: "Cinematic",  },
        { id: 12, style_name: "Comic Book",  },
        { id: 13, style_name: "Film Noir",  },
        { id: 14, style_name: "Indian Miniature",  },
        { id: 15, style_name: "Japanese Ukiyo-e",  },
        { id: 16, style_name: "Neon Glow",  },
        { id: 17, style_name: "Pixel Art",  },
        { id: 18, style_name: "Steampunk",  },
        { id: 19, style_name: "Baroque Portrait",  },
        { id: 20, style_name: "Cyberpunk Setting",  },
        { id: 21, style_name: "Delicate Watercolor Painting",  },
        { id: 22, style_name: "Dreamlike and Abstract Composition",  },
        { id: 23, style_name: "Dynamic Graffiti Artwork",  },
        { id: 24, style_name: "Gothic Horror Setting",  },
        { id: 25, style_name: "High Dynamic Range Photography",  },
        { id: 26, style_name: "Monochrome Sketch",  },
        { id: 27, style_name: "Moody Gothic Atmosphere",  },
        { id: 28, style_name: "Mythical World",  },
        { id: 29, style_name: "Pencil Sketch Style",  },
        { id: 30, style_name: "Playful Cartoon Style",  },
        { id: 31, style_name: "Pop Art Style",  },
        { id: 32, style_name: "Richly Detailed Baroque Style",  },
        { id: 33, style_name: "Soft Watercolor Style",  },
        { id: 34, style_name: "Surreal Landscape",  },
        { id: 35, style_name: "80s inspired vaporwave style",  },
        { id: 36, style_name: "Thick Oil Painting Style",  },
        { id: 37, style_name: "Ultra Realistic HDR Style",  },
        { id: 38, style_name: "Urban Street Art Style",  },
        { id: 39, style_name: "Vaporwave Aesthetic",  },
        { id: 40, style_name: "Vibrant Pop Art Illustration",  }
    ]

export default function PromptInPutContainer({promptText,setPromptText,generateImage,loading}) {


  const [showIGSetting,setShowIGSetting]=useState(false)
  const {refreshImageSettings,setRefreshImageSettings} = useContext(RefreshDataContext)

  const [selectSetting, setSelectSetting] = useState(null)
  const {loggedIn}= useContext(AuthContext)


  

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

    useEffect(() => {
      if(localStorage.getItem("image_settings")){
        const imageSettings = JSON.parse(localStorage.getItem("image_settings"))
        setSelectSetting(imageSettings)
        console.log(imageSettings)
      }
    },[refreshImageSettings])
    

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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevent new line
              handelClick(); // Call your submit function
            }
          }}
        ></p>
      </div>

      <div className="chat-bottom-part d-flex align-items-center justify-content-between w-100 mt-2">
        <div className='d-flex'>
          <button className="image-setting-tag d-flex align-items-center br-100 " onClick={()=>setShowIGSetting(true)}>
            <SettingsOutlinedIcon></SettingsOutlinedIcon>
            <p className='m-0 flex-1'> Image Setting</p>
          </button>
    
          <div className='selected-settings d-flex align-items-center px-1 flex-wrap ' >
            {/* <span className="material-symbols-outlined setting-icon" title='Image Setting'>
              settings
            </span> */}
            {selectSetting && (
              <>
                <div className='setting-tags p-secondary' title='model'>
                  Model : {loggedIn?selectSetting.model:"1"}
                </div>
                <div className='setting-tags p-secondary' title='aspect ratio'>
                  Aspect Ratio : {loggedIn?selectSetting.aspectRatio.aspectRatio:"1:1"}
                </div>
                <div className='setting-tags p-secondary' title='Style'>
                  Style : {loggedIn?styleList[selectSetting.style-1].style_name:"none"}
                </div>
              </>
            )}
          </div>
        </div>

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
                        <ArrowForwardOutlinedIcon className='icon'/>
                        
                </button>
            }
          </div>
      </div>
    </div>
  )
}