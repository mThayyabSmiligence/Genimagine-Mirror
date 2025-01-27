import React, { useEffect, useState } from 'react'
import PromptInPutContainer from '../../Components/CommonComponents/PromptInputContainer'
import "../../Css/GuestContentContainer.css"
import axios from 'axios'
import SuggestionPrompts from '../../Components/CommonComponents/SuggestionPrompts'
import ChatContainer from '../../Components/CommonComponents/ChatContainer'

export default function GuestContentPage() {


    const [chatList,setChatList]= useState([])
    const [promptText,setPromptText]=useState("")
    const [chat,setChat]= useState([
      {
        generatedImage:null,
        prompt:"testing prompt"
      }
      ,{
        generatedImage:null,
        prompt:"testing prompt"
      },
      {
        generatedImage:null,
        prompt:"testing prompt"
      }
    ])
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null); // Handle errors gracefully
    const [loading, setLoading] = useState(true);
    const [dummyData,setDummyData]=useState(
      {
        generatedImage:null,
        prompt:"nothing just testing"
      }
    )
// Track loading state
  

      const boxStyle = {
        width: '200px',
        height: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #ccc',
        borderRadius: '10px',
        position: 'relative',
        backgroundColor: '#f9f9f9',
      };
    
      const spinnerStyle = {
        width: '40px',
        height: '40px',
        border: '4px solid #ccc',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      };

    
      useEffect(() => {
        // Scroll to the bottom of the page when the component mounts
        window.scrollTo(0, document.body.scrollHeight);
      }, []); 

    const generateImage = async () => {
      setDummyData({
        prompt:promptText
      })
      setLoading(true); // Start loading
      try {
        
        const response = await axios.post(
          'http://localhost:3001/api/v1/generate-image',
          { prompt: promptText },
          { responseType: 'arraybuffer' } // Ensure the response is handled as binary
        );
  
        // Convert binary data to a base64-encoded string
        const base64Image = `data:image/png;base64,${btoa(
          new Uint8Array(response.data)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        )}`;
  
        setImage(base64Image);
        setPromptText("")
        setChat((prevItems)=>[...prevItems,
          {
            prompt:promptText,
            image:base64Image,
          }
        ])
 
      } catch (error) {
        console.error('Error generating image:', error);
        setError('Failed to generate image. Please try again later.');
      } finally {
        setLoading(false);
        setPromptText(promptText)
      }
    };

  return (
    <div className=' guest-content-container h-100 flex-grow-1  d-flex flex-column align-items-center justify-content-end'>

        <div className=' d-flex flex-column align-items-center justify-content-end mb-5 mt-3 w-100'>
          {
            chat.map((item,index)=>(<ChatContainer data={item}></ChatContainer>))
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
