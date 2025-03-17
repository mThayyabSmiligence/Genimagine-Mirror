import React, { useContext, useEffect, useRef, useState } from 'react'
import { axiosInstance, axiosPrivate } from '../../API\'s/axios'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import RemoveFromLibrary from '../CommonComponents/RemoveFromLibrary'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkAddedOutlinedIcon from '@mui/icons-material/BookmarkAddedOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined';


export default function LibraryImageContainer({library,imageColumns,index,removeImageFromLibraryArray}) {
    const [showOptions, setShowOptions] =useState(false)
    const optionsRef = useRef(null);  
    const [success,setSuccess]=useState(false)
    const [errorMessage,setErrorMessage]=useState(null)
    const [error,setError]=useState(false)
    const [successMessage,setSuccessMessage]=useState("")
    const [isLibrary,setIsLibrary]= useState(false)
    const { setTempImageData } = useContext(RefreshDataContext); 
    const [showRemoveLibraryPopUp, setShowRemoveLibraryPopUp] = useState(false);
    const navigate = useNavigate();

      useEffect(()=>{
        console.log("index: ",index," imageCloumns: ",imageColumns);
      },[imageColumns])

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


    const deleteFromLibrary= async()=>{
              try{
                const response = await axiosPrivate.delete(`/delete-from-library/${library.image_id}`);
                setSuccess(true);
                setSuccessMessage("Image deleted from library successfully");
                console.log(" ",response.data)
                setIsLibrary(false)
                removeImageFromLibraryArray(index)

                
              }catch(error){
                setError(true)
                setErrorMessage("Failed to delete image")
                console.log("Failed to delete image",error.response)
              }
            }

            const handlePublish = () => {
              localStorage.setItem("temp_image_data", JSON.stringify(library));
              navigate('/u/publish');
            }

            const download = (e) => {
              e.preventDefault(); // Prevent default behavior
    
              axios.get(library.image_url, {
                  responseType: "blob", // Ensure the response is a binary blob
                  withCredentials: true, // Include credentials if needed
              })
              .then((response) => {
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", `${library.prompt+library.image_id}.png`); // Set the file name
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link); // Cleanup
                  URL.revokeObjectURL(url); // Free memory
              })
              .catch((error) => {
                  console.error("Error downloading the image:", error);
              });
            }
  return (
    <div key={library.id} className={`library-image-container ${library.aspect_ratio } ${(index+1)%imageColumns==0&&'last-column'} d-flex align-items-center justify-content-center br-10 `} >
                                <img src={library.image_url }></img>
                                
                                  {
                                    (library.image_url||library.image)&&
                                    <div className='image-options'>
                                    <MoreVertOutlinedIcon onClick={()=>setShowOptions(!showOptions)}  className="material-symbols-outlined image-dot-options">more_vert</MoreVertOutlinedIcon>
                                    {showOptions && (
                                      <div className="options-dropdown" ref={optionsRef}>
                                        <button className='option-item' onClick={()=>window.open(library.image_url  ,"_blank")}><FullscreenOutlinedIcon className='icon'/> Full Screen</button>
                                        <span className='option-divider'></span>
                                        <a  onClick={(e)=>download(e)} download="download" href={library.image_url} className="option-item "><FileDownloadOutlinedIcon className='icon'/> Download</a>
                                        <span className='option-divider'></span>
                                        {(library.library==1)?
                                            <div className="option-item" onClick={()=>setShowRemoveLibraryPopUp(true)}><BookmarkAddedOutlinedIcon className='icon'/>Added to Library</div>
                                            :
                                            <div  className="option-item"><BookmarkAddOutlinedIcon className='icon'/> Add to Library</div>
                                        }
                                        {showRemoveLibraryPopUp &&
                                          <RemoveFromLibrary 
                                              onHide={() => setShowRemoveLibraryPopUp(false)}
                                              deleteFromLibrary={deleteFromLibrary}
                                              message="Are you sure you want to delete this item forn your library?"
                                              showRemoveLibraryPopUp = {showRemoveLibraryPopUp}
                                          />
                                        }
                                        <span className='option-divider'></span>
                                        <div onClick={library.is_published ?()=>{}: handlePublish} className={`option-item ${library.is_published&&"disable"}`}><FileUploadOutlinedIcon className='icon'/> Publish</div>
                                        <span className='option-divider'></span>
                                        
                                      </div>
                                    )}
                                  </div>
                                    
                                  }
                            </div>
  )
}
