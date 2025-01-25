import React, { useState } from 'react'
import PromptInPutContainer from '../../Components/CommonComponents/PromptInputContainer'

export default function GuestContentPage() {

    const [chatList,setChatList]= useState([])
    const [chat,setChat]= useState([])
  return (
    <div>
        <PromptInPutContainer></PromptInPutContainer>
    </div>
  )
}
