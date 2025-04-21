import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from "../../images/genimagin_logo.png"
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

export default function ModeratorNavbar() {
    const location = useLocation()
    const path = location.pathname;
    const [height, setHeight] = useState(window.innerHeight);
    return (
        <>
             <div className='nav-logo-section'>                   
                <Link to={'/moderator/dashboard'}>
                    <img src={logo} className="big-logo" alt='Genimagine logo'/>
                </Link>                        
            </div>

            <div className='side-nav-options-container d-flex flex-column justify-content-between y-scrollable-container'>

                <div className='side-nav-middle-section p-relative h-auto moderator-navbar-section' style={{ height:`${height-150}px`} }>

                    <div className='sub-mid-section moderator-nav-sub-section'>

                        

                        <Link to={"/moderator/dashboard" } className='link mb-1'  id='moderator-dashboard-link'>
                            <div className={`nav-list-item d-flex align-items-center ${path=="/moderator/dashboard"&&'active'}`}>

                                {/* <ExploreOutlinedIcon/> */}
                                <div to={"/moderator/dashboard" } className='link nav-options ms-1'>Dashboard</div>
                            </div>
                        </Link>
                        
              
                        <div className={` d-flex align-items-center w-80`}>
                            <h6 className='management-list-heading chat-group-heading p-secondary w-100 text-start'>Managements</h6>
                            {/* <ShoppingCartOutlinedIcon/> */}
                            {/* <div to={"/managements" } className='link nav-options ms-1'>Managements</div> */}
                        </div>
   
                        <Link to={"/moderator/user-management" } className='link mb-1'  id='user-management-link'>
                            <div className={`nav-list-item d-flex align-items-center ${path=="/moderator/user-management"&&'active'}`}>

                                {/* <ExploreOutlinedIcon/> */}
                                <div to={"/moderator/user-management" } className='link nav-options ms-1'>User Management</div>
                            </div>
                        </Link>

                        

                        <Link to={"/moderator/reports"} className='link' id='report-link'>
                            <div className={`nav-list-item d-flex align-items-center ${path=="/moderator/reports"&&'active'}`}>

                                
                                <div to={"/moderator/reports" } className='link nav-options ms-1'>Reports</div>
                            </div>
                        </Link>

                        <Link to={"/moderator/feedbacks"} className='link' id='report-link'>
                            <div className={`nav-list-item d-flex align-items-center ${path=="/moderator/feedbacks"&&'active'}`}>

                                
                                <div to={"/moderator/feedbacks" } className='link nav-options ms-1'>Feedbacks</div>
                            </div>
                        </Link>

                    </div>
                </div>
            </div>
        </>
    )
}

