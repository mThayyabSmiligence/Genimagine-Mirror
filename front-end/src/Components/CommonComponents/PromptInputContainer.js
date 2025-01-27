import React, { useState } from 'react'
import "../../Css/PromptInputContainer.css"

export default function PromptInPutContainer() {
  const[promptText,setPromptText]=useState("")
  const handelInput=(e)=>{
    setPromptText(e.target.innerText)
  }
  return (
    <div className='prompt-outer-container w-75 light-grey-bg br-10 d-flex  align-items-end p-2 mb-2'   >

      <div className='prompt-input-container'>
        <p 
          className='p-input'
          contentEditable="true"
          onInput={(e)=>handelInput(e)}
        ></p>
      </div>
      <div>
        <button className='border-0 send-button d-flex align-items-center justify-content-center br-20'><span class="material-symbols-outlined">arrow_forward</span></button>
      </div>
    </div>
  )
}
