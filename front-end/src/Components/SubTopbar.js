import React, { useContext, useEffect, useState } from 'react'
import logo from "../images/genimagin_logo.png"
import { Link } from 'react-router-dom'
import ModelSelector from './CommonComponents/ModelSelector'
import AuthContext from '../Context/AuthProvider'

export default function SubTopbar({setShowNavBar,showNavBar,width}) {

  const {loggedIn}= useContext(AuthContext);
  const [userData,setUserData]= useState(null)

  useEffect(() => {
    if(localStorage.getItem('user_data')){
      setUserData(JSON.parse(localStorage.getItem('user_data')))
    }
  }, [loggedIn])
  
  return (
    <div className={`sub-top-bar ${showNavBar?"short":"big"} d-flex justify-content-between`} style={{width:`${showNavBar?width-250:width}px` }} >

        <div className='flex-1 d-flex justify-content-start align-items-center'>
          <button className='button p-0' onClick={()=>setShowNavBar(!showNavBar)} >{showNavBar?<span className="material-symbols-outlined">left_panel_close</span>:<span className="material-symbols-outlined">left_panel_open</span>}</button>
          <ModelSelector/>
        </div>
        <div className='flex-1'>
          {!showNavBar&&<img className='big-logo' src={logo} alt='genimagine logo'></img>}
        </div>
        { loggedIn?
          <div className='me-2 mt-2 '>
            {userData?<div className='profile-pic-small'><p className='pt-1'>{userData.username[0]}</p></div>:<div></div>}
          </div>
        :
          <div className='flex-1 d-flex align-items-center justify-content-end'>
            <Link to={"/sign-up"} className='button dark-button me-4' >Sign Up</Link>
            <Link to={"/login"} className="button dark-button me-4 "> Login</Link>
          </div>
        }
    </div>
  )
}
