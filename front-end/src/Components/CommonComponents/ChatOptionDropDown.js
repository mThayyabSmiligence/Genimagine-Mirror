import React from 'react'
import '../../Css/ChatOptionDropDown.css'

function ChatOptionDropDown() {
  return (
    <div className="option-menu p-0 d-flex flex-column justify-content-center">
        <button className="option-item ">Rename</button>
        <button className="option-item">Delete</button>
    </div>
  )
}

export default ChatOptionDropDown;