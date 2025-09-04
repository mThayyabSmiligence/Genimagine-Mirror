import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from "../../images/genimagin_logo.png"
import AuthContext from '../../Context/AuthProvider';
import RefreshDataContext from '../../Context/RefreshDataProvider';
import { axiosPrivate } from '../../API\'s/axios';
import DeletePopUp from '../CommonComponents/DeletePopUp';
import ChatOptionDropDown from '../CommonComponents/ChatOptionDropDown';

// icons from material-UI
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import socket from '../../utils/socket'


const groupChatsByDate=(chats)=> {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    // const day = today.getDay() || 7; // treat Sunday as 7
    // startOfWeek.setDate(today.getDate() - day + 1); // go to Monday

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
export default function UserNavbar() {
    const navigate = useNavigate()
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

    const [height, setHeight] = useState(window.innerHeight);


      useEffect(() => {
        socket.on("scheduledUpdate", (data) => {
            if (data?.newChat) {
            setChatList((prev) => [data.newChat, ...prev]); // Prepend new chat
            }
        });

        return () => socket.off("scheduledUpdate");
        }, []);



    useEffect(()=>{
        setGroupedChat(groupChatsByDate(chatList));
    },[chatList])

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

    const renameChatList = async () => {
        try {// Prevent empty names
            if (newChatName.trim()=="") return;
            if(currentChatName == newChatName) return; 
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
            <div className='nav-logo-section'>                   
                <Link to={'/'}>
                    <img src={logo} className="big-logo" alt='Genimagine logo'/>
                </Link>                        
            </div>
            
            <div className='side-nav-options-container d-flex flex-column justify-content-between y-scrollable-container'>

                <div className='side-nav-middle-section p-relative h-auto ' style={{ height:`${height-150}px`} }>

                    <div className='sub-mid-section '>

                        <Link to={"/explore" } className='link mb-1'  id='explore-link'>
                            <div className={`nav-list-item d-flex align-items-center ${path=="/explore"&&'active'}`}>

                                <ExploreOutlinedIcon/>
                                <div to={"/explore" } className='link nav-options ms-1'>Explore</div>
                            </div>
                        </Link>
                        <Link to={"/credit-purchase" } className='link mb-1' >
                            <div className={`nav-list-item d-flex align-items-center ${path=="/credit-purchase"&&'active'}`}>
                                <ShoppingCartOutlinedIcon/>
                                <div to={"/credit-purchase" } className='link nav-options ms-1'>Buy Credits</div>
                            </div>
                        </Link>
                        <Link to={"/image-to-prompt" } className='link mb-1' >
                            <div className={`nav-list-item d-flex align-items-center ${path=="/image-to-prompt"&&'active'}`}>
                                <ImageOutlinedIcon/>
                                <div to={"/credit-purchase" } className='link nav-options ms-1'>Image to Prompt</div>
                            </div>
                        </Link>

                        <Link to={"/image-generation" } className='link mb-1'  id='new-chat-link'>
                            <div className={`nav-list-item  d-flex align-items-center ${path=="/image-generation"&&'active'}`}>

                                <AddCircleOutlineOutlinedIcon/>
                                <div to={"/image-generation" } className='link nav-options ms-1'>{loggedIn?'New Chat':'Generate'}</div>
                            </div>
                        </Link>

                        {
                        loggedIn&&
                        <Link to={"/u/scheduled" } className='link'  id='scheduled-link'>
                            <div className={`nav-list-item  d-flex align-items-center ${path=="/u/scheduled"&&'active'}`}>

                                <AccessTimeRoundedIcon/>
                                <div to={"/u/scheduled" } className='link nav-options ms-1'>Scheduled</div>
                            </div>
                        </Link>
                        }

                    </div>
                    <div className=' sub-mid-section '>
                        { loggedIn&&                    
                            <div className='w-80 mt-2'>

                                    <h4 className='h-4 w-100 text-start mb-3'>Chat History</h4>

                                   {chatList.length > 0 ? (
                                        Object.entries(groupedChat).map(([group, chats], index) => {
                                            if (Array.isArray(chats)) {
                                            if (chats.length === 0) return null;

                                            return (
                                                <div key={index} className='d-flex flex-column align-items-center mb-3'>
                                                <h6 className='chat-group-heading p-secondary w-100 text-start'>{group}</h6>
                                                {chats.map((chat, index) => (
                                                    <div className={`d-flex align-items-center nav-list-item my-1 ${chat.chat_id == currentChatId && "active"} ${chat.chat_id == chatButtonTracking && "selected"}`} key={chat.chat_id}>
                                                    {chat.chat_id == editingChatId ? (
                                                        <input
                                                        ref={focusRef}
                                                        value={newChatName}
                                                        onChange={(e) => setNewChatName(e.target.value)}
                                                        onBlur={() => renameChatList()}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            renameChatList();
                                                            }
                                                        }}
                                                        />
                                                    ) : (
                                                        <>
                                                        <Link
                                                            title={chat.chat_name}
                                                            to={`/u/c/${chat.chat_id}`}
                                                            className="link flex-1 w-80 of-h p-1"
                                                        >
                                                            {truncateString(chat.chat_name || chat.chat_id)}
                                                        </Link>
                                                        <div className='scheduleded-container d-flex align-items-center' title='scheduleded generation'>
                                                            {chat.is_scheduled === 1 && (
                                                                <AccessTimeRoundedIcon style={{ fontSize: 16 }} />
                                                            )}
                                                        </div>
                                                        <button
                                                            ref={optionsRef}
                                                            onClick={() => {
                                                            setShowOptions(!showOptions);
                                                            setChatButtonTracking(chat.chat_id);
                                                            }}
                                                            className="button p-0del more-options d-flex justify-content-center align-items-center p-0"
                                                        >
                                                            <span className="material-symbols-outlined">more_vert</span>
                                                        </button>
                                                        {showOptions && chat.chat_id == chatButtonTracking && (
                                                            <div ref={optionsRef} className="nav-list-item-dropdown">
                                                            <ChatOptionDropDown
                                                                handleRename={() => callRenameChatList(chat.chat_id, chat.chat_name)}
                                                                handleDelete={() => {
                                                                setDeleteChatId(chat.chat_id);
                                                                setShowDeletePopUp(true);
                                                                }}
                                                            />
                                                            </div>
                                                        )}
                                                        </>
                                                    )}
                                                    </div>
                                                ))}
                                                </div>
                                            );
                                            } else {
                                            const yearEntries = Object.entries(chats).filter(([_, months]) =>
                                                Object.values(months).some((monthChats) => monthChats.length > 0)
                                            );

                                            if (yearEntries.length === 0) return null;

                                            return (
                                                <div key={index} className='d-flex flex-column align-items-center mb-3'>
                                                <h6 className='chat-group-heading p-secondary w-100 text-start'>{group}</h6>
                                                {yearEntries.map(([year, months]) => {
                                                    const validMonths = Object.entries(months).filter(([_, chats]) => chats.length > 0);

                                                    if (validMonths.length === 0) return null;

                                                    return (
                                                    <div key={year}>
                                                        <h6 className='chat-group-sub-heading text-start ms-5'>{year}</h6>
                                                        {validMonths.map(([month, monthChats]) => (
                                                        <div key={month}>
                                                            <h6 className='chat-group-sub-heading'>{month}</h6>
                                                            {monthChats.map((chat, index) => (
                                                            <div className={`d-flex align-items-center nav-list-item my-1 ${chat.chat_id == currentChatId && "active"} ${chat.chat_id == chatButtonTracking && "selected"}`} key={chat.chat_id}>
                                                                {chat.chat_id == editingChatId ? (
                                                                <input
                                                                    ref={focusRef}
                                                                    value={newChatName}
                                                                    onChange={(e) => setNewChatName(e.target.value)}
                                                                    onBlur={() => renameChatList()}
                                                                    onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                        renameChatList();
                                                                    }
                                                                    }}
                                                                />
                                                                ) : (
                                                                <>
                                                                    <Link
                                                                    title={chat.chat_name}
                                                                    to={`/u/c/${chat.chat_id}`}
                                                                    className="link flex-1 w-80 of-h p-1"
                                                                    >
                                                                    {truncateString(chat.chat_name || chat.chat_id)}
                                                                    </Link>
                                                                    <button
                                                                    ref={optionsRef}
                                                                    onClick={() => {
                                                                        setShowOptions(!showOptions);
                                                                        setChatButtonTracking(chat.chat_id);
                                                                    }}
                                                                    className="button p-0del more-options d-flex justify-content-center align-items-center p-0"
                                                                    >
                                                                    <span className="material-symbols-outlined">more_vert</span>
                                                                    </button>
                                                                    {showOptions && chat.chat_id == chatButtonTracking && (
                                                                    <div ref={optionsRef} className="nav-list-item-dropdown">
                                                                        <ChatOptionDropDown
                                                                        handleRename={() => callRenameChatList(chat.chat_id, chat.chat_name)}
                                                                        handleDelete={() => {
                                                                            setDeleteChatId(chat.chat_id);
                                                                            setShowDeletePopUp(true);
                                                                        }}
                                                                        />
                                                                    </div>
                                                                    )}
                                                                </>
                                                                )}
                                                            </div>
                                                            ))}
                                                        </div>
                                                        ))}
                                                    </div>
                                                    );
                                                })}
                                                </div>
                                            );
                                            }
                                        })
                                        ) : (
                                            <h6 className="p-primary">No Data</h6>
                                    )}

                                    {/* <ChatList chats={chatList}/> */}
                                    
                            </div>
                        }
                    </div>
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

            {
                showDeletePopUp &&
                <DeletePopUp handelDelete={handelDeleteChat} showDeletePopUp={showDeletePopUp} onHide={()=>setShowDeletePopUp(false)} message={"Are you sure you want deleted this chat?"}/>  // This is where you call your delete function and pass the chatId to it.
            }
        </>
    )
}

