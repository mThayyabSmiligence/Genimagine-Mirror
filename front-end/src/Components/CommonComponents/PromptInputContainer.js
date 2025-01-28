import React, { useRef, useState } from 'react'
import "../../Css/PromptInputContainer.css"

export default function PromptInPutContainer({promptText,setPromptText,generateImage}) {


  const pRef= useRef(null)
  const handelInput=(e)=>{
    setPromptText(e.target.innerText)
  }
  const handelClick=()=>{
    if(pRef.current){
      pRef.current.innerText=""
    }
    if(promptText==""){
      alert("fill the prompt")
      return
    }
    generateImage()
    setPromptText("")
  }
  return (
    <div className='prompt-outer-container w-75 light-grey-bg br-10 d-flex  align-items-end p-2 mb-2'   >

      <div className='prompt-input-container'>
        <p ref={pRef}
          className='p-input'
          contentEditable="true"
          onInput={(e)=>handelInput(e)}
        ></p>
      </div>
      <div>
        <button className='border-0 send-button d-flex align-items-center justify-content-center br-20' 
                onClick={handelClick}
         ><span class="material-symbols-outlined">arrow_forward</span></button>
      </div>
    </div>
  )
}
