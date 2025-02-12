import React from 'react'
import SideNavBar from '../Components/SideNavBar'
import SubTopbar from '../Components/SubTopbar'
import { Outlet } from 'react-router-dom'

export default function NavLayout({setShowNavBar,showNavBar,width}) {
  return (
    <div className='nav-layout'>
        <SideNavBar showNavBar={showNavBar}></SideNavBar>
        <SubTopbar setShowNavBar={setShowNavBar} showNavBar={showNavBar} width={width}></SubTopbar>
        <div className={`content-section ${!showNavBar?"big":"short"}  d-flex flex-column` } style={{ width:`${showNavBar?width-250:width}px` }}>

        <Outlet></Outlet>
        </div>
    </div>
  )
}
