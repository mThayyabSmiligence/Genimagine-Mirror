import React, { useState } from 'react'
import PromptInPutContainer from '../../Components/CommonComponents/PromptInputContainer'
import "../../Css/GuestContentContainer.css"
import SuggestionPrompts from '../../Components/CommonComponents/SuggestionPrompts'

export default function GuestContentPage() {

    const [chatList,setChatList]= useState([])
    const [chat,setChat]= useState([])

  return (
    <div className=' guest-content-container h-100 flex-grow-1  d-flex flex-column align-items-center justify-content-end'>
        <PromptInPutContainer></PromptInPutContainer>
        {
          1&&
          <SuggestionPrompts></SuggestionPrompts>
        }
    </div>
  )
}
