import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from "../../images/genimagin_logo.png"
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

export default function AdminNavbar() {
    const location = useLocation()
    const path = location.pathname;
    const [height, setHeight] = useState(window.innerHeight);
    return (
        <>
            <div className='nav-logo-section'>              
                <Link to={'/admin/dashboard'}>
                    <img src={logo} className="big-logo" alt='Genimagine logo'/>
                </Link>                     
            </div>
            <div className='side-nav-options-container d-flex flex-column justify-content-between y-scrollable-container'>
                    
            <div className='side-nav-middle-section p-relative h-auto moderator-navbar-section' style={{ height:`${height-150}px`} }>

                <div className='sub-mid-section moderator-nav-sub-section'>

                    <Link to={"/admin/dashboard" } className='link mb-1'  id='admin/dashboard-link'>
                        <div className={`nav-list-item d-flex align-items-center ${path=="/admin/dashboard"&&'active'}`}>

                            {/* <ExploreOutlinedIcon/> */}
                            <div to={"/admin/dashboard" } className='link nav-options ms-1'>Dashboard</div>
                        </div>
                    </Link>
                    <div className={` d-flex align-items-center w-80`}>
                        <h6 className='management-list-heading chat-group-heading p-secondary w-100 text-start'>Managements</h6>
                        {/* <ShoppingCartOutlinedIcon/> */}
                        {/* <div to={"/managements" } className='link nav-options ms-1'>Managements</div> */}
                    </div>
                    <Link to={"/admin/moderator-management" } className='link'  id='/admin/moderator-management-link'>
                        <div className={`nav-list-item  d-flex align-items-center ${path=="/admin/moderator-management"&&'active'}`}>

                            {/* <AddCircleOutlineOutlinedIcon/> */}
                            <div to={"/admin/moderator-management" } className='link nav-options ms-1'>Moderator-Management</div>
                        </div>
                    </Link>

                    <Link to={"/admin/model-management" } className='link'  id='/admin/model-management-link'>
                        <div className={`nav-list-item  d-flex align-items-center ${path=="/admin/model-management"&&'active'}`}>

                            {/* <AddCircleOutlineOutlinedIcon/> */}
                            <div to={"/admin/model-management" } className='link nav-options ms-1'>Models-Management</div>
                        </div>
                    </Link>

                    <Link to={"/admin/plans-management" } className='link'  id='/admin/plans-management-link'>
                        <div className={`nav-list-item  d-flex align-items-center ${path=="/admin/plans-management"&&'active'}`}>

                            {/* <AddCircleOutlineOutlinedIcon/> */}
                            <div to={"/admin/plans-management" } className='link nav-options ms-1'>Plans-Management</div>
                        </div>
                    </Link>


                </div>
            </div>
            </div>
        </>
    )
}

