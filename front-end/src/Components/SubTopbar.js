import React, { useContext, useEffect, useState } from 'react'
import logo from "../images/genimagin_logo.png"
import { Link } from 'react-router-dom'
import ModelSelector from './CommonComponents/ModelSelector'
import AuthContext from '../Context/AuthProvider'
import CreditBalance from './CommonComponents/CreditBalance'

export default function SubTopbar({setShowNavBar,showNavBar,width}) {

  const {loggedIn}= useContext(AuthContext);
  const [userData,setUserData]= useState(null)

  useEffect(() => {
    if(localStorage.getItem('user_data')){
      setUserData(JSON.parse(localStorage.getItem('user_data')))
    }
  }, [loggedIn])
  
  return (
    <div className={`sub-top-bar ${showNavBar?"short":"big"} d-flex justify-content-between align-items-center`} style={{width:`${showNavBar?width-250:width}px` }} >

        <div className='flex-1 d-flex justify-content-start align-items-center'>
          <button className='button p-0' onClick={()=>setShowNavBar(!showNavBar)} >{showNavBar?<span className="material-symbols-outlined">left_panel_close</span>:<span className="material-symbols-outlined">left_panel_open</span>}</button>
          
        </div>
        <div className='flex-1'>
          {!showNavBar&&<img className='big-logo' src={logo} alt='genimagine logo'></img>}
        </div>
        { loggedIn?
          <div className='me-2 mt-2 d-flex align-items-center'>
            <CreditBalance></CreditBalance>
            <Link className='buy-credits-link button-wh h-40p dark-button-wh d-flex align-items-center br-100'>
              <span className="material-symbols-outlined">
                shopping_bag
              </span>
              <p className='m-0 flex-1'>
              Buy Credits
              </p>
            </Link>
            {userData?<div className='profile-pic-small'><p className='pt-1'>{userData.username[0]}</p></div>:<div></div>}
          </div>
        :
          <div className='flex-1 d-flex align-items-center justify-content-end'>
            <Link to={"/register"} className='button dark-button me-4' >Sign Up</Link>
            <Link to={"/login"} className="button dark-button me-4 "> Login</Link>
          </div>
        }
    </div>
  )
}
