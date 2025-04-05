import React, { useEffect, useState } from 'react'
import logo from "../images/genimagin_logo.png"
import { Link } from 'react-router-dom'
import "../Css/SideNavBar.css"
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import UserNavbar from './Navbar/UserNavbar';

export default function SideNavBar({showNavBar,setShowNavBar,width}){

    const [showNavBar2,setShowNavBar2]=useState(true)

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

  return (
    <>
        <nav className={`side-nav ${showNavBar2?'active':'in-active'} Nav d-flex flex-column`}  style={{ height:`${height}px` }}>
        

            <div className='nav-logo-section'>
        
                    <Link to={'/'}>
                    <img src={logo} className="big-logo" alt='Genimagine logo'/>
                    </Link>
            
            </div>
            <div className='side-nav-options-container d-flex flex-column justify-content-between y-scrollable-container'>
                <UserNavbar/>
               
            </div>
            { 
                <button className={ `side-nav-close-button  ${showNavBar?'active':'in-active'} `} onClick={()=>setShowNavBar(false)}> <ArrowCircleLeftOutlinedIcon/></button>
            }

        </nav>
        <div className={`sidenav-blur-bg ${showNavBar2?'active':'in-active'} ` }  onClick={()=>setShowNavBar(false)}></div>
    </>
  )
}
