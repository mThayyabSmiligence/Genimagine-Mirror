import React from 'react'
import logo from "../images/genimagin_logo.png"
import { Link } from 'react-router-dom'

export default function SubTopbar({setShowNavBar,showNavBar}) {
  return (
    <div className={`sub-top-bar ${showNavBar?"short":"big"} d-flex justify-content-between`} >

        <button className='button p-0' onClick={()=>setShowNavBar(!showNavBar)} >{showNavBar?<span className="material-symbols-outlined">left_panel_close</span>:<span className="material-symbols-outlined">left_panel_open</span>}</button>
        {!showNavBar&&<img className='big-logo' src={logo} alt='genimagine logo'></img>}
        <Link className="button dark-button"> Login</Link>
    </div>
  )
}
