import React from 'react'
import { useParams } from 'react-router-dom'
import ChatPage from '../Pages/User/ChatPage'

export default function ChatPageLayout() {

    
    const {chatId}= useParams()
  return (
    <ChatPage chatId={chatId}></ChatPage>
  )
}
