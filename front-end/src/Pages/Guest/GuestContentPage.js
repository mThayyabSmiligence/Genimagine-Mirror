import React, { useContext, useEffect, useState } from 'react'
import PromptInPutContainer from '../../Components/CommonComponents/PromptInputContainer'
import "../../Css/GuestContentContainer.css"
import SuggestionPrompts from '../../Components/CommonComponents/SuggestionPrompts'
import ChatContainer from '../../Components/CommonComponents/ChatContainer'
import { axiosPrivate, useAxiosGenerateImage } from '../../API\'s/axios'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../Hooks/useAuth'
import AuthContext from '../../Context/AuthProvider'
import RefreshDataContext from '../../Context/RefreshDataProvider'

export default function GuestContentPage() {

    const {loggedIn} = useContext(AuthContext)

    const [trackmodel,setTrackModel] = useState(1)
    const [selectedAspectRatio, setSelectedAspectRatio] = useState(2);

    const navigate =useNavigate()
    const { refreshChatList,setRefreshChatList,refreshCreditBalance,setRefreshCreditBalance} = useContext(RefreshDataContext) 
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

    const aspectRatioList = [
      {
        id: 1,
        aspectRatio: "16:9",
        width: 80, 
        height: 45
      },
      // {
      //   id: 2,
      //   aspectRatio: "3:2"
      // },
      {
        id: 2,
        aspectRatio: "1:1",
        width: 50,
        height: 50
      },
      // {
      //   id: 4,
      //   aspectRatio: "4:5"
      // },
      {
        id: 3,
        aspectRatio: "9:16",
        width: 45,
        height: 80 
      },
    ]
// Track loading state
      useEffect(() => {
        // Scroll to the bottom of the page when the component mounts
        window.scrollTo(0, document.body.scrollHeight);
      }, [loading]); 


    const getAspectRatio=(id)=>{
      const aspectRatioObject = Object.values(aspectRatioList).find((values)=>values.id=id)
      return aspectRatioObject.aspectRatio;
    }
    
    const generateImage = async () => {
      setDummyData({
        prompt:promptText
      })

      setError(false)
      setLoading(true);
      // Start loading

  
      try {

          console.log("logged in ?" , loggedIn)
          let response;     


          if(loggedIn){
            response = await axiosPrivate.post(
              '/generate-image',
          { 
            prompt: promptText ,
            model:trackmodel,
            aspect_ratio:aspectRatioList[selectedAspectRatio-1].aspectRatio
          
          },
            )
          }
          else{
            response = await axiosGenerateImage.post(
              '/',
              { 
                prompt: promptText ,
                model:trackmodel,
                aspect_ratio:aspectRatioList[selectedAspectRatio-1].aspectRatio
              
              }, // Ensure the response is handled as binary
            );

          }
        
           
          
        console.log(response.data)
        if(response.data.credits){
          
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
          "prompt":promptText,
          image:response.data.image
        }
        ])

        setPromptText("") 

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
