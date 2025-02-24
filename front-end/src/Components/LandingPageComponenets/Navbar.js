import React, { useEffect, useState } from 'react'
import '../../Css/Navbar.css'
import logo from '../../images/genimagin_logo.png'

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

                    <a className="nav-link" href="#">Home</a>
                    <a className="nav-link" href="#">About Us</a>
                    <a className="nav-link" href="#">pricing</a>
                    <a className="nav-link" href='#'>generation</a>
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