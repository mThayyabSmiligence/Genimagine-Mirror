import React from 'react'
import logo from "../images/genimagin_logo.png"
import { Link } from 'react-router-dom'

export default function SubTopbar({setShowNavBar,showNavBar,width}) {
  return (
    <div className={`sub-top-bar ${showNavBar?"short":"big"} d-flex justify-content-between`} style={{width:`${showNavBar?width-250:width}px` }} >

        <div className='flex-1 d-flex justify-content-start'>
        <button className='button p-0' onClick={()=>setShowNavBar(!showNavBar)} >{showNavBar?<span className="material-symbols-outlined">left_panel_close</span>:<span className="material-symbols-outlined">left_panel_open</span>}</button>
        </div>
        <div className='flex-1'>
          {!showNavBar&&<img className='big-logo' src={logo} alt='genimagine logo'></img>}
        </div>
        <div className='flex-1 d-flex align-items-center justify-content-end'>
          <Link to={"/sign-up"} className='button dark-button me-4' >Sign Up</Link>
          <Link to={"/login"} className="button dark-button me-4 "> Login</Link>
        </div>
    </div>
  )
}
