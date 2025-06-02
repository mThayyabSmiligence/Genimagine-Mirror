import React, { useContext, useEffect, useRef, useState } from 'react'
import "../../Css/PromptInputContainer.css"
import IGSettingPopUp from './IGSettingPopUp'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import AuthContext from '../../Context/AuthProvider';
import { axiosNoAUth, axiosPrivate } from '../../API\'s/axios';
// const aspectRatioList = [
//   {
//     id: 1,
//     aspectRatio: "16:9",
//     width: 80, 
//     height: 45
//   },
  
//   {
//     id: 2,
//     aspectRatio: "1:1",
//     width: 50,
//     height: 50
//   },

//   {
//     id: 3,
//     aspectRatio: "9:16",
//     width: 45,
//     height: 80 
//   },
// ]
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

export default function PromptInPutContainer({promptText,setPromptText,generateImage,loading,promptLength,setPromptLength}) {


  const [showIGSetting,setShowIGSetting]=useState(false)
  const {refreshImageSettings,setRefreshImageSettings} = useContext(RefreshDataContext)

  const [selectSetting, setSelectSetting] = useState(null)
  const {loggedIn}= useContext(AuthContext)

  const [modelsList, setModelsList] = useState([]);
  const [getModelById, setGetModelById] = useState(null);
  const [aspectRatioList, setAspectRatioList] = useState([]);
  const [qualityLevelsList, setQualityLevelsList] = useState([]);


  const fetchData = async () => {
      try{
        const response = await axiosNoAUth.post("/get-image-settings")
        const { models,aspect_ratios_shapes, quality_levels } = response.data.data;
  
        setModelsList(models);

        const imageSetting = JSON.parse(localStorage.getItem('image_settings'));
        const selectedModel = models.find((model)=>imageSetting?imageSetting.model == model.id:model.is_default==1);

        const allAspectRatios = selectedModel.aspect_ratio_config;
        const sortedAspectRatios = allAspectRatios.sort((a, b) => {
          const ratioA = a.width / a.height;
          const ratioB = b.width / b.height;
          return ratioB - ratioA; 
        });
        setAspectRatioList(sortedAspectRatios);

              

        const allQualityLevels= (selectedModel.resolution_config || []).map(({ name,quality_level_id, ...rest }) => ({
          ...rest, 
          id: quality_level_id,                       
          resolution: name           
        }))


        setQualityLevelsList(allQualityLevels);
        console.log("this is quality config :::: ", allQualityLevels)

        // setStyleList(styles);


        return models 
      }catch (error) {
        console.error("Error fetching data:", error);
    }
  };

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
    if(promptLength>500) return

    
    const trimmedPrompt = promptText.trim();

    if(pRef.current){
      pRef.current.innerText=""
    }
    if(trimmedPrompt==""){
      alert("fill the prompt")
      return
    }
    generateImage()

    
  }

  useEffect(()=>{
     // getting default model,ascept ratio and quality when no image setting is found in local storage
      if(!localStorage.getItem("image_settings") && modelsList.length>0 ){
        const defaultModel = modelsList.find((model) => model.is_default === 1) || modelsList[0]; 

        const modelAspectRatios = defaultModel.aspect_ratio_config || [];
        const modelResolutions = defaultModel.resolution_config || [];

        const defaultAspectRatio = modelAspectRatios.find(ar => ar.is_default === 1) || modelAspectRatios[0];
        const defaultQuality = modelResolutions.find(q => q.is_default === 1) || modelResolutions[0];

        // const defaultAspectRatio = aspectRatioList.find((ar) => ar.is_default === 1) || aspectRatioList[0];
        // const defaultQuality = qualityLevelsList.find((ql) => ql.is_default === 1) || qualityLevelsList[0];
        const defaultStyle = styleList.find((style) => style.is_default === 1) || styleList[0];

        console.log("default model",defaultModel)
        console.log("default aspect ratio",defaultAspectRatio)  
        console.log("default quality",defaultQuality)
        console.log("default style",defaultStyle)

        localStorage.setItem("image_settings", JSON.stringify(
          {
            model:defaultModel?.id ,
            modelname: defaultModel?.name,
            aspectRatioid: defaultAspectRatio?.aspect_ratio_id,
            aspectRatio: defaultAspectRatio?.ratio,
            quality: defaultQuality?. quality_level_id,
            qualityResolution: defaultQuality?.name,
            style: defaultStyle?.id
          }
        ))
        setRefreshImageSettings(!refreshImageSettings)    
        return;
      }
      else if(!localStorage.getItem("image_settings") ){ 
        fetchData()
      }
      
    },[modelsList])

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

    useEffect(()=>{
      setPromptLength(promptText.trim().length)
      console.log(promptLength)
    },[promptText])
    

  return (
    <>
    
    <div className='prompt-outer-container light-grey-bg br-10 d-flex flex-column align-items-end p-2 mb-2'   >
      {
        showIGSetting&&<IGSettingPopUp closePopup={() => setShowIGSetting(false)} modelsList={modelsList} setModelsList={setModelsList} aspectRatioList={aspectRatioList} setAspectRatioList={setAspectRatioList} qualityLevelsList={qualityLevelsList} setQualityLevelsList={setQualityLevelsList} fetchData={fetchData} />
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
            <p className='m-0 flex-1 p-primary'> Image Setting</p>
          </button>
    
          <div className='selected-settings d-flex align-items-center px-1 flex-wrap ' >
            {/* <span className="material-symbols-outlined setting-icon" title='Image Setting'>
              settings
            </span> */}
            {selectSetting && (
              <>
                <div className='setting-tags p-secondary' title='model'>
                  Model : {loggedIn? selectSetting.modelname:"lightning"}
                </div>
                <div className='setting-tags p-secondary' title='aspect ratio'>
                  Aspect Ratio : {loggedIn?selectSetting.aspectRatio:"1:1"}
                </div>
                <div className='setting-tags p-secondary' title='aspect ratio'>
                  quality : {loggedIn?selectSetting.qualityResolution :"720p"}
                </div>
                <div className='setting-tags p-secondary' title='Style'>
                  Style : {loggedIn?styleList[selectSetting.style-1]?.style_name||"none":"none"}
                </div>
              </>
            )}
          </div>
        </div>
        {
            promptLength>500&&
            <p className='text-danger p-secondary m-0'>the prompt should be under 500 characters</p>
          }
        <div className='d-flex align-items-end p-secondary'>

        
          <p className='mb-0 me-2'>{promptLength} / 500</p>
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
              <button className={`border-0 send-button d-flex align-items-center justify-content-center br-20 ${promptLength>500&&"unclickable"}`}
                      onClick={!loading&&handelClick}
                      >
                        <ArrowForwardOutlinedIcon className='icon'/>
                        
                </button>
            }
          </div>
          </div>
      </div>
    </div>
    </>
  )
}