import React, { useContext, useEffect, useState } from 'react'
import PromptInPutContainer from '../../Components/CommonComponents/PromptInputContainer'
import "../../Css/GuestContentContainer.css"
import SuggestionPrompts from '../../Components/CommonComponents/SuggestionPrompts'
import ChatContainer from '../../Components/CommonComponents/ChatContainer'
import { axiosPrivate, useAxiosGenerateImage } from '../../API\'s/axios'
import axios from "axios"
import { useNavigate } from 'react-router-dom'
import useAuth from '../../Hooks/useAuth'
import AuthContext from '../../Context/AuthProvider'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import { useSearchParams } from "react-router-dom";

export default function GuestContentPage() {

    const {loggedIn} = useContext(AuthContext)
    const {refreshImageSettings} = useContext(RefreshDataContext)

    const [model,setModel]= useState(null)
    const [aspectRatio,setAspectRatio]= useState(null)
    const[style,setStyle] = useState(null)

    const navigate =useNavigate()
    const { refreshChatList,setRefreshChatList,refreshCreditBalance,setRefreshCreditBalance} = useContext(RefreshDataContext) 
    // const [chatList,setChatList]= useState([])
    const [promptText,setPromptText]=useState("")
    const [chat,setChat]= useState([])

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

    const [searchParams] = useSearchParams();
    const [promptLength,setPromptLength] =useState(0)
    const prompt = searchParams.get("prompt");

    useEffect(()=>{
      if(prompt){
        setPromptText(prompt)
      }
    },[prompt])

    const axiosGenerateImage=useAxiosGenerateImage()


    useEffect(()=>{
      if(localStorage.getItem("image_settings")){
        const imageSettings = JSON.parse(localStorage.getItem("image_settings"));
        setModel(imageSettings.model)
        setAspectRatio(imageSettings.aspectRatio)
        setStyle(imageSettings.style)
      }
    },[refreshImageSettings])
   
// Track loading state
      useEffect(() => {
        // Scroll to the bottom of the page when the component mounts
        window.scrollTo(0, document.body.scrollHeight);
      }, [loading]); 




    const fetchClientIp=async()=>{
      try {
        const response = await axios.get("https://api64.ipify.org?format=json");
        return response.data.ip; // Returns the client's real public IP
      } catch (error) {
        console.error("Error fetching IP:", error);
        return null;
      };
          
    }

    useEffect(()=>{
      setTimeout(()=>{
        setError(false)
        setErrorMessage(null)
      },[5000])
    },[error])
    const generateImage = async () => {
      const prompt = promptText
      setPromptText("")
      setDummyData({
        prompt:prompt
      })

      setError(false)
      setLoading(true);


      // Start loading

      const ipAddress= await fetchClientIp()
      try {

          console.log("logged in ?" , loggedIn)
          let response;     


          if(loggedIn){
            response = await axiosPrivate.post(
              '/generate-image',
          { 
            prompt: prompt ,
            model:model,
            aspect_ratio:aspectRatio.aspectRatio,
            style: isNaN(style)?0: style,
          
          },
            )
          }
          else{
            response = await axiosGenerateImage.post(
              '/',
              { 
                prompt: prompt ,
                model:model,
                aspect_ratio:aspectRatio.aspectRatio,
                style: isNaN(style)?0: style,
                client_ip:ipAddress
              
              }, // Ensure the response is handled as binary
            );

          }
        
        console.log(response.data)
        if(response.data.credits||response.data.credits==0){
          localStorage.setItem("credit_balance", JSON.stringify(response.data.credits));
          setRefreshCreditBalance(!refreshCreditBalance)
        }

        

        if(response.data.chat_id){
          setRefreshChatList(!refreshChatList)
          
          navigate(`/u/c/${response.data.chat_id}`)
          setChat((prevItems)=>[...prevItems,
            response.data
          ])
          return
        }

        
 
        setChat((prevItems)=>[...prevItems,{
          "prompt":prompt,
          image:response.data.image
        }
        ])

         

      } catch (error) {
        console.error('Error generating image:', error);
       
        setError(true);
        setErrorMessage(error?.response?.data?.message||error.message||"Error generating image");
      } finally {
        setLoading(false);
      }
    };

    const handleGuestImageDelete = async(index) => {
      setChat((prevChat)=>prevChat.filter((_, i) => i !== index));
    }


    

  return (
    <div className=' guest-content-container h-100 flex-grow-1  d-flex flex-column align-items-center justify-content-end'>

        <div className=' d-flex flex-column align-items-center justify-content-end mb-5 pb-5 mt-3 w-100'>
          {
            chat.map((item,index)=>(<ChatContainer data={item} index={index} handleGuestImageDelete = {handleGuestImageDelete}></ChatContainer>))
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
        

        <PromptInPutContainer generateImage={generateImage} promptText={promptText} setPromptText={setPromptText}  loading={loading} promptLength={promptLength} setPromptLength={setPromptLength}></PromptInPutContainer>
        {
          1&&
          <SuggestionPrompts></SuggestionPrompts>
        }
    </div>
  )
}
