import React, { useContext, useEffect, useState } from 'react'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import '../../Css/PublishImagePage.css'
import { axiosPrivate } from '../../API\'s/axios'
import { useLocation, useNavigate } from 'react-router-dom';

function PublishImagePage() {

  const location= useLocation()
  const queryParams = new URLSearchParams(location.search)


  const edit =queryParams.get('edit')
  const tempImageData = JSON.parse(localStorage.getItem('temp_image_data'));
  const [caption,setCaption] = useState("");

  const [success,setSuccess]=useState(false)
  const [errorMessage,setErrorMessage]=useState(null)
  const [error,setError]=useState(false)
  const [successMessage,setSuccessMessage]=useState("")
  const navigate = useNavigate();

  
  const handelSubmit=(e)=>{
    e.preventDefault()
    if(edit==1){
      handelEditCaption()
    }else{
      handlePublish(e)
    }

  }
  useEffect(()=>{
    if(edit==1){
      setCaption(tempImageData.caption)
    }
  },[])

  const handlePublish =async (e) => {
    
    try{
      const response =await  axiosPrivate.post('/publish-to-explore',{
        image_id: tempImageData.image_id,
        image_path: tempImageData.image_path,
        caption: caption
      })
      console.log(response.data)
      if(response.status==200){
        setSuccess(true)
        setSuccessMessage(response.data.message)
        setErrorMessage(null)
        navigate('/explore', { replace: true });
      }
    }catch(error){
      console.error("error in publishing image", error)
      setError(true)
      setErrorMessage(error.response?.data?.message)
    }
  }

  const handelEditCaption=async()=>{
    try{
      const response = await  axiosPrivate.post(`/explore/edit-caption/${tempImageData.published_id}`,{
        caption: caption
      })
      console.log(response.data)
      if(response.status==200){
        setSuccess(true)
        setSuccessMessage(response.data.message)
        setErrorMessage(null)
        navigate(location.state.from.pathname, { replace: true });
      }
    }catch(error){
      console.error("error in editing caption", error)
      setError(true)
      setErrorMessage(error.response?.data?.message)
    }
  }

  return (
    <div className='mt-5 p-3'>
      <form onSubmit={(e)=>handelSubmit(e)}>
      <div className='publish '>
          <h1 className='text-start ms-3 mb-3'>Publish</h1>
          <div className='publish-whole-container d-flex'>
            <div className='publish-left-container ms-2 me-2'>
              <div className='mb-3  w-100'> 
                <div className='caption-heading d-flex text-start '>
                  <h5>Add Caption</h5>
                </div>
                
                  <textarea onChange={(e) => setCaption(e.target.value)} value={caption} placeholder='Share Your Thoughts Here...' className='publish-text-area d-flex flex-column align-items-start w-100'></textarea>
                
              </div>
              <div className='your-prompt-container d-flex flex-column align-items-start  '>
                <div className='prompt-heading '>
                  <h5 className='promt'>
                    Image Prompt:
                  </h5>
                </div>
                <div className='your-content-container'>
                  <div className='prompt-content'>
                    <p className='prompt-content-text text-start'>{tempImageData.prompt}</p>
                  </div>
                </div>
              </div>  
            </div>

            <div className='publish-right-container mb-3'>
              <div className='your-image-container p-2 d-flex justify-content-center align-items-center'>
                {tempImageData ? (
                  <img src={tempImageData.image_url} alt='' className='publish-image' />
                ) : (
                  <p>No Image Selected</p>
                )}
              </div>
              <div className='publish-button-container d-flex justify-content-end'>
                <button type='submit' className='publish-button button-wh dark-button-wh d-flex px-5'>
                  <p  className='flex-1'>{edit?'Edit':'Publish'}</p>
                  <span className="material-symbols-outlined ms-2">send</span>
                </button>
              </div>
            </div>
          </div>
      </div>
      </form>
    </div>
  )
}

export default PublishImagePage;