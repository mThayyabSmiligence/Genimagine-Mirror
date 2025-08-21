import React, { useContext, useEffect, useState } from 'react'
import '../../Css/LandingPage.css'
import logo from '../../images/genimagin_logo.png'
import { Link } from 'react-router-dom';
import ProfileDropDown from '../CommonComponents/ProfileDropDown';
import AuthContext from '../../Context/AuthProvider';
import { axiosInstance } from '../../API\'s/axios';
import DropdownContext from '../../Context/DropdownProvider';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

function Navbar() {

    const {loggedIn,setLoggedIn} = useContext(AuthContext)
    // const [showDropdown, setShowDropdown] = useState(false);
    const { showDropdown, setShowDropdown, dropdownRef } = useContext(DropdownContext);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid ms-4">
            <Link className="navbar-brand" to={'/'}>
                <img className='nav-logo' src={logo} alt='logo.png'/>
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse " id="navbarNavAltMarkup">
                <div className="navbar-nav w-100 d-flex  justify-content-between">
                    <div className='navbar-list d-flex'>

                    <Link  className="link nav-link p-primary" to={'/'}>Home</Link>
                    <Link  className="link nav-link p-primary" to={'/explore'}>Explore</Link>
                    <Link  className="link nav-link p-primary" to={'/credit-purchase'}>Pricing</Link>
                    <Link  className="link nav-link p-primary" to={'/image-generation'}>Generation</Link>
                    <Link  className="link nav-link p-primary" to={'/image-to-prompt'}>Image to Prompt</Link>
                    </div>
                    <div className='sign-in d-flex align-items-center justify-content-center'>
                    {loggedIn ? (
                            <div className="profile-dropdown" ref={dropdownRef}>
                                <button className='profile-button dark-button ' onClick={() => setShowDropdown(!showDropdown)}>
                                    <PersonOutlineOutlinedIcon/>
                                </button>
                                {showDropdown && 
                                   <ProfileDropDown/>
                                }
                            </div>
                        ) : (
                            <Link to={"/login"} className='sign-in-link link br-10 px-3 py-2 me-3 p-primary'>Sign-in</Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </nav>
  )
}

export default Navbar