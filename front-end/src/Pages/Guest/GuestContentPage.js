import React, { useContext, useEffect, useState } from 'react'
import PromptInPutContainer from '../../Components/CommonComponents/PromptInputContainer'
import "../../Css/GuestContentContainer.css"
import SuggestionPrompts from '../../Components/CommonComponents/SuggestionPrompts'
import ChatContainer from '../../Components/CommonComponents/ChatContainer'
import { useAxiosGenerateImage } from '../../API\'s/axios'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../Hooks/useAuth'
import AuthContext from '../../Context/AuthProvider'
import RefreshDataContext from '../../Context/RefreshDataProvider'

export default function GuestContentPage() {

    const [trackmodel,setTrackModel] = useState('')
    const [selectedAspectRatio, setSelectedAspectRatio] = useState('');

    const navigate =useNavigate()
    const {loggedIn} = useContext(AuthContext)
    const { refreshChatList,setRefreshChatList} = useContext(RefreshDataContext) 
    // const [chatList,setChatList]= useState([])
    const [promptText,setPromptText]=useState("")
    const [chat,setChat]= useState([
      
    ])
    const [image, setImage] = useState(null);
    
    const [loading, setLoading] = useState(false);
    const [dummyData,setDummyData]=useState(
      {
        generatedImage:null,
        prompt:"nothing just testing"
      }
    )


    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null)


    const axiosGenerateImage=useAxiosGenerateImage()
// Track loading state
      useEffect(() => {
        // Scroll to the bottom of the page when the component mounts
        window.scrollTo(0, document.body.scrollHeight);
      }, [loading]); 


    const generateImage = async () => {
      setDummyData({
        prompt:promptText
      })

      setError(false)
      setLoading(true);
      setPromptText("") // Start loading
      try {
        
        const response = await axiosGenerateImage.post(
          '/',
          { 
            prompt: promptText ,
            // chat_id:'yAapotOMwl43XVu1pj-Jz'
            // model:3      
          }, // Ensure the response is handled as binary
        );
        console.log(response.data)
        if(response.data.chat_id){
          setRefreshChatList(!refreshChatList)
          navigate(`/u/c/${response.data.chat_id}`)
        }
 
        setChat((prevItems)=>[...prevItems,
          response.data
        ])
 
      } catch (error) {
        console.error('Error generating image:', error.response);
       
        setError(true);
        setErrorMessage(error?.response?.data?.message);
      } finally {
        setLoading(false);
        setPromptText("")
      }
    };

  return (
    <div className=' guest-content-container h-100 flex-grow-1  d-flex flex-column align-items-center justify-content-end'>

        <div className=' d-flex flex-column align-items-center justify-content-end mb-10 mt-3 w-100'>
          {
            chat.map((item,index)=>(<ChatContainer data={item}></ChatContainer>))
          }
          {
            loading&&
            <ChatContainer data={dummyData}></ChatContainer>
          }
          {
            error&&
            <div className='alert alert-danger w-100'>{errorMessage}</div>
          }
          
        </div>
        

        <PromptInPutContainer generateImage={generateImage} promptText={promptText} setPromptText={setPromptText} trackmodel={trackmodel} setTrackModel={setTrackModel} selectedAspectRatio={selectedAspectRatio} setSelectedAspectRatio={setSelectedAspectRatio}></PromptInPutContainer>
        {
          1&&
          <SuggestionPrompts></SuggestionPrompts>
        }
    </div>
  )
}
