import React, { useEffect, useState } from 'react'
import PromptInPutContainer from '../../Components/CommonComponents/PromptInputContainer'
import "../../Css/GuestContentContainer.css"
import axios from 'axios'
import SuggestionPrompts from '../../Components/CommonComponents/SuggestionPrompts'
import ChatContainer from '../../Components/CommonComponents/ChatContainer'

export default function GuestContentPage() {


    // const [chatList,setChatList]= useState([])
    const [promptText,setPromptText]=useState("")
    const [chat,setChat]= useState([
      {
        image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAEAAElEQVR4nMz955MkTZrgh7kMHal1ZmnV1fLtfrWY2ZndWXG3tzju0UgAxg+E8R+jEQbaAWY0AjicwC13xI58devuEl06tQ4t3Z0fsqu7+hUzs3sAj27W1ZEeHi4iPDJ/j/DH4bNnXzLGIYAAgkUSAkAgALz8/DoJAL6d+XtOLTLFGxlX/n/z3Ou0yIdwcT18VfpqG+Ib/3/HoYAAiss+XB5fGefrXvz+oX1vggAKIQC8rOQ7B/Nm7UJc7Ri4HCEUQoiX+S/LCQEABIxxzjkXHCEkOOOMMSHiKHZmNufMcz0IAUtilvA0TQUARMJUkmRZprIkyzJCCBFKCBaCpwmL4xgSkiYJYIJzBiAEgElU0gxdkiVJliilQgCIEUYoTRlLue+Hs8ks8kNKkZHLYAzTOAEChnE0Hc/suRUFPqUYQVGp1z...",
        prompt:"lion"
      }
    ])
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null); // Handle errors gracefully
    const [loading, setLoading] = useState(false);
    const [dummyData,setDummyData]=useState(
      {
        generatedImage:null,
        prompt:"nothing just testing"
      }
    )
// Track loading state
  

      

    
      useEffect(() => {
        // Scroll to the bottom of the page when the component mounts
        window.scrollTo(0, document.body.scrollHeight);
      }, [loading]); 

    const generateImage = async () => {
      setDummyData({
        prompt:promptText
      })
      
      setLoading(true);
      setPromptText("") // Start loading
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
        console.log(error)
        console.log(image)
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
