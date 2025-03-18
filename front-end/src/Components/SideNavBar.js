import React, {  use, useContext, useEffect, useRef, useState } from 'react'
import logo from "../images/genimagin_logo.png"
import { Link, useLocation } from 'react-router-dom'
import "../Css/SideNavBar.css"
import useAuth from '../Hooks/useAuth'
import { axiosPrivate } from '../API\'s/axios'
import AuthContext from '../Context/AuthProvider'
import RefreshDataContext from '../Context/RefreshDataProvider'
import DropdownContext from '../Context/DropdownProvider'
import ChatOptionDropDown from './CommonComponents/ChatOptionDropDown'
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DeletePopUp from './CommonComponents/DeletePopUp'

export default function SideNavBar({showNavBar,setShowNavBar,width}){

    const [showNavBar2,setShowNavBar2]=useState(true)
    const [chatList,setChatList]=useState([]);
    const location=useLocation()

    const path = location.pathname;
    const currentChatId= path.split('/')[3]

    const [showOptions, setShowOptions] =useState(false)
    const optionsRef = useRef(null);  

    const [chatButtonTracking, setChatButtonTracking] = useState(null);

    const { refreshChatList,setRefreshChatList,resortChatList,setResortChatList} = useContext(RefreshDataContext)
    const {loggedIn} =useContext(AuthContext)

   
    const [editingChatId, setEditingChatId] = useState(null);
    const [newChatName, setNewChatName] = useState("");
    const [currentChatName, setCurrentChatName] = useState("");

    const [showDeletePopUp, setShowDeletePopUp]=useState(false);
    const[deleteChatId,setDeleteChatId] = useState(null);

    const focusRef = useRef(null);

    const truncateString=(str)=> {
        return str.length > 20 ? str.substring(0, 17) + "..." : str;
    }

    useEffect(()=>{
        if(showNavBar){
            setTimeout(() => {
                setShowNavBar2(showNavBar)
            }, 300);
        }else{
            setShowNavBar2(showNavBar)
        }
    },[showNavBar])

    useEffect(()=>{
        if(loggedIn){
            getChatList()
        }
    },[loggedIn,refreshChatList])

    useEffect(() => {                                                      
        const handleClickOutside = (e) => {
          if (optionsRef.current && !optionsRef.current.contains(e.target)) {
            setShowOptions(false);
            console.log(1)
          }
        };
    
        if (showOptions) {
          document.addEventListener("mousedown", handleClickOutside);
        } else {
          document.removeEventListener("mousedown", handleClickOutside);
        }
    
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [showOptions]);

      useEffect(()=>{
        moveToFirst(resortChatList)
      },[resortChatList])

      useEffect(() => {
        setTimeout(() => {
        if (editingChatId) {
            console.log("focus")
          focusRef.current.focus();
        }}, 200);
      },[editingChatId])

    //   useEffect(() => {
    //     renameChatList();
    //   },[])
    
      const moveToFirst = (chat_id) => {
        setChatList((prevItems) => {
          if (prevItems.length==0) return prevItems; // No change if invalid index

          const index = prevItems.findIndex(item => item.chat_id==chat_id);
        //   if (index === -1) return prevItems;   
    
          const updatedItems = [...prevItems]; // Create a copy of the array
          const [movedItem] = updatedItems.splice(index, 1); // Remove item at index
          updatedItems.unshift(movedItem); // Add item to the first index
    
          return updatedItems;
        });
      };
   

    const getChatList = async ()=>{
        try{
            const response=await axiosPrivate.get("/get-chats-list")
            console.log(response.data)
            setChatList(response.data.data)
        }catch(err){
            console.error("error getting chat list",err)
        }
    }

    const [height, setHeight] = useState(window.innerHeight);
          
        useEffect(() => {
          const handleResize = () => {
            setHeight(window.innerHeight);
          };
              
          window.addEventListener('resize', handleResize);
              
          return () => {
            window.removeEventListener('resize', handleResize);
          };
    }, []);

    const renameChatList = async () => {
        try {// Prevent empty names
            console.log(newChatName,currentChatName)
            console.log(1)
            if (newChatName.trim()=="") return;
            console.log(2)
            if(currentChatName == newChatName) return; 
            console.log(3)
            const response = await axiosPrivate.post("/edit-chat-name", {
                chatId: editingChatId,
                chatName: newChatName,
            });
            console.log(response)
            if (response.status === 200) {
                setChatList(prevChats => 
                    prevChats.map(chat => 
                        chat.chat_id === editingChatId? { ...chat, chat_name: newChatName } : chat
                    )
                );
            }

            
        } catch (error) {
            console.error("Error renaming chat", error);
        } finally {
            console.log("Renaming chat");
            setEditingChatId(null);
            setCurrentChatName(null);
            setNewChatName(null);

        }
    };

    const callRenameChatList = (chat_id,chat_name) => {
        console.log("called rename list")
        setEditingChatId(chat_id);
        setCurrentChatName(chat_name);
        setNewChatName(chat_name);
        setShowOptions(false);
    };
    
    const  handelDeleteChat=async()=>{
        try{
            const response=await axiosPrivate.delete(`/delete-chat/${deleteChatId}`);
            console.log(response)
            if (response.status === 200) {
                setChatList(prevChats => prevChats.filter(chat => chat.chat_id!== deleteChatId));
                setShowDeletePopUp(false)
            }
        }catch(e){
            console.error("Error deleting chat", e);
        }
    }
    
  return (
    <nav className={`side-nav ${showNavBar2?'active':'in-active'} Nav d-flex flex-column`}  style={{ height:`${height}px` }}>
    

        <div className='nav-logo-section'>
       
                <Link to={'/'}>
                 <img src={logo} className="big-logo" alt='Genimagine logo'/>
                </Link>
        
        </div>
        <div className='side-nav-options-container d-flex flex-column justify-content-between y-scrollable-container'>
            <div className='side-nav-middle-section p-relative h-auto ' style={{ height:`${height-150}px`} }>

                <div className='sub-mid-section '>
                    <Link to={"/explore" } className='link' >
                        <div className=' nav-list-item'>
                            <ExploreOutlinedIcon/>
                            <div to={"/image-generation" } className='link nav-options'>Explore</div>
                        </div>
                    </Link>
                    <Link to={"/image-generation" } className='link' >
                        <div className=' nav-list-item'>
                            <AddCircleOutlineOutlinedIcon/>
                            <div to={"/image-generation" } className='link nav-options'>New Chat</div>
                        </div>
                    </Link>

                </div>
                <div className=' sub-mid-section '>
                    { loggedIn&&                    
                        <div className='accordion w-100'>
                            <div className='accordion-item'>
                                <h2 className="accordion-header">
                                    <button className="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                    <ChatOutlinedIcon/>Chats
                                    </button>
                                </h2>
                                <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                                    <div className="accordion-collapse d-flex flex-column align-items-center">
                                        {
                                            Object.entries(chatList).map(([key,value],index)=>(                         
                                                <div className={`d-flex align-items-center nav-list-item my-1 ${value.chat_id==currentChatId&&"active"} ${index==chatButtonTracking&&"selected"}`}>
                                                    {value.chat_id==editingChatId ?
                                                    <input  
                                                        ref={focusRef}  
                                                        value={newChatName} 
                                                        onChange={(e) => setNewChatName(e.target.value)} 
                                                        onBlur={()=>renameChatList()}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                              e.preventDefault(); // Prevent new line
                                                              renameChatList()  // Call your submit function
                                                            }
                                                        }}
                                                    />
                                                :
                                                    <>
                                                    <Link title={value.chat_name} to={`/u/c/${value.chat_id}`} className={`link flex-1 w-80 of-h p-1`} key={index} >{truncateString(value.chat_name?value.chat_name:value.chat_id)}</Link>
                                    
                                                        <button ref={optionsRef} onClick={() => {
                                                            
                                                            setShowOptions(!showOptions)
                                                            setChatButtonTracking(index);
                                                            console.log(2)
                                                            
                                                        }} className='button p-0del more-options d-flex justify-content-center align-items-center p-0'><span class="material-symbols-outlined">more_vert</span></button>
                                                        { showOptions && (index==chatButtonTracking) &&  
                                                        <div ref={optionsRef}  className='nav-list-item-dropdown' >
                                                            <ChatOptionDropDown 
                                                                handleRename={
                                                                    () => callRenameChatList(value.chat_id,value.chat_name)
                                                                    } 
                                                                handleDelete={
                                                                    ()=>{
                                                                        setDeleteChatId(value.chat_id);
                                                                        setShowDeletePopUp(true)
                                                                    }
                                                                } />
                                                        </div>
                                                        }
                                                    </>
                                                    }
                                                </div>
                                                                                 
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
            {loggedIn&&
                <div className='side-nav-bottom-items d-flex flex-column align-items-center ' style={{ height:"85px" }}>
                    <div className='side-nav-bottom-item d-flex justify-content-between align-items-center '>
                        <div className='d-flex '>
                            <ChildCareOutlinedIcon/>
                            <label htmlFor=' kids-mode-switch'>Kid's Mode</label>
                        </div>
                            <label className='switch kids-mode-switch'>
                                <input type="checkbox"></input>
                                <span className='slider round'></span>
                            </label>
                    </div>
                    <div className='side-nav-bottom-item d-flex justify-content-start align-items-center ' >

                        <button className='d-flex justify-content-center align-items-center border-0 p-0  bg-light'>
                                <SettingsOutlinedIcon/>
                                <>Settings</>
                        </button>
                    </div>
                </div>
            }
        </div>
        {
        
        <button className={ `side-nav-close-button  ${showNavBar?'active':'in-active'} `} onClick={()=>setShowNavBar(false)}> <ArrowCircleLeftOutlinedIcon/></button>}

        {
            showDeletePopUp &&
            <DeletePopUp handelDelete={handelDeleteChat} showDeletePopUp={showDeletePopUp} onHide={()=>setShowDeletePopUp(false)} message={"are you sure you want deleted this chat?"}/>  // This is where you call your delete function and pass the chatId to it.
        }
    </nav>
  )
}
