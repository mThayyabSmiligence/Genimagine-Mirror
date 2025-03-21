import React, {  use, useContext, useEffect, useRef, useState } from 'react'
import logo from "../images/genimagin_logo.png"
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
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
import ChatList from './CommonComponents/ChatList'

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

const truncateString=(str)=> {
    return str.length > 20 ? str.substring(0, 17) + "..." : str;
}

export default function SideNavBar({showNavBar,setShowNavBar,width}){




    const navigate = useNavigate()

    const [showNavBar2,setShowNavBar2]=useState(true)
    const [chatList,setChatList]=useState([]);
    const location=useLocation()
    const [groupedChat,setGroupedChat]=useState(groupChatsByDate(chatList))
        
        

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

    useEffect(()=>{
        setGroupedChat(groupChatsByDate(chatList));
    },[chatList])

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
                navigate('/image-generation',{replace:true})
            }
        }catch(e){
            console.error("Error deleting chat", e);
        }
    }
    
  return (
    <>
        <nav className={`side-nav ${showNavBar2?'active':'in-active'} Nav d-flex flex-column`}  style={{ height:`${height}px` }}>
        

            <div className='nav-logo-section'>
        
                    <Link to={'/'}>
                    <img src={logo} className="big-logo" alt='Genimagine logo'/>
                    </Link>
            
            </div>
            <div className='side-nav-options-container d-flex flex-column justify-content-between y-scrollable-container'>
                <div className='side-nav-middle-section p-relative h-auto ' style={{ height:`${height-150}px`} }>

                    <div className='sub-mid-section '>
                        <Link to={"/explore" } className='link mb-2' >
                            <div className={` nav-list-item ${path=="/explore"&&'active'}`}>
                                <ExploreOutlinedIcon/>
                                <div to={"/explore" } className='link nav-options'>Explore</div>
                            </div>
                        </Link>
                        <Link to={"/image-generation" } className='link' >
                            <div className={` nav-list-item ${path=="/image-generation"&&'active'}`}>
                                <AddCircleOutlineOutlinedIcon/>
                                <div to={"/image-generation" } className='link nav-options'>{loggedIn?'New Chat':'Generate'}</div>
                            </div>
                        </Link>

                    </div>
                    <div className=' sub-mid-section '>
                        { loggedIn&&                    
                            <div className='w-80 mt-2'>

                                    <h4 className='h-4 w-100 text-start'>Chat History</h4>

                                    {  chatList.length>0? 
                                        Object.entries(groupedChat).map(([group,chats])=>(
                                            <div key={group} className='d-flex flex-column align-items-center mb-3'>
                                                <h6 className='chat-group-heading p-secondary w-100 text-start'>{group}</h6>
                                                {
                                                    Array.isArray(chats)?(
                                                        chats.length>0?(
                                                            chats.map((chat,index)=>(
                                                                    <div className={`d-flex align-items-center nav-list-item my-1 ${chat.chat_id==currentChatId&&"active"} ${chat.chat_id==chatButtonTracking&&"selected"}`}>
                                                                        {chat.chat_id==editingChatId ?
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
                                                                        <Link title={chat.chat_name} to={`/u/c/${chat.chat_id}`} className={`link flex-1 w-80 of-h p-1`} key={index} >{truncateString(chat.chat_name?chat.chat_name:chat.chat_id)}</Link>

                                                                            <button ref={optionsRef} onClick={() => {
                                                                                
                                                                                setShowOptions(!showOptions)
                                                                                setChatButtonTracking(chat.chat_id);
                                                                                console.log(2)
                                                                                
                                                                            }} className='button p-0del more-options d-flex justify-content-center align-items-center p-0'><span class="material-symbols-outlined">more_vert</span></button>
                                                                            { showOptions && (chat.chat_id==chatButtonTracking) &&  
                                                                            <div ref={optionsRef}  className='nav-list-item-dropdown' >
                                                                                <ChatOptionDropDown 
                                                                                    handleRename={
                                                                                        () => callRenameChatList(chat.chat_id,chat.chat_name)
                                                                                        } 
                                                                                    handleDelete={
                                                                                        ()=>{
                                                                                            setDeleteChatId(chat.chat_id);
                                                                                            setShowDeletePopUp(true)
                                                                                        }
                                                                                    } />
                                                                            </div>
                                                                            }
                                                                        </>
                                                                        }
                                                                    </div>

                                                            ))
                                                        ):(
                                                            <p className='w-100  text-start p-primary no-data'>No Data</p>
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
                                                                      monthChats.map((chat,index)=>(
                                                                            <div className={`d-flex align-items-center nav-list-item my-1 ${chat.chat_id==currentChatId&&"active"} ${chat.chat_id==chatButtonTracking&&"selected"}`}>
                                                                                {chat.chat_id==editingChatId ?
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
                                                                                <Link title={chat.chat_name} to={`/u/c/${chat.chat_id}`} className={`link flex-1 w-80 of-h p-1`} key={index} >{truncateString(chat.chat_name?chat.chat_name:chat.chat_id)}</Link>

                                                                                    <button ref={optionsRef} onClick={() => {
                                                                                        
                                                                                        setShowOptions(!showOptions)
                                                                                        setChatButtonTracking(chat.chat_id);
                                                                                        console.log(2)
                                                                                        
                                                                                    }} className='button p-0del more-options d-flex justify-content-center align-items-center p-0'><span class="material-symbols-outlined">more_vert</span></button>
                                                                                    { showOptions && (chat.chat_id==chatButtonTracking) &&  
                                                                                    <div ref={optionsRef}  className='nav-list-item-dropdown' >
                                                                                        <ChatOptionDropDown 
                                                                                            handleRename={
                                                                                                () => callRenameChatList(chat.chat_id,chat.chat_name)
                                                                                                } 
                                                                                            handleDelete={
                                                                                                ()=>{
                                                                                                    setDeleteChatId(chat.chat_id);
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
                                                                ))
                                                              }
                                                            </div>
                                                          ))
                                                    )
                                                }
                                            </div>
                                        )):(
                                            <h6 className='p-primary'>No Data</h6>
                                        )
                                    }

                                       {/* <ChatList chats={chatList}/> */}
                                    
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
        <div className={`sidenav-blur-bg ${showNavBar2?'active':'in-active'} ` }  onClick={()=>setShowNavBar(false)}></div>
    </>
  )
}
// Object.entries(chatList).map(([key,value],index)=>(                         
//     <div className={`d-flex align-items-center nav-list-item my-1 ${value.chat_id==currentChatId&&"active"} ${index==chatButtonTracking&&"selected"}`}>
//         {value.chat_id==editingChatId ?
//         <input  
//             ref={focusRef}  
//             value={newChatName} 
//             onChange={(e) => setNewChatName(e.target.value)} 
//             onBlur={()=>renameChatList()}
//             onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                 e.preventDefault(); // Prevent new line
//                 renameChatList()  // Call your submit function
//                 }
//             }}
//         />
//     :
//         <>
//         <Link title={value.chat_name} to={`/u/c/${value.chat_id}`} className={`link flex-1 w-80 of-h p-1`} key={index} >{truncateString(value.chat_name?value.chat_name:value.chat_id)}</Link>

//             <button ref={optionsRef} onClick={() => {
                
//                 setShowOptions(!showOptions)
//                 setChatButtonTracking(index);
//                 console.log(2)
                
//             }} className='button p-0del more-options d-flex justify-content-center align-items-center p-0'><span class="material-symbols-outlined">more_vert</span></button>
//             { showOptions && (index==chatButtonTracking) &&  
//             <div ref={optionsRef}  className='nav-list-item-dropdown' >
//                 <ChatOptionDropDown 
//                     handleRename={
//                         () => callRenameChatList(value.chat_id,value.chat_name)
//                         } 
//                     handleDelete={
//                         ()=>{
//                             setDeleteChatId(value.chat_id);
//                             setShowDeletePopUp(true)
//                         }
//                     } />
//             </div>
//             }
//         </>
//         }
//     </div>
                                    
// ))