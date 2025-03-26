  import React, { useContext, useEffect, useRef, useState } from 'react'

  import AuthContext from '../../Context/AuthProvider'
  import RefreshDataContext from '../../Context/RefreshDataProvider'
  import { axiosPrivate, useAxiosGenerateImage } from '../../API\'s/axios'
  import { useParams } from 'react-router-dom'
  import axios from 'axios'
  import PromptInPutContainer from '../../Components/CommonComponents/PromptInputContainer'
  import SuggestionPrompts from '../../Components/CommonComponents/SuggestionPrompts'
  import ChatContainer from '../../Components/CommonComponents/ChatContainer'
  import { useInView } from 'react-intersection-observer'


  export default function ChatPage() {

      
      const [model,setModel]= useState(null)
      const [aspectRatio,setAspectRatio]= useState(null)
      const[style,setStyle] = useState(null)



      const [showOptionsId,setShowOptionsId] =useState(null)


      const {chatId}= useParams()

      const [currentPage, setCurrentPage] = useState(1);
      const [hasMoreChats, setHasMoreChats] = useState(false);
      const { ref, inView } = useInView();
      
      
      const { refreshCreditBalance,setRefreshCreditBalance,setResortChatList,refreshImageSettings} = useContext(RefreshDataContext)
    

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
          setAspectRatio(imageSettings.aspectRatio)
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
                setChat((prevChats) => reset ? ChatResponse.message : [ ...ChatResponse.message,...prevChats]);
                setHasMoreChats(!!ChatResponse.pagination.nextPage);
                setCurrentPage(pageNumber + 1);
              }

          } catch (error) {
              console.error('Error fetching chat data:', error);
              setError('Failed to fetch chat data. Please try again later.');
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
                    aspect_ratio:aspectRatio.aspectRatio,
                    style:style  
              }
            ) 
            console.log(response.data)
    
            setChat((prevItems)=>[...prevItems,
              response.data
            ])
            if(response.data.credits||response.data.credits==0){
              localStorage.setItem("credit_balance", JSON.stringify(response.data.credits));
              setRefreshCreditBalance(!refreshCreditBalance)
            }
            setResortChatList(response.data.chat_id)
    
          } catch (error) { 
            console.error('Error generating image:', error);
            setError(true);
            setErrorMessage(error?.response?.data?.message);
          } finally {
            setLoading(false);
          }
        };
        const handelDeleteFromState =  (id)=>{
          setChat(prevItems => prevItems.filter((item) => item.image_id!== id));
        }
    return (
      <div className=' guest-content-container h-100 flex-grow-1  d-flex flex-column align-items-center justify-content-end'>
      
              <div className='chat-list-container d-flex flex-column align-items-center justify-content-end pb-80px mt-3 w-100'>
              <div ref={ref} style={{ height: "10px", width: "10px", background: "transparent" }}></div>
                {
                  chat.map((item,index)=>(<ChatContainer key={index} data={item} handelDeleteFromState={handelDeleteFromState} chatId={chatId}></ChatContainer>))
                }
                {
                  loading&&
                  <ChatContainer data={dummyData} showOptionsId={showOptionsId} setShowOptionsId={setShowOptionsId} ></ChatContainer>
                }
                {
              error&&
              <div className='alert alert-danger w-100'>{errorMessage}</div>
            }
              </div>
      
      
              <PromptInPutContainer generateImage={generateImage} promptText={promptText} setPromptText={setPromptText} loading={loading} promptLength={promptLength} setPromptLength={setPromptLength}></PromptInPutContainer>
              {
                1&&
                <SuggestionPrompts></SuggestionPrompts>
              }
          </div>
    )
  }
