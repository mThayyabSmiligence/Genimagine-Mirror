import React, { useEffect, useState } from 'react'
import '../../Css/LandingPage.css'
import logo from '../../images/genimagin_logo.png'
import { Link } from 'react-router-dom';

function Navbar() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('userToken');
            setIsLoggedIn(!token);
        };

        checkLoginStatus();
    }, []);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid ms-4">
            <a className="navbar-brand" href="#">
                <img className='nav-logo' src={logo} alt='logo.png'/>
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse " id="navbarNavAltMarkup">
                <div className="navbar-nav w-100 d-flex  justify-content-between">
                    <div className='navbar-list d-flex'>

                    <Link  className="link nav-link" to={''}>Home</Link>
                    <Link  className="link nav-link" to={''}>About Us</Link>
                    <Link  className="link nav-link" to={'/credit-purchase'}>pricing</Link>
                    <Link  className="link nav-link" to={'/image-generation'}>generation</Link>
                    </div>
                    <div className='sign-in'>
                    {isLoggedIn ? (
                            <button className='profile-button dark-button me-3'><span className="material-symbols-outlined">person</span></button>
                        ) : (
                            <button className='sign-in-button dark-button br-10 px-3 py-1 me-3'>Sign-in</button>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    </nav>
  )
}

export default Navbar