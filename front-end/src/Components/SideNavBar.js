import React, { useEffect, useState } from 'react'
import logo from "../images/genimagin_logo.png"
import shortLogo from "../images/genimagin_short_logo.png"

export default function SideNavBar({showNavBar}) {
    const[navbar,setNavBar]=useState()

    const [width, setWidth] = useState(window.innerWidth < 400 ? window.innerWidth - 80 : window.innerWidth - 200);

    // Highlighted Change: Simplified window resize handling
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth < 400 ? window.innerWidth - 80 : window.innerWidth - 200);

        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const handelLinkClick=()=>{
        
    }


  return (
    <nav className={`side-nav ${showNavBar?'active':'in-active'} Nav d-flex flex-column`} >
    

        <div className='nav-logo-section'>
             {
            showNavBar?
                <img src={logo} className="big-logo"/> :
                <img src={shortLogo} className='short-logo'/>
            
            }
        </div>
        <div>
            <div></div>
            <div></div>
        </div>
    </nav>
  )
}
