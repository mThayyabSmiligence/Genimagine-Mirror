import React, { useContext, useState } from 'react'
import { axiosInstance } from '../../API\'s/axios'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function LibraryImageContainer({library,index,removeImageFromLibraryArray}) {
    const [showOptions, setShowOptions] =useState(false)
    const [success,setSuccess]=useState(false)
    const [errorMessage,setErrorMessage]=useState(null)
    const [error,setError]=useState(false)
    const [successMessage,setSuccessMessage]=useState("")
    const [isLibrary,setIsLibrary]= useState(false)
    const { setTempImageData } = useContext(RefreshDataContext); 
    const navigate = useNavigate();




    const deleteFromLibrary= async(image_id)=>{
              try{
                const response = await axiosInstance.delete(`/user/delete-from-library/${image_id}`);
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
    <div key={library.id} className={`library-image-container ${library.aspect_ratio } d-flex align-items-center justify-content-center  `} >
                                <img className=' m-3' src={library.image_url }></img>
                                
                                  {
                                    (library.image_url||library.image)&&
                                    <div className='image-options'>
                                    <span onClick={()=>setShowOptions(!showOptions)}  className="material-symbols-outlined image-dot-options">more_vert</span>
                                    {showOptions && (
                                      <div className="options-dropdown">
                                        <button className='option-item' onClick={()=>window.open(library.image_url  ,"_blank")}><span className="material-symbols-outlined">fullscreen</span>Full Screen</button>
                                        <span className='option-divider'></span>
                                        <a  onClick={(e)=>download(e)} download="download" href={library.image_url} className="option-item "><span class="material-symbols-outlined">download</span>Download</a>
                                        <span className='option-divider'></span>
                                        {(library.library==1)?
                                            <div className="option-item" onClick={()=>deleteFromLibrary(library.image_id)}><span class="material-symbols-outlined">bookmark_check</span>Added to Library</div>
                                            :
                                            <div  className="option-item"><span class="material-symbols-outlined">bookmark_add</span>Add to Library</div>
                                        }
                                        
                                        <span className='option-divider'></span>
                                        <div className="option-item" onClick={handlePublish}><span className="material-symbols-outlined">publish</span>Publish</div>
                                        <span className='option-divider'></span>
                                        
                                      </div>
                                    )}
                                  </div>
                                    
                                  }
                            </div>
  )
}
