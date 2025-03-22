import React, { useContext, useEffect, useRef, useState } from 'react'
import logo from "../images/genimagin_logo.png"
import { Link } from 'react-router-dom'
import ModelSelector from './CommonComponents/ModelSelector'
import AuthContext from '../Context/AuthProvider'
import CreditBalance from './CommonComponents/CreditBalance'
import ProfileDropDown from './CommonComponents/ProfileDropDown'
import DropdownContext from '../Context/DropdownProvider';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
export default function SubTopbar({setShowNavBar,showNavBar,width}) {

  const {loggedIn}= useContext(AuthContext);
  const [userData,setUserData]= useState(null)
  const { showDropdown, setShowDropdown, dropdownRef } = useContext(DropdownContext);



  useEffect(() => {
    if(localStorage.getItem('user_data')){
      setUserData(JSON.parse(localStorage.getItem('user_data')))
    }
  }, [loggedIn])

  
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
       
          
        
        { loggedIn?
          <div className='me-2 d-flex align-items-center'>
            <CreditBalance></CreditBalance>
            {/* <Link to={"/credit-purchase"} className='buy-credits-link button-wh h-40p dark-button-wh d-flex align-items-center br-100'>
              <LocalMallOutlinedIcon/>
              <p className='m-0 flex-1'>
              Buy Credits
              </p>
            </Link> */}
            <div className="profile-dropdown" ref={dropdownRef}>
              <button className='profile-button dark-button me-3 ' onClick={() => setShowDropdown(!showDropdown)}>
                <PersonOutlineOutlinedIcon/>
              </button>
              {showDropdown && 
                <ProfileDropDown/>
              }
            </div>
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
