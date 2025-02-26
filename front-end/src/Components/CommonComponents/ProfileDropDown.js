import React, { useContext } from 'react'
import '../../Css/ProfileDropDown.css'
import { Link } from 'react-router-dom';
import AuthContext from '../../Context/AuthProvider';
import { axiosInstance } from '../../API\'s/axios';

function ProfileDropDown() {

    
    const {loggedIn,setLoggedIn} = useContext(AuthContext)

    const handleLogout = async() => {
        try{
            const resopnse = await axiosInstance.get('/auth/logout')
            console.log("logged out successfully")
            setLoggedIn(false);
        }catch(error){
            console.error("error getting logout",error);
        }
    };
  return (
    <div className="dropdown-menu p-0">
        <Link to="/u/profile" className="dropdown-item">Profile</Link>
        <Link to="/u/library" className="dropdown-item">Library </Link>
        <Link to="/u/published-images" className="dropdown-item">published Images</Link>
        <button className="dropdown-item" onClick={handleLogout}>Sign Out</button>
    </div>
  )
}

export default ProfileDropDown;