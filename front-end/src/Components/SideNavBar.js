import React, {  useContext, useEffect, useState } from 'react'
import logo from "../images/genimagin_logo.png"
import { Link, useLocation } from 'react-router-dom'
import "../Css/SideNavBar.css"
import useAuth from '../Hooks/useAuth'
import { axiosPrivate } from '../API\'s/axios'
import AuthContext from '../Context/AuthProvider'
import RefreshDataContext from '../Context/RefreshDataProvider'

export default function SideNavBar({showNavBar,setShowNavBar,width}){

    const [showNavBar2,setShowNavBar2]=useState(true)
    const location=useLocation()

    const path = location.pathname;
    const currentChatId= path.split('/')[3]



    const { refreshChatList,setRefreshChatList} = useContext(RefreshDataContext)
    const {loggedIn} =useContext(AuthContext)

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




    const [chatList,setChatList]=useState([
        
       
        
    ])
    
   

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
  return (
    <nav className={`side-nav ${showNavBar2?'active':'in-active'} Nav d-flex flex-column`}  style={{ height:`${height}px` }}>
    

        <div className='nav-logo-section'>
       
                <img src={logo} className="big-logo" alt='Genimagine logo'/>
        
        </div>
        <div className='side-nav-options-container d-flex flex-column justify-content-between y-scrollable-container'>
            <div className='side-nav-middle-section p-relative h-auto ' style={{ height:`${height-150}px`} }>

                <div className='sub-mid-section '>
                    <Link to={"/explore" } className='link' >
                        <div className=' nav-list-item'>
                        <span className="material-symbols-outlined">explore</span>
                            <div to={"/image-generation" } className='link nav-options'>Explore</div>
                        </div>
                    </Link>
                    <Link to={"/image-generation" } className='link' >
                        <div className=' nav-list-item'>
                        <span className="material-symbols-outlined">add_circle</span>
                            <div to={"/image-generation" } className='link nav-options'>New Chat</div>
                        </div>
                    </Link>

                </div>
                <div className=' sub-mid-section '>
                    {   loggedIn&&
                        
                        <div className='accordion w-100'>
                            <div className='accordion-item'>
                                <h2 className="accordion-header">
                                    <button className="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                    <span className="material-symbols-outlined">chat</span>Chats
                                    </button>
                                </h2>
                                <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                                    <div className="accordion-collapse d-flex flex-column align-items-center">
                                        {
                                            Object.entries(chatList).map(([key,value],index)=>(
                                                <Link to={`/u/c/${value.chat_id}`} className={`link nav-list-item ${value.chat_id==currentChatId&&"active"}`} key={index}>{value.chat_id}</Link>
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
                            <span className="material-symbols-outlined">child_care</span>
                            <label htmlFor=' kids-mode-switch'>Kid's Mode</label>
                        </div>
                            <label className='switch kids-mode-switch'>
                                <input type="checkbox"></input>
                                <span className='slider round'></span>
                            </label>
                    </div>
                    <div className='side-nav-bottom-item d-flex justify-content-start align-items-center ' >

                        <button className='d-flex justify-content-center align-items-center border-0 p-0  bg-light'>
                                <span className="material-symbols-outlined">settings</span>
                                <>Settings</>
                        </button>
                    </div>
                </div>
            }
        </div>
        {
        width<766&&
        <button className={ `side-nav-close-button  ${showNavBar?'active':'in-active'} d-flex justify-content-center align-items-center`} onClick={()=>setShowNavBar(false)}> <span className="material-symbols-outlined">left_panel_close</span></button>}
    </nav>
  )
}
