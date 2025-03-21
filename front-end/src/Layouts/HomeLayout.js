import React from 'react'

import { Outlet } from 'react-router-dom'
import Navbar from '../Components/LandingPageComponenets/Navbar'

export default function HomeLayout() {
  return (
    <div className='home-layout'>
        
        <nav className='header'>
            <Navbar></Navbar>
        </nav>

        <Outlet></Outlet>
    </div>
  )
}