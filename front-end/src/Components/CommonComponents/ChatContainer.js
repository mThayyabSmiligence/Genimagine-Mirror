import React, { useContext, useState } from 'react'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import "../../Css/ChatContainer.css"

import { useNavigate} from 'react-router-dom'
import axios from 'axios';
import { axiosInstance } from '../../API\'s/axios';


export default function ChatContainer({data}) {

  const Navigate = useNavigate();
  
  const { setTempImageData } = useContext(RefreshDataContext); 

  const [showOptions, setShowOptions] = useState(false);

  const [success,setSuccess]=useState(false)
  const [errorMessage,setErrorMessage]=useState(null)
  const [error,setError]=useState(false)
  const [successMessage,setSuccessMessage]=useState("")

  const [isLibrary,setIsLibrary]= useState(false)


  const handleToggleOptions = () => {
    setShowOptions(!showOptions);
  };

 

    const getWidth=(aspect_ratio)=>{
        if(aspect_ratio=="16:9"){
         return 432
        }else if(aspect_ratio=="9:16"){
          return  243;
         }
         else if(aspect_ratio=="1:1"){
          return  400;
         }

    }
    const getHeight=(aspect_ratio)=>{
      if(aspect_ratio=="16:9"){
       return 243
      }else if(aspect_ratio=="9:16"){
        return  432;
       }
       else if(aspect_ratio=="1:1"){
        return  400;
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

      const handelDeleteImage=async ()=>{
        try{
            const response =await axios.delete(`http://localhost:3001/api/v1/user/delete-image/${data.image_id}`,
              {withCredentials:true 

              }
            );
            setSuccess(true)
            setSuccessMessage("Image deleted successfully")
            window.location.reload(false);
            console.log("Image deleted successfully",response.data)
        }catch(error){
            setError(true)
            setErrorMessage("Failed to delete image")
            console.log("Failed to delete image",error.response)
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
          const response = await axiosInstance.delete(`/user/delete-from-library/${data.image_id}`);
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
        setTempImageData(data); 
        Navigate('/u/publish')
      }

  return (
    <div className='chat-container d-flex flex-column w-75 m-2 my-4 px-4'>

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
              <div className='image-options'>
              <span onClick={handleToggleOptions} className="material-symbols-outlined image-dot-options">more_vert</span>
              {showOptions && (
                <div className="options-dropdown">
                  <a download="download" href={data.image_url} className="option-item "><span class="material-symbols-outlined">download</span>Download</a>
                  <span className='option-divider'></span>
                  {(isLibrary||data.library==1)?
                      <div onClick={deleteFromLibrary} className="option-item"><span class="material-symbols-outlined">bookmark_check</span>Added to Library</div>
                      :
                      <div onClick={addToLibrary} className="option-item"><span class="material-symbols-outlined">bookmark_add</span>Add to Library</div>
                  }
                  
                  <span className='option-divider'></span>
                  <div onClick={handlePublish} className="option-item"><span class="material-symbols-outlined">publish</span>Publish</div>
                  <span className='option-divider'></span>
                  <button onClick={()=>handelDeleteImage()} className="option-item"><span class="material-symbols-outlined">delete</span>Delete</button>
                </div>
              )}
            </div>
              
            }
           
        </div>
        
    </div>
  )
}
