import React from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Slide, toast } from 'react-toastify';

export default function Card({data}) {
  const handelCopy = () => {
    navigator.clipboard.writeText(data.prompt)
     toast.success('prompt copied successfully!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Slide,
            });
  }
  return (
    <div className="card-container">
      <div className="card-image-section">
        <img 
          src={data.image_url||data.image} 
          alt={data.prompt}
          className="card-image"
        />
        <span className="card-label">Image</span>
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">Generated Prompt</h3>
          <button 
            className="copy-button"
            onClick={handelCopy}
            aria-label="Copy content"
          >
            <ContentCopyIcon className=''/>
             
          </button>
        </div>
        
        <p className="card-description text-justify">
          {data.prompt}
        </p>
         
        {data.created_at && (
          <span className="card-timestamp">
            {new Date(data.created_at).toLocaleString()}
          </span>
        )}
        
      </div>
    </div>
    // <div className='image-to-prompt-card row'>
    //   <div className='image-container col-lg-3 col-sm-12' >
    //     <img src={data.preview||data.image} alt="" />
    //   </div>
    //   <div className='col-lg-9 col-sm-12 '>
    //     <div className='d-flex justify-content-between'>
    //       <p>Generated prompt</p>
    //       <button className='blank-button' onClick={handelCopy} ><ContentCopyIcon/></button>
    //     </div>
    //     <p>{data.prompt}</p>
    //   </div>
    // </div>

  )
}
