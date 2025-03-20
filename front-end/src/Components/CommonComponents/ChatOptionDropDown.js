import React from 'react'
import '../../Css/ChatOptionDropDown.css'

function ChatOptionDropDown({handleRename,handleDelete}) {
  return (
    <div className="list-option-menu p-0 d-flex flex-column justify-content-center">
        <button onClick={()=>handleRename()} className="list-option-item " >Rename</button>
        <button onClick={()=>{handleDelete()}} className="list-option-item">Delete</button>
    </div>
  )
}

export default ChatOptionDropDown;