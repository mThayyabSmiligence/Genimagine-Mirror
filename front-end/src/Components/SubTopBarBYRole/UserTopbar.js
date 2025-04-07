import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ModelSelector from '../CommonComponents/ModelSelector'
import AuthContext from '../../Context/AuthProvider';
import CreditBalance from '../CommonComponents/CreditBalance'
import ProfileDropDown from '../CommonComponents/ProfileDropDown';
import DropdownContext from '../../Context/DropdownProvider';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';

export default function UserTopbar() {
    const {loggedIn}= useContext(AuthContext);
    const [userData, setUserData]= useState(null)
    const { showDropdown, setShowDropdown, dropdownRef } = useContext(DropdownContext);

    useEffect(() => {
        if(localStorage.getItem('user_data')){
          const userData = JSON.parse(localStorage.getItem('user_data'));  
          setUserData(userData);
        }
    }, [loggedIn])
  
    return (
        <div>
            { loggedIn?
            <div className='me-2 d-flex align-items-center'>
                <CreditBalance/>
            
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
