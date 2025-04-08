import React, { useContext, useEffect, useState } from 'react'
import '../../Css/ProfileDropDown.css'
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../Context/AuthProvider';
import { axiosInstance } from '../../API\'s/axios';
import DropdownContext from '../../Context/DropdownProvider';
import SignOutConfirmationPopUp from './SignOutConfirmationPopUp';
import RefreshDataContext from '../../Context/RefreshDataProvider';

function ProfileDropDown() {

    
    const {loggedIn,setLoggedIn} = useContext(AuthContext)
    const {setShowDropdown,dropdownRef} = useContext(DropdownContext)
    const [userData, setUserData]= useState(null)
    const {refreshUserData,setRefreshUserData} = useContext(RefreshDataContext)


    const[showSignOutPopUp,setShowSignOutPopUp]=useState(false)
    const navigate = useNavigate()

    const handleLogout = async() => {
        try{
            const resopnse = await axiosInstance.get('/auth/logout')
            console.log("logged out successfully")
            setLoggedIn(false);
            setShowDropdown(false);
            await localStorage.removeItem('user_data')
            setRefreshUserData(!refreshUserData)
            await localStorage.removeItem('image_settings')
            navigate('/');
        }catch(error){
            console.error("error getting logout",error);
        }
    };

    const handleNavigation = () => {
        setShowDropdown(false);
    };

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        setUserData(userData);
    })

  return (
    
    <div className="dropdown-menu p-0" ref={dropdownRef}>
        {   
        userData&&userData?.role !== "admin" && userData?.role !== "moderator" &&
        <>
            <Link to="/u/profile" className="dropdown-item" onClick={handleNavigation}>Profile</Link>
            <Link to="/u/library" className="dropdown-item" onClick={handleNavigation}>Library </Link>
            <Link to="/u/published-images" className="dropdown-item" onClick={handleNavigation}>Published Images</Link>
        </>
        
        }

        {      
            userData?.role == "admin" &&
            // <Link to="" className="dropdown-item" onClick={handleNavigation}>Admin Panel</Link>
            <Link></Link>
        }
        {
            userData?.role == "moderator" &&
            // <Link to="" className="dropdown-item" onClick={handleNavigation}>Moderator Panel</Link>
            <Link></Link>
        }
        <button className="dropdown-item" onClick={()=>setShowSignOutPopUp(true)}>Sign Out</button>
        {
            showSignOutPopUp&&
            <SignOutConfirmationPopUp showSignOutPopUp={showSignOutPopUp} onHide={()=>setShowSignOutPopUp(false)} handelSignOut={handleLogout}></SignOutConfirmationPopUp>
        }
    </div>
  )
}

export default ProfileDropDown;