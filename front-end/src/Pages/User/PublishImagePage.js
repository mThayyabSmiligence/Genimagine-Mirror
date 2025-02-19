import React, { useContext } from 'react'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import '../../Css/PublishImagePage.css'

function PublishImagePage() {
  const {tempImageData }= useContext(RefreshDataContext)
  return (
    <div className='mt-5 p-3'>
      <div className='publish '>
        <h1 className='text-start ms-3 mb-3'>Publish</h1>
          <div className='publish-whole-container d-flex'>
            <di v className='publish-left-container  ms-2 me-2'>
              <div className='mb-3  w-100'> 
                <div className='caption-heading d-flex text-start '>
                  <h5>Add Caption</h5>
                </div>
                <form >
                  <textarea placeholder='Share Your Thoughts Here...' className='publish-text-area d-flex flex-column align-items-start w-100'></textarea>
                </form>
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
            </di>

            <div className='publish-right-container mb-3'>
              <div className='your-image-container p-2 d-flex justify-content-center align-items-center'>
                {tempImageData ? (
                  <img src={tempImageData.image_url} alt='' className='publish-image' />
                ) : (
                  <p>No Image Selected</p>
                )}
              </div>
              <div className='publish-button-container d-flex justify-content-end'>
                <button className='publish-button button-wh dark-button-wh d-flex px-5'>
                  <p className='flex-1'>Publish</p>
                  <span className="material-symbols-outlined ms-2">send</span>
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

export default PublishImagePage