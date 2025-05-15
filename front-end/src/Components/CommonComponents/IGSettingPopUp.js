import React, { useContext, useEffect, useState } from "react";
import '../../Css/IGSettingPopUp.css'
import '../../Css/StylePopUp.css'
import RefreshDataContext from "../../Context/RefreshDataProvider";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AuthContext from "../../Context/AuthProvider";
import StylePopUp from "./StylePopUp";
import styleImage1 from '../../images/style/textured-oil-painting.png'
import styleImage2 from '../../images/style/chalk-and-charcoal.png'
import styleImage3 from '../../images/style/Chinese-Ink-Painting.png'
import styleImage4 from '../../images/style/Realism.png'
import styleImage5 from '../../images/style/3D-Render.png'
import styleImage6 from '../../images/style/Ink&Wash.png'
import styleImage7 from '../../images/style/bright-and-exaggerated-cartoon-world.png'
import styleImage8 from '../../images/style/Anime.png'
import styleImage9 from '../../images/style/Black&White.png';
import styleImage10 from '../../images/style/Bokeh.png';
import styleImage11 from '../../images/style/Cinematic.png';
import styleImage12 from '../../images/style/Comic-Book.png';
import styleImage13 from '../../images/style/Film-Noir.png';
import styleImage14 from '../../images/style/Indian-Miniature.png';
import styleImage15 from '../../images/style/Japanese-Ukiyo-e.png';
import styleImage16 from '../../images/style/Neon-Glow.png';
import styleImage17 from '../../images/style/Pixel-Art.png';
import styleImage18 from '../../images/style/Steampunk.png';
import styleImage19 from '../../images/style/Baroque-portrait.png';
import styleImage20 from '../../images/style/cyberpunk-setting.png';
import styleImage21 from '../../images/style/delicate-watercolor-painting.png';
import styleImage22 from '../../images/style/dreamlike-and-abstract-composition.png';
import styleImage23 from '../../images/style/dynamic-graffiti-artwork.png';
import styleImage24 from '../../images/style/gothic-horror-setting.png';
import styleImage25 from '../../images/style/high-dynamic-range-photography.png';
import styleImage26 from '../../images/style/monochrome-sketch.png';
import styleImage27 from '../../images/style/moody-gothic-atmosphere.png';
import styleImage28 from '../../images/style/mythical-world.png';
import styleImage29 from '../../images/style/pencil-sketch-style.png';
import styleImage30 from '../../images/style/playful-cartoon-style.png';
import styleImage31 from '../../images/style/pop-art-style.png';
import styleImage32 from '../../images/style/richly-detailed-Baroque-style.png';
import styleImage33 from '../../images/style/soft-watercolor-style.png';
import styleImage34 from '../../images/style/surreal-landscape.png';
import styleImage35 from '../../images/style/80s-inspired-vaporwave-style.png';
import styleImage36 from '../../images/style/thick-oil-painting-style.png';
import styleImage37 from '../../images/style/ultra-realistic-HDR-style.png';
import styleImage38 from '../../images/style/urban-street-art-style.png';
import styleImage39 from '../../images/style/vaporwave-aesthetic.png';
import styleImage40 from '../../images/style/vibrant-pop-art-illustration.png';
import { axiosPrivate } from "../../API's/axios";


// const modelsList = [
//   {
//     model_id: 1,
//     model_name: "Base Model",
//     model_resolution: "480p",
//     required_credits: 0
//   },
//   {
//     model_id: 2,
//     model_name : "Ultra Model",
//     model_resolution: "720p",
//     required_credits:5
//   },
//   {
//     model_id: 3,
//     model_name: "Master Model",
//     model_resolution: "1080p",
//     required_credits: 10
//   }
// ]

// const aspectRatioList = [
//   {
//     id: 1,
//     aspectRatio: "16:9",
//     width: 64, 
//     height: 36
//   },
//   {
//     id: 2,
//     aspectRatio: "1:1",
//     width: 45,
//     height: 45
//   },
//   {
//     id: 3,
//     aspectRatio: "9:16",
//     width: 36,
//     height: 64 
//   },
// ]




function IGSettingPopUp({closePopup,modelsList, setModelsList, aspectRatioList, setAspectRatioList, qualityLevelsList,setQualityLevelsList, fetchData}) {

  const [styleList,setStyleList]=useState( [
    { id: 1, style_name: "Textured Oil Painting", style_image: styleImage1 },
    { id: 2, style_name: "Chalk and Charcoal", style_image: styleImage2 },
    { id: 3, style_name: "Chinese Ink Painting", style_image: styleImage3 },
    { id: 4, style_name: "Realism", style_image: styleImage4 },
    { id: 5, style_name: "3D Render", style_image: styleImage5 },
    { id: 6, style_name: "Ink & Wash", style_image: styleImage6 },
    { id: 7, style_name: "Bright and Exaggerated Cartoon World", style_image: styleImage7 },
    { id: 8, style_name: "Anime", style_image: styleImage8 },
    { id: 9, style_name: "Black & White", style_image: styleImage9 },
    { id: 10, style_name: "Bokeh", style_image: styleImage10 },
    { id: 11, style_name: "Cinematic", style_image: styleImage11 },
    { id: 12, style_name: "Comic Book", style_image: styleImage12 },
    { id: 13, style_name: "Film Noir", style_image: styleImage13 },
    { id: 14, style_name: "Indian Miniature", style_image: styleImage14 },
    { id: 15, style_name: "Japanese Ukiyo-e", style_image: styleImage15 },
    { id: 16, style_name: "Neon Glow", style_image: styleImage16 },
    { id: 17, style_name: "Pixel Art", style_image: styleImage17 },
    { id: 18, style_name: "Steampunk", style_image: styleImage18 },
    { id: 19, style_name: "Baroque Portrait", style_image: styleImage19 },
    { id: 20, style_name: "Cyberpunk Setting", style_image: styleImage20 },
    { id: 21, style_name: "Delicate Watercolor Painting", style_image: styleImage21 },
    { id: 22, style_name: "Dreamlike and Abstract Composition", style_image: styleImage22 },
    { id: 23, style_name: "Dynamic Graffiti Artwork", style_image: styleImage23 },
    { id: 24, style_name: "Gothic Horror Setting", style_image: styleImage24 },
    { id: 25, style_name: "High Dynamic Range Photography", style_image: styleImage25 },
    { id: 26, style_name: "Monochrome Sketch", style_image: styleImage26 },
    { id: 27, style_name: "Moody Gothic Atmosphere", style_image: styleImage27 },
    { id: 28, style_name: "Mythical World", style_image: styleImage28 },
    { id: 29, style_name: "Pencil Sketch Style", style_image: styleImage29 },
    { id: 30, style_name: "Playful Cartoon Style", style_image: styleImage30 },
    { id: 31, style_name: "Pop Art Style", style_image: styleImage31 },
    { id: 32, style_name: "Richly Detailed Baroque Style", style_image: styleImage32 },
    { id: 33, style_name: "Soft Watercolor Style", style_image: styleImage33 },
    { id: 34, style_name: "Surreal Landscape", style_image: styleImage34 },
    { id: 35, style_name: "80s inspired vaporwave style", style_image: styleImage35 },
    { id: 36, style_name: "Thick Oil Painting Style", style_image: styleImage36 },
    { id: 37, style_name: "Ultra Realistic HDR Style", style_image: styleImage37 },
    { id: 38, style_name: "Urban Street Art Style", style_image: styleImage38 },
    { id: 39, style_name: "Vaporwave Aesthetic", style_image: styleImage39 },
    { id: 40, style_name: "Vibrant Pop Art Illustration", style_image: styleImage40 }
])
  const {refreshImageSettings,setRefreshImageSettings} = useContext(RefreshDataContext)
  const {loggedIn}= useContext(AuthContext)

 

  const [tempTrackModel, setTempTrackModel] = useState(null);
  const [tempSelectedAspectRatio, setTempSelectedAspectRatio] = useState(null);
  const [tempTrackStyle, setTempTrackStyle] = useState(null);
  const [tempSelectedQuality, setTempSelectedQuality] = useState(null);
  const [seeMore, setSeeMore] = useState(false);
  

  

  useEffect(() => {
   fetchData();
  },[])

  const moveToFirst = () => {
    setStyleList((prevItems) => {
      if (prevItems.length==0) return prevItems; // No change if invalid index

      const index = prevItems.findIndex(item => item.id==tempTrackStyle);
      // if (index === -1) return prevItems;   

      const updatedItems = [...prevItems]; // Create a copy of the array
      const [movedItem] = updatedItems.splice(index, 1); // Remove item at index
      updatedItems.unshift(movedItem); // Add item to the first index

      return updatedItems;
    });
  };

  useEffect(()=>{
    moveToFirst()
  },[tempTrackStyle])
 

 useEffect(() => {
  const selectedModel = modelsList.find(model => model.id === tempTrackModel);
  
  if (selectedModel) {
   
    const sortedAspectRatios = [...(selectedModel.aspect_ratio_config || [])].sort((a, b) => {
      const ratioA = a.width / a.height;
      const ratioB = b.width / b.height;
      return ratioB - ratioA;
    });
    setAspectRatioList(sortedAspectRatios);

    
    const qualityLevels = (selectedModel.resolution_config || []).map(({ name, quality_level_id, ...rest }) => ({
      ...rest,
      id: quality_level_id,
      resolution: name,
    }));
    setQualityLevelsList(qualityLevels);

    // Set default selections
    const defaultAspectRatio = sortedAspectRatios.find(ar => ar.is_default === 1) || sortedAspectRatios[0];
    const defaultQuality = qualityLevels.find(q => q.is_default === 1) || qualityLevels[0];

    setTempSelectedAspectRatio(defaultAspectRatio?.aspect_ratio_id || null);
    setTempSelectedQuality(defaultQuality?.id || null);
  }
}, [tempTrackModel]);



    useEffect(()=>{
      console.log("isuserLoggedIn :",loggedIn)
      console.log("model list show" , modelsList)
      console.log("aspect ratio list show", aspectRatioList)
      console.log("quality level list", qualityLevelsList)
      
      if(modelsList.length==0){
        return;
      }
      
      const defaultModel = modelsList.find((model) => model.is_default === 1) || modelsList[0];
        console.log("default model", defaultModel)
        const modelAspectRatios = defaultModel.aspect_ratio_config || [];
        const modelResolutions = defaultModel.resolution_config || [];

        const defaultAspectRatio = modelAspectRatios.find(ar => ar.is_default === 1) || modelAspectRatios[0];
        const defaultQuality = modelResolutions.find(q => q.is_default === 1) || modelResolutions[0];
        const defaultStyle = styleList.find((style) => style.is_default === 1) || styleList[0];

      if(!loggedIn){  
        
        // const defaultAspectRatio = aspectRatioList.find((ar) => ar.is_default === 1) || aspectRatioList[0];
        // const defaultQuality = qualityLevelsList.find((ql) => ql.is_default === 1) || qualityLevelsList[0];

        setTempTrackModel(defaultModel?.id || null);
        setTempSelectedAspectRatio(defaultAspectRatio?.aspect_ratio_id || null);
        setTempSelectedQuality(defaultQuality?.quality_level_id || null);
        setTempTrackStyle(defaultStyle?.id || null);
        return;
      }

      // if(localStorage.getItem("image_settings")){
      //   const settings = JSON.parse(localStorage.getItem("image_settings"));
      //     setTempTrackModel(settings.model || modelsList[0]?.id || null);
      //     setTempSelectedAspectRatio(
      //       settings.aspectRatioid || aspectRatioList[0]?.aspect_ratio_id || null
      //     );
      //     setTempSelectedQuality(
      //         settings.quality || qualityLevelsList[0]?.id || null
      //     );
      //     setTempTrackStyle(settings.style || styleList[0]?.id || null);
      //     return;
      // }

        const savedSettings = localStorage.getItem("image_settings");

        if (savedSettings) {
          const settings = JSON.parse(savedSettings);

          const selectedModel = modelsList.find((model) => model.id === settings.model) || defaultModel;
          const selectedAspectRatios = selectedModel.aspect_ratio_config || [];
          const selectedResolutions = selectedModel.resolution_config || [];

          const selectedAspectRatio = selectedAspectRatios.find((ar) => ar.aspect_ratio_id === settings.aspectRatioid) || selectedAspectRatios[0];
          const selectedQuality = selectedResolutions.find((ql) => ql.quality_level_id === settings.quality) || selectedResolutions[0];
          const selectedStyle = styleList.find((style) => style.id === settings.style) || styleList[0];

          setTempTrackModel(selectedModel.id);
          setTempSelectedAspectRatio(selectedAspectRatio?.aspect_ratio_id || null);
          setTempSelectedQuality(selectedQuality?.quality_level_id || null);
          setTempTrackStyle(selectedStyle?.id || null);
          return;
        }



      localStorage.setItem("image_settings", JSON.stringify(
        {
          model: defaultModel.id,
          modalname: defaultModel.name,
          aspectRatioid: defaultAspectRatio?.aspect_ratio_id,
          aspectRatio:  defaultAspectRatio?.ratio,
          quality: defaultQuality?.quality_level_id,
          qualityResolution: defaultQuality?.name,
          style: defaultStyle?.id,
        }
      ))
      setRefreshImageSettings(!refreshImageSettings)
      
    },[modelsList])
    

  
  const handlesubmit = () => {  
    
    localStorage.setItem("image_settings", JSON.stringify(
    {
      model:tempTrackModel,
      modelname: modelsList.find((model) => model.id === tempTrackModel)?.name,
      aspectRatioid:tempSelectedAspectRatio, 
      aspectRatio: aspectRatioList.find((ar) => ar.aspect_ratio_id === tempSelectedAspectRatio)?.ratio,
      quality: tempSelectedQuality,
      qualityResolution: qualityLevelsList.find((ql) => ql.id === tempSelectedQuality)?.resolution,
      style:tempTrackStyle
    }))

      setRefreshImageSettings(!refreshImageSettings)
      closePopup();
  }

  return  (

    <div className="settings-pop-up pop-up-container white-bg"> 
    {
      seeMore ?(
      <div className="pop-up-style-container ">
         <div className="pop-up-title d-flex justify-content-between align-items-center">
                <h4 className="h-2">Style</h4>
                <CloseOutlinedIcon className="material-symbols-outlined pop-up-close d-flex align-items-center justify-content-center" onClick={() => setSeeMore(false)} id="style-pop-up-close-button">close</CloseOutlinedIcon>
        </div>
        <StylePopUp tempTrackStyle= {tempTrackStyle} setTempTrackStyle={setTempTrackStyle} setSeeMore={setSeeMore} />
      </div>

      ):(
        <>
        <div className="pop-up-title d-flex justify-content-between align-items-center">
                <h4 className="h-2">Image Generation Settings</h4>
                <CloseOutlinedIcon className="material-symbols-outlined pop-up-close d-flex align-items-center justify-content-center" onClick={closePopup}>close</CloseOutlinedIcon>
        </div>
        <div className="pop-up-body ">
            {
            !loggedIn&&  
            <p className="text-danger">Login to access image setting</p>
            }
            <div className="pop-up-content d-flex flex-column text-start mt-3"> 
              
                <h5 className="pop-up-model h-3">Model</h5>
                <div className="model-list d-flex flex-wrap ">
                {  
                  modelsList.map((model) => (
                    
                      <div key={model.id} onClick={() => setTempTrackModel(model.id)} className={`pop-up-model-content ${model.id == tempTrackModel&&"active"} ms-3 d-flex justify-content-between align-items-center mb-3 ${((!loggedIn) && model.id!=1)?"unclickable":"not-disable"}`}>
                        <div>   
                          <h5 className="h-4">{model.name}</h5>
                          <p className="p-primary m-0">{model.resolution}</p>
                        </div>
                        <div>
                          <p className="p-primary m-0 ms-2">{model.required_credits} cp<br/>/img</p>
                        </div>
                        
                      </div>
                  ))
                }
                </div>

                <h5 className="h-3">Aspect Ratio</h5>
                <div className="d-flex justify-content-start flex-wrap ">
                  {
                    aspectRatioList.length>0&&aspectRatioList.map((shape) => (

                      <div key={shape.id} onClick={() => setTempSelectedAspectRatio(shape.aspect_ratio_id)}
                      className={`aspect-ratio-box ${ shape.aspect_ratio_id == tempSelectedAspectRatio && "active"} mb-3 ${!loggedIn&& shape.aspect_ratio_id!=2 &&"unclickable"}`}
                      style={{ width: `${shape.width}px`, height: `${shape.height}px` }}
                    >
                      {shape.ratio}

                    </div>
                    ))
                  }
                </div>

                <h5 className="h-3">Quality</h5>
                <div className="d-flex justify-content-start flex-wrap">
                    {qualityLevelsList.map((quality) => (
                        <div
                            key={quality.id}
                            onClick={() => setTempSelectedQuality(quality.id)}
                            className={`quality-box ${ quality.id == tempSelectedQuality && "active"} mb-3 ${!loggedIn&& quality.id!=2&&"unclickable"}`}
                        >
                            {quality.resolution}
                        </div>
                    ))}
                </div>
 
                <div className="d-flex justify-content-between align-items-center ">
                    <h5 className="h-3">Style</h5>
                    <button onClick={() => setSeeMore(true)} className="see-more-button">See More...</button>
                </div>
                <div className="d-flex justify-content-start style-popup">
                  {
                    styleList.map((style, index) => (
                      index < 3 &&
                      <div key={index} className={`style-preview-card ${style.id == tempTrackStyle && "active"} p-1 ${!loggedIn&&"unclickable"}`} >
                        <img src={style.style_image} onClick={() => setTempTrackStyle(style.id)} alt="style" />
                        <h3 onClick={() => setTempTrackStyle(style.id)} className='style-name-heading'>{style.style_name}</h3>
                      </div>
                    ))
                  }
                </div>

                <div className="pop-up-done d-flex justify-content-end align-items-center">
                <button onClick={handlesubmit} className="button dark-button br-10 px-3 py-1 d-flex justify-content-between align-items-center">DONE</button>
              </div>
            </div>
        </div>
        </>
      )
    }
        
    </div>
  )
}

export default IGSettingPopUp;