import React, { useContext, useEffect, useState, useRef} from 'react'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import "../../Css/ChatContainer.css"

import { useNavigate} from 'react-router-dom'

import axios from 'axios';
import { axiosInstance, axiosPrivate } from '../../API\'s/axios';
import AuthContext from '../../Context/AuthProvider';
import DeletePopUp from './DeletePopUp';
import RemoveFromLibrary from './RemoveFromLibrary';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkAddedOutlinedIcon from '@mui/icons-material/BookmarkAddedOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined';

 
export default function ChatContainer({data,handelDeleteFromState,showOptionsId,setShowOptionsId, handleGuestImageDelete, index  }) {

  const Navigate = useNavigate();
  
  const { setTempImageData ,refreshLibraryData,setRefreshLibraryData,refreshImageSettings} = useContext(RefreshDataContext); 
  const {loggedIn} = useContext(AuthContext)

  const navigate = useNavigate();

  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);                                       

  const [success,setSuccess]=useState(false)
  const [errorMessage,setErrorMessage]=useState(null)
  const [error,setError]=useState(false)
  const [successMessage,setSuccessMessage]=useState("")

  const [isLibrary,setIsLibrary]= useState(false)
  const [showDeletePopUp, setShowDeletePopUp] = useState(false);

  const [showRemoveLibraryPopUp, setShowRemoveLibraryPopUp] = useState(false);
  const [aspectRatio,setAspectRatio] =useState(null);

  useEffect(()=>{
    if(localStorage.getItem('image_settings')){
      const imageSettings = JSON.parse(localStorage.getItem('image_settings'));
      setAspectRatio(imageSettings.aspectRatio.aspectRatio)
    }
    
  },[refreshImageSettings])
  const handleToggleOptions = () => {
    setShowOptions((prev) => !prev);
  };


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
      const handleClickOutside = (e) => {
        if (optionsRef.current && !optionsRef.current.contains(e.target)) {
          setShowOptions(false);
        }
      };
  
      if (showOptions) {
        document.addEventListener("mousedown", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
      }
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showOptions]);

    

    const getWidth=(aspect_ratio)=>{
        if(aspect_ratio=="16:9"){
         return width>700?432:300
        }else if(aspect_ratio=="9:16"){
          return  width>700?243:160;
         }
         else if(aspect_ratio=="1:1"){
          return  width>700?400:280;
         }

    }
    const getHeight=(aspect_ratio)=>{
      if(aspect_ratio=="16:9"){
       return width>700?243:160
      }else if(aspect_ratio=="9:16"){
        return  width>700?432:300;
       }
       else if(aspect_ratio=="1:1"){
        return  width>700?400:280;
       }

  }

    const boxStyle = {
        width: getWidth(data.aspect_ratio||"1:1"),
        height:getHeight(data.aspect_ratio||"1:1"),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #ccc',
        borderRadius: '10px',
        position: 'relative',
        backgroundColor: '#f9f9f9',
      };
    
      const spinnerStyle = {
        width: '40px',
        height: '40px',
        border: '4px solid #ccc',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      };

      const download =async (e) => { 
        e.preventDefault(); 
        if(!loggedIn){
          const link = document.createElement("a");
          link.href = data.image;
          link.download = `${data.prompt}.jpg`; // Change the filename if needed
          document.body.appendChild(link); 
          link.click();
          document.body.removeChild(link);
          return
        }
       // Prevent default behavior

        try {
          const response = await fetch(data.image_url);
          if (!response.ok) {
              throw new Error("Failed to fetch the image");
          }
  
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${data.prompt + data.image_id}.png`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url); // Clean up
      } catch (error) { 
          console.error("Error downloading the image:", error);
      }
    };
    


      const handelDeleteImage=async (e)=>{
        if(!loggedIn){    
          handleGuestImageDelete(index); 
          setShowDeletePopUp(false);
          return;
        }
        e.preventDefault();
        try{
            const response =await axiosPrivate.delete(`/delete-image/${data.image_id}`,
              {
                withCredentials:true
              }
            )
            
            setSuccess(true)
            setSuccessMessage("Image deleted successfully")

            console.log("Image deleted successfully",response)
            handelDeleteFromState(data.image_id)
            setShowDeletePopUp(false);
        }catch(error){
            setError(true)
            setErrorMessage("Failed to delete image",error)
            console.log("Failed to delete image",error)
        }
      }

      const addToLibrary = async() => {
        try{
          const response = await axiosInstance.put(`/user/add-to-library/${data.image_id}`);
          setSuccess(true);
          setSuccessMessage("Image added to library successfully");
          console.log("Image added to library successfully",response.data)
          setIsLibrary(true)
          data.library=1
          setRefreshLibraryData(true)
        }catch(error){
          setError(true)
          setErrorMessage("Failed to add to library ");
          console.log("Failed to add to library",error.response)
        }
      }

      const deleteFromLibrary= async()=>{
        try{
          const response = await axiosPrivate.delete(`/delete-from-library/${data.image_id}`);
          setSuccess(true);
          setSuccessMessage("Image deleted from library successfully");
          console.log(" ",response.data)
          setIsLibrary(false)
          data.library=0
          setRefreshLibraryData(true)
          setShowRemoveLibraryPopUp(false)
        }catch(error){
          setError(true)
          setErrorMessage("Failed to delete image")
          console.log("Failed to delete image",error.response)
        }
      }

      const handlePublish=()=>{
        localStorage.setItem("temp_image_data",JSON.stringify(data))
        Navigate('/u/publish')
      }

      const handleFullScreen = () => {
        if(!loggedIn){
          const newTab = window.open();
          newTab.document.write(`<div style="height: 100vh; width: 100%; display: flex; justify-content: center; align-items: center;"><img src="${data.image}" alt="Centered Image" style="max-width: 100%; height: auto;"></div>`);
          return
        }
        window.open(data.image_url,'_blank')
      };
  return (
    <div className='chat-container d-flex flex-column m-2 my-4  mb-5 px-4'>

        <div className=' chat-prompt-outer-container d-flex justify-content-end'>
            <div className='chat-prompt-container'>
                <p className='chat-prompt text-break'>{data.prompt}</p>
            </div>
        </div>

        <div className='chat-image-container image-section d-flex justify-content-start'>
            {
                data.image_url==null&&data.image==null?
                <div style={boxStyle}>
                <div style={spinnerStyle}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
              :<img src={data.image?data.image:`${data.image_url}`} alt={data.prompt} style={boxStyle}></img>
              
            }{
              (data.image_url||data.image)&&
              !showOptions&&
              <button className='full-screen-button' onClick={()=>handleFullScreen()}><FullscreenOutlinedIcon className='icon'/></button>
              
            }
            {
              (data.image_url||data.image)&&
              <div className='image-options' ref={optionsRef}>                                    
              <MoreVertOutlinedIcon onClick={handleToggleOptions} className="image-dot-options" id="image-dot-options"></MoreVertOutlinedIcon>
              {showOptions&& (
                <div className={`options-dropdown ${data.aspect_ratio!="9:16"?"left":"right"} `}>
                  <a onClick={(e)=>download(e)} className="option-item "><FileDownloadOutlinedIcon  className='icon'/> Download</a>
                  <span className='option-divider'></span>
                  {loggedIn && <>                                                    
                    {(isLibrary||data.library==1)?
                      <div onClick={() => setShowRemoveLibraryPopUp(true)} className="option-item"><BookmarkAddedOutlinedIcon  className='icon'/>Added to Library</div>
                      :
                      <div onClick={addToLibrary} className="option-item"><BookmarkAddOutlinedIcon  className='icon'/> Add to Library</div>
                    } 
                    <span className='option-divider'></span>
                    <div onClick={data.is_published ?()=>{}: handlePublish} className={`option-item ${data.is_published&&"disable"}`}><FileUploadOutlinedIcon  className='icon'/> Publish</div>
                    <span className='option-divider'></span>
                  </>
                  }
                  {showRemoveLibraryPopUp &&
                    <RemoveFromLibrary 
                        onHide={() => setShowRemoveLibraryPopUp(false)}
                        deleteFromLibrary={deleteFromLibrary}
                        message="Are you sure you want to remove this item from your library?"
                        showRemoveLibraryPopUp = {showRemoveLibraryPopUp}
                    />
                  }
                    <button onClick={() =>setShowDeletePopUp(true)} className='option-item option-button'><DeleteOutlineOutlinedIcon className='icon'/> Delete</button>

                </div>
              )}
            </div>
            }
        </div>
        <DeletePopUp
                      onHide={() => setShowDeletePopUp(false)}
                      handelDelete={handelDeleteImage}
                      message="Are you sure you want to delete this item forn your published image page?"
                      showDeletePopUp = {showDeletePopUp}
         />
    </div>
  )
}
