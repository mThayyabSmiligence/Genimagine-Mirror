import React, { useContext, useEffect, useState } from 'react'

import AuthContext from '../../Context/AuthProvider'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import { axiosPrivate, useAxiosGenerateImage } from '../../API\'s/axios'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import PromptInPutContainer from '../../Components/CommonComponents/PromptInputContainer'
import SuggestionPrompts from '../../Components/CommonComponents/SuggestionPrompts'
import ChatContainer from '../../Components/CommonComponents/ChatContainer'


export default function ChatPage() {


    const {chatId}= useParams()
    

    const {loggedIn} = useContext(AuthContext)
    const { refreshChatList,setRefreshChatList} = useContext(RefreshDataContext)

    const axiosGenerateImage=useAxiosGenerateImage()

    const [promptText,setPromptText]=useState("")
    const [chat,setChat]= useState([])
    const [model,setModel]= useState(1)
    const [error, setError] = useState(null); // Handle errors gracefully
    const [loading, setLoading] = useState(false);
    const [dummyData,setDummyData]=useState(
      {
        generatedImage:null,
        prompt:"nothing just testing"
      }
    )
    useEffect(() => {
        // Scroll to the bottom of the page when the component mounts
        window.scrollTo(0, document.body.scrollHeight);
    }, [loading]); 
    useEffect(() => {
        
        setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight);
        }, 500);
    }, [chatId]);

    useEffect(()=>{
        getChatData()
    },[chatId])


    const getChatData=async()=>{
        try {
            console.log("checking chatid inside api ", chatId)
            const response = await axiosPrivate.get(`get-chat-data/${chatId}`,
            {
              withCredentials:true,
            });
            setChat(response.data.message)
        } catch (error) {
            console.error('Error fetching chat data:', error);
            setError('Failed to fetch chat data. Please try again later.');
        }
    }

    const generateImage = async () => {
        setDummyData({
          prompt:promptText
        })
        
        setLoading(true);
        setPromptText("") // Start loading
        try {
          
          const response = await axiosGenerateImage.post(
            '/',
            { 
              prompt: promptText ,
              chat_id:chatId,
              model:model  
            }, // Ensure the response is handled as binary
          );
          console.log(response.data)
   
          setChat((prevItems)=>[...prevItems,
            response.data
          ])
   
        } catch (error) {
          console.error('Error generating image:', error);
          setError('Failed to generate image. Please try again later.');
        } finally {
          setLoading(false);
          setPromptText("")
        }
      };
  return (
     <div className=' guest-content-container h-100 flex-grow-1  d-flex flex-column align-items-center justify-content-end'>
    
            <div className=' d-flex flex-column align-items-center justify-content-end mb-5 mt-3 w-100'>
              {
                chat.map((item,index)=>(<ChatContainer key={index} data={item}></ChatContainer>))
              }
              {
                loading&&
                <ChatContainer data={dummyData}></ChatContainer>
              }
            </div>
    
    
            <PromptInPutContainer generateImage={generateImage} promptText={promptText} setPromptText={setPromptText}></PromptInPutContainer>
            {
              1&&
              <SuggestionPrompts></SuggestionPrompts>
            }
        </div>
  )
}
