import React, {  useEffect, useState } from 'react'
import logo from "../images/genimagin_logo.png"
import { Link } from 'react-router-dom'
import "../Css/SideNavBar.css"

export default function SideNavBar({showNavBar}) {

    const [showNavBar2,setShowNavBar2]=useState(true)

    useEffect(()=>{
        if(showNavBar){
            setTimeout(() => {
                setShowNavBar2(showNavBar)
            }, 300);
        }else{
            setShowNavBar2(showNavBar)
        }
    },[showNavBar])



    const [chatList,setChatList]=useState([
        {
            title:"title 1"
        },
        {
            title:"title 2"
        },
        {
            title:"title 3"
        },
        {
            title:"title 4"
        },
        {
            title:"title 5"
        },
        {
            title:"title 5"
        },
        {
            title:"title 1"
        },
        {
            title:"title 2"
        },
        {
            title:"title 3"
        },
        {
            title:"title 4"
        },
        {
            title:"title 5"
        },
        {
            title:"title 5"
        },
        {
            title:"title 1"
        },
        {
            title:"title 2"
        },
        {
            title:"title 3"
        },
        {
            title:"title 4"
        },
        {
            title:"title 5"
        },
        {
            title:"title 5"
        },
        
    ])
    
    useEffect(()=>{
        setChatList(chatList)
    },[chatList])

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
                    <div className=' nav-list-item'>
                    <span className="material-symbols-outlined">explore</span>
                        <Link to={"/exprole" } className='link nav-options'>Explore</Link>
                    </div>
                </div>
                <div className=' sub-mid-section '>
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
                                            chatList.map((item,index)=>(
                                                <Link className='link nav-list-item' key={index}>{item.title}</Link>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
            </div>
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
        </div>
    </nav>
  )
}
