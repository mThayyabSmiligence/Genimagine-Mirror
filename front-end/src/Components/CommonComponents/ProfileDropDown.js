import React, { useContext } from 'react'
import '../../Css/ProfileDropDown.css'
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../Context/AuthProvider';
import { axiosInstance } from '../../API\'s/axios';

function ProfileDropDown() {

    
    const {loggedIn,setLoggedIn} = useContext(AuthContext)

    const navigate = useNavigate()

    const handleLogout = async() => {
        try{
            const resopnse = await axiosInstance.get('/auth/logout')
            console.log("logged out successfully")
            setLoggedIn(false);
            navigate('/', { replace: true }); // replace the current location with the new one.

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