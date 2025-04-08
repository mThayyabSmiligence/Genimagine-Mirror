import React, { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'
import "../Css/SideNavBar.css"
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import UserNavbar from './SideNavBarBYRole/UserNavbar';
import ModeratorNavbar from './SideNavBarBYRole/ModeratorNavbar';
import AdminNavbar from './SideNavBarBYRole/AdminNavbar';

export default function SideNavBar({showNavBar,setShowNavBar,width}){

    const [showNavBar2,setShowNavBar2]=useState(true)
    const [userData,setUserData]=useState("");

    useEffect(()=>{
        if(showNavBar){
            setTimeout(() => {
                setShowNavBar2(showNavBar)
            }, 300);
        }else{
            setShowNavBar2(showNavBar)
        }
    },[showNavBar])
    
    const [height, setHeight] = useState(window.innerHeight);
          
        useEffect(() => {
          const handleResize = () => {
            setHeight(window.innerHeight);
          };
              
          window.addEventListener('resize', handleResize);
              
          return () => {
            window.removeEventListener('resize', handleResize);
          };
    }, []);

    useEffect(() => {
      const getUserData = localStorage.getItem("user_data");
      const userData = JSON.parse(getUserData);
      setUserData(userData);
      console.log(userData);
    },[])
      
  return (
    <>
        <nav className={`side-nav ${showNavBar2?'active':'in-active'} Nav d-flex flex-column`}  style={{ height:`${height}px` }}>
        

           
            {
                    userData?.role == "admin" ? <AdminNavbar/> : userData ?.role == "moderator" ? <ModeratorNavbar/> : <UserNavbar/>
            } 
            { 
                <button className={ `side-nav-close-button  ${showNavBar?'active':'in-active'} `} onClick={()=>setShowNavBar(false)}> <ArrowCircleLeftOutlinedIcon/></button>
            }

        </nav>
        <div className={`sidenav-blur-bg ${showNavBar2?'active':'in-active'} ` }  onClick={()=>setShowNavBar(false)}></div>
    </>
  )
}
