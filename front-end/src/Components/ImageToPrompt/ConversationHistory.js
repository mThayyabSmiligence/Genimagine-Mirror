import React from 'react'
import Card from './Card'

export default function ConversationHistory({conversationHistory}) {
  return (
      <div className='container'>
        <h2 className='mb-3 text-start h3 font-weight-bold text-dark'>Conversation History</h2>
        <div className='d-flex flex-column gap-3'>
          
          {conversationHistory && conversationHistory.map((item, index) => (
            <Card key={index} data={item}></Card>
          ))}
        </div>
      </div>
  )
}
