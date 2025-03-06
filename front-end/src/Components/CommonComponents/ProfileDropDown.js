import React, { useContext } from 'react'
import '../../Css/ProfileDropDown.css'
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../Context/AuthProvider';
import { axiosInstance } from '../../API\'s/axios';
import DropdownContext from '../../Context/DropdownProvider';

function ProfileDropDown() {

    
    const {loggedIn,setLoggedIn} = useContext(AuthContext)
    const {setShowDropdown} = useContext(DropdownContext)
    const navigate = useNavigate()

    const handleLogout = async() => {
        try{
            const resopnse = await axiosInstance.get('/auth/logout')
            console.log("logged out successfully")
            setLoggedIn(false);
            setShowDropdown(false);
            navigate('/');
        }catch(error){
            console.error("error getting logout",error);
        }
    };

    const handleNavigation = () => {
        setShowDropdown(false);
    };

  return (
    <div className="dropdown-menu p-0">
        <Link to="/u/profile" className="dropdown-item" onClick={handleNavigation}>Profile</Link>
        <Link to="/u/library" className="dropdown-item" onClick={handleNavigation}>Library </Link>
        <Link to="/u/published-images" className="dropdown-item" onClick={handleNavigation}>published Images</Link>
        <button className="dropdown-item" onClick={handleLogout}>Sign Out</button>
    </div>
  )
}

export default ProfileDropDown;