import React, { useEffect, useState } from 'react'
import logo from "../images/genimagin_logo.png"
import { Link } from 'react-router-dom'
import UserTopbar from './SubTopBarBYRole/UserTopbar'
import AdminTopbar from './SubTopBarBYRole/AdminTopbar';
import ModeratorTopbar from './SubTopBarBYRole/ModeratorTopbar';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
export default function SubTopbar({setShowNavBar,showNavBar,width}) {

    const [userData,setUserData] = useState("");

  useEffect(() => {
        const getUserData = localStorage.getItem("user_data");
        const userData = JSON.parse(getUserData);
        setUserData(userData);
        console.log(userData);
      },[])
  
  return (
    <div className={`sub-top-bar ${showNavBar?"short":"big"} d-flex justify-content-between align-items-center`} style={{width:`${width<766?width:showNavBar?width-250:width}px` }} >

        <div className='flex-1 d-flex justify-content-start align-items-center'>
          <button className='button p-0 d-flex w-ft h-ft' id='side-nav-button' onClick={()=>setShowNavBar(!showNavBar)} >{showNavBar?<ArrowCircleLeftOutlinedIcon className='navbar-icons'/>:<ArrowCircleRightOutlinedIcon className='navbar-icons'/>}</button>
          {!showNavBar&&  
            <Link to={'/'}> 
              <img className='big-logo' src={logo} alt='genimagine logo'></img>
            </Link>
          }
        </div>
  
          {
            userData?.role == "admin" ? <AdminTopbar/> : userData ?.role == "moderator" ? <ModeratorTopbar/> : <UserTopbar/>
          }
        
    </div>
  )
}
