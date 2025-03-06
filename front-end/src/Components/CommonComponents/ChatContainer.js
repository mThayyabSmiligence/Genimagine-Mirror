import React, { useContext, useEffect, useState, useRef} from 'react'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import "../../Css/ChatContainer.css"

import { useNavigate} from 'react-router-dom'

import axios from 'axios';
import { axiosInstance, axiosPrivate } from '../../API\'s/axios';

 
export default function ChatContainer({data,showOptionsId,setShowOptionsId}) {

  const Navigate = useNavigate();
  
  const { setTempImageData } = useContext(RefreshDataContext); 

  const navigate = useNavigate();

  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);                                       

  const [success,setSuccess]=useState(false)
  const [errorMessage,setErrorMessage]=useState(null)
  const [error,setError]=useState(false)
  const [successMessage,setSuccessMessage]=useState("")

  const [isLibrary,setIsLibrary]= useState(false)


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

      const download = (e) => {
        e.preventDefault(); // Prevent default behavior
    
        axios.get(data.image_url, {
            responseType: "blob", // Ensure the response is a binary blob
            withCredentials: true, // Include credentials if needed
        })
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${data.prompt+data.image_id}.png`); // Set the file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link); // Cleanup
            URL.revokeObjectURL(url); // Free memory
        })
        .catch((error) => {
            console.error("Error downloading the image:", error);
        });
    };
    

      const handelDeleteImage=async (e)=>{
        e.preventDefault();
        try{
            const response =await axiosPrivate.delete(`/delete-image/${data.image_id}`,
              {withCredentials:true 

              }
            )
            
            setSuccess(true)
            setSuccessMessage("Image deleted successfully")
            console.log("Image deleted successfully",response)
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

  return (
    <div className='chat-container d-flex flex-column m-2 my-4  mb-5 px-4'>

        <div className=' chat-prompt-outer-container d-flex justify-content-end'>
            <div className='chat-prompt-container'>
                <p className='chat-prompt'>{data.prompt}</p>
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
              <button className='full-screen-button' onClick={()=>window.open(data.image?data.image:data.image_url  ,"_blank")}><span className="material-symbols-outlined">fullscreen</span></button>
              
            }
            {
              (data.image_url||data.image)&&
              <div className='image-options' ref={optionsRef}>                                    
              <span onClick={handleToggleOptions} className="material-symbols-outlined image-dot-options">more_vert</span>
              {showOptions && (
                <div className="options-dropdown">
                  <a onClick={(e)=>download(e)} className="option-item "><span class="material-symbols-outlined">download</span>Download</a>
                  <span className='option-divider'></span>
                  {(isLibrary||data.library==1)?
                      <div onClick={deleteFromLibrary} className="option-item"><span class="material-symbols-outlined">bookmark_check</span>Added to Library</div>
                      :
                      <div onClick={addToLibrary} className="option-item"><span class="material-symbols-outlined">bookmark_add</span>Add to Library</div>
                  }
                  
                  <span className='option-divider'></span>
                  <div onClick={handlePublish} className="option-item"><span class="material-symbols-outlined">publish</span>Publish</div>
                  <span className='option-divider'></span>
                  <button onClick={(e)=>handelDeleteImage(e)} className="option-item"><span class="material-symbols-outlined">delete</span>Delete</button>
                </div>
              )}
            </div>
            }
        </div>
    </div>
  )
}
