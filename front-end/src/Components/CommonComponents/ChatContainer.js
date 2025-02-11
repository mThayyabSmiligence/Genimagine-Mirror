import React from 'react'
import "../../Css/ChatContainer.css"

export default function ChatContainer({data}) {

    const boxStyle = {
        width: '400px',
        height: '400px',
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
  return (
    <div className='chat-container d-flex flex-column w-75 m-2 my-4 px-4'>

        <div className=' chat-prompt-outer-container d-flex justify-content-end'>
            <div className='chat-prompt-container'>
                <p className='chat-prompt'>{data.prompt}</p>
            </div>
        </div>

        <div className='chat-image-container d-flex justify-content-start'>
            {
                data.image_url==null?<div style={boxStyle}>
                <div style={spinnerStyle}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
              :<img src={`${data.image_url}`} alt={data.prompt} style={boxStyle}></img>
            }
        </div>
        
    </div>
  )
}
