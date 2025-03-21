import React, { useEffect, useState } from 'react'



export default function ChatList({chats}) {
    const groupChatsByDate=(chats)=> {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
    
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
    
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
        const groups = {
          Today: [],
          Yesterday: [],
          'This Week': [],
          'This Month': [],
          Older: {},
        };
    
        chats.forEach(chat => {
          const chatDate = new Date(chat.updated_at);
          const chatYear = chatDate.getFullYear();
          const chatMonth = chatDate.toLocaleString('default', { month: 'long' });
    
          if (chatDate.toDateString() === today.toDateString()) {
            groups.Today.push(chat);
          } else if (chatDate.toDateString() === yesterday.toDateString()) {
            groups.Yesterday.push(chat);
          } else if (chatDate >= startOfWeek) {
            groups['This Week'].push(chat);
          } else if (chatDate >= startOfMonth) {
            groups['This Month'].push(chat);
          } else {
            if (!groups.Older[chatYear]) groups.Older[chatYear] = {};
            if (!groups.Older[chatYear][chatMonth]) groups.Older[chatYear][chatMonth] = [];
            groups.Older[chatYear][chatMonth].push(chat);
          }
        });
    
        return groups;
      }
    const [groupedChat,setGroupedChat]=useState(groupChatsByDate(chats))
    
    useEffect(()=>{
        setGroupedChat(groupChatsByDate(chats));
    },[chats])

    const truncateString=(str)=> {
        return str.length > 20 ? str.substring(0, 17) + "..." : str;
    }
    
  return (
    <div className='chat-list'>
        {
            Object.entries(groupedChat).map(([group,chats])=>(
                <div key={group}>
                    <h6>{group}</h6>
                    {
                        Array.isArray(chats)?(
                            chats.length>0?(
                                chats.map(chat=><div key={chat}>{truncateString(chat.chat_name)}</div>)
                            ):(
                                <div>no data</div>
                            )
                        ):(
                          Object.entries(chats).map(([year,months])=>(
                            <div key={year}>
                              <h6>{year}</h6>
                              {
                                Object.entires(months).map(([month,monthChats])=>(
                                  <div key={month}>
                                    <h6>{month}</h6>
                                    {
                                      monthChats.map((chat)=>(
                                        <div key={chat}>{truncateString(chat.chat_name)}</div>
                                      ))
                                    }
                                  </div>
                                ))
                              }
                            </div>
                          ))
                        )
                    }
                </div>
            ))
        }
    </div>
  )
}
