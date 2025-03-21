import React from 'react'

import { Outlet } from 'react-router-dom'
import Navbar from '../Components/LandingPageComponenets/Navbar'
import Footer from '../Components/LandingPageComponenets/Footer'

export default function HomeLayout() {
  return (
    <div className='home-layout'>
        
        <nav className='header'>
            <Navbar></Navbar>
        </nav>

        <Outlet></Outlet>
        <footer className='footer-section'> 
          <Footer/>
        </footer>
    </div>
  )
}