  import React, { useContext, useEffect, useRef, useState } from 'react'

  import AuthContext from '../../Context/AuthProvider'
  import RefreshDataContext from '../../Context/RefreshDataProvider'
  import { axiosNoAUth, axiosPrivate, useAxiosGenerateImage } from '../../API\'s/axios'
  import { useParams } from 'react-router-dom'
  import axios from 'axios'
  import PromptInPutContainer from '../../Components/CommonComponents/PromptInputContainer'
  import SuggestionPrompts from '../../Components/CommonComponents/SuggestionPrompts'
  import ChatContainer from '../../Components/CommonComponents/ChatContainer'
  import { useInView } from 'react-intersection-observer'


  export default function ChatPage() {

      
      const [model,setModel]= useState(null)
      const [aspectRatio,setAspectRatio]= useState(null)
      const [quality, setQuality] = useState(null)
      const[style,setStyle] = useState(null)



      const [showOptionsId,setShowOptionsId] =useState(null)

      const [useContextPrompt, setUseContextPrompt] = useState(true);
      const [hasPreviousPrompts, setHasPreviousPrompts] = useState(false);


      const {chatId}= useParams()

      const [currentPage, setCurrentPage] = useState(1);
      const [hasMoreChats, setHasMoreChats] = useState(false);
      const { ref, inView } = useInView();
      
      
      const { refreshCreditBalance,setRefreshCreditBalance,setResortChatList,refreshImageSettings,refreshResizeHeightWidth,setRefreshResizeHeightWidth} = useContext(RefreshDataContext)
    

      const axiosGenerateImage=useAxiosGenerateImage()

      const [promptText,setPromptText]=useState("")
      const [chat,setChat]= useState([])
    
      const [loading, setLoading] = useState(false);
      const [dummyData,setDummyData]=useState(
        {
          generatedImage:null,
          prompt:"nothing just testing"
        }
      )

      const [error, setError] = useState(false); // Handle errors gracefully
      const [errorMessage, setErrorMessage] = useState(null); // Handle errors
      const [promptLength,setPromptLength] =useState(0)

    

    

      
      useEffect(()=>{
        if(localStorage.getItem("image_settings")){
          const imageSettings = JSON.parse(localStorage.getItem("image_settings"));
          setModel(imageSettings.model)
          setAspectRatio(imageSettings.aspectRatioid)
          setQuality(imageSettings.quality)
          setStyle(imageSettings.style)
          
        }
      },[refreshImageSettings])

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
        console.log(1)
          getChatData(1,true)
      },[chatId])

      useEffect(() => {
        if (inView && hasMoreChats) {
          console.log(2)
          getChatData(currentPage);
        }
      }, [inView]);

      useEffect(()=>{
        setTimeout(() => {
          setError(false)
        },5000)
      },[error])

      useEffect(()=>{
        setTimeout(()=>{
          setError(false)
          setErrorMessage(null)
        },[5000])
      },[error])


      const getChatData=async(pageNumber, reset=false)=>{
        let query = `?page=${pageNumber}`;
          try {
              console.log("checking chatid inside api ", chatId)
              const response = await axiosPrivate.get(`get-chat-data/${chatId}${query}`,
                {
                  withCredentials:true,
                }
              );
              // setChat(response.data.message)
              const ChatResponse = response.data;
              console.log("response",response)
              console.log("newchats",ChatResponse)
              if(response.status==200){
                console.log("retrives images")
                setChat((prevChats) => reset ? ChatResponse.data : [ ...ChatResponse.data,...prevChats]);
                setHasMoreChats(!!ChatResponse.pagination.nextPage);
                setCurrentPage(pageNumber + 1);

                const hasPrompt = ChatResponse.data?.some(item => item?.prompt && item?.prompt.trim() !== "");
                setHasPreviousPrompts(hasPrompt);

                // Set default to true if there’s a previous prompt
                if (hasPrompt) {
                  setUseContextPrompt(true);
                }
              }

          } catch (error) {
              console.error('Error fetching chat data:', error);
              setError(true);
              setErrorMessage('Failed to fetch chat data. Please try again later.')
          }
      }
      

      const generateImage = async () => {
          const prompt =promptText
          setPromptText(" ")
          setDummyData({
            prompt:prompt
          })
          
          setLoading(true);
          setPromptText("") // Start loading

          try {
            
            const response = await axiosPrivate.post(
              '/generate-image',
              { 
                    prompt: prompt ,
                    chat_id:chatId,
                    model:model,
                    aspect_ratio:aspectRatio,
                    quality:quality,
                    style:style,
                    use_context: useContextPrompt
              }
            ) 
            console.log(response.data)
    
            setChat((prevItems)=>[...prevItems,
              response.data
            ])
            if(response.data.credits_remaining||response.data.credits_remaining==0){
              localStorage.setItem("credit_balance", JSON.stringify(response.data.credits_remaining));
              setRefreshCreditBalance(!refreshCreditBalance)
            }
            setResortChatList(response.data.chat_id)
    
          } catch (error) { 
            console.error('Error generating image:', error);
            setError(true);
            setErrorMessage("Something went wrong with paid generation"||"Error generating image");
          } finally {
            setLoading(false);
          }
        };
        const handelDeleteFromState =  (id)=>{
          setChat(prevItems => {
          const updatedItems = prevItems.filter(item => item.image_id !== id);

          // Re-check if any prompts remain
          const hasPrompt = updatedItems.some(
            item => item?.prompt && item?.prompt.trim() !== ""
          );
          setHasPreviousPrompts(hasPrompt);

          // Optionally disable toggle when no prompts left
          if (!hasPrompt) {
            setUseContextPrompt(false);
          }

          return updatedItems;
        });
        }



        const resizedHeightWidth = async () => {
          try {
            const response = await axiosNoAUth.post('resize-aspect-ratio-shape');
            console.log("resized height and width", response.data);
        
            localStorage.setItem('resized_height_width', JSON.stringify(response.data.scaledShapes));
            

            setRefreshResizeHeightWidth(!refreshResizeHeightWidth)
          } catch (err) {
            console.error("Error resizing image:", err);
          }
        };
        
        useEffect(() => {
          const Resized_Height_Width = localStorage.getItem('resized_height_width');
          
          if (Resized_Height_Width) {
            try {
              const Height_Width = JSON.parse(Resized_Height_Width);
        
              if (!Resized_Height_Width.height || !Resized_Height_Width.width || !Resized_Height_Width.aspectRatio ) {
                resizedHeightWidth();
              } else {
                console.log("Valid image settings found:", Height_Width);
              }
            } catch (err) {
              console.error("Invalid JSON in image_settings:", err);
              resizedHeightWidth(); 
            }
          } else {
            resizedHeightWidth(); 
          }
        }, []);
          
        

    return (
      <div className=' guest-content-container h-100 flex-grow-1  d-flex flex-column align-items-center justify-content-end'>
      
              <div className='chat-list-container d-flex flex-column align-items-center justify-content-end pb-80px mt-3 w-100'>
              <div ref={ref} style={{ height: "10px", width: "10px", background: "transparent" }}></div>
                {
                  chat.map((item,index)=>(<ChatContainer key={index} data={item} handelDeleteFromState={handelDeleteFromState} chatId={chatId} resizedHeightWidth={resizedHeightWidth}></ChatContainer>))
                }
                {
                  loading&&
                  <ChatContainer data={dummyData} showOptionsId={showOptionsId} setShowOptionsId={setShowOptionsId} ></ChatContainer>
                }
                {
              error&&
              <div className='alert alert-danger w-100 mt-4'>{errorMessage}</div>
            }
              </div>
      
      
              <PromptInPutContainer generateImage={generateImage} promptText={promptText} setPromptText={setPromptText} loading={loading} promptLength={promptLength} setPromptLength={setPromptLength} useContextPrompt={useContextPrompt} setUseContextPrompt={setUseContextPrompt} hasPreviousPrompts={hasPreviousPrompts}></PromptInPutContainer>
              {
                1&&
                <SuggestionPrompts></SuggestionPrompts>
              }
          </div>
    )
  }
