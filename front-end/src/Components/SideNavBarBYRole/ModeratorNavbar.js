import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

export default function ModeratorNavbar() {
    const location = useLocation()
    const path = location.pathname;
    const [height, setHeight] = useState(window.innerHeight);
    return (
        <>
            <div className='side-nav-middle-section p-relative h-auto moderator-navbar-section' style={{ height:`${height-150}px`} }>

                <div className='sub-mid-section moderator-nav-sub-section'>

                    

                    <Link to={"/moderator/dashboard" } className='link mb-1'  id='moderator-dashboard-link'>
                        <div className={`nav-list-item d-flex align-items-center ${path=="/moderator/dashboard"&&'active'}`}>

                            {/* <ExploreOutlinedIcon/> */}
                            <div to={"/moderator/dashboard" } className='link nav-options ms-1'>Dashboard</div>
                        </div>
                    </Link>
                    <Link to={"/managements" } className='link mb-1' id='managements-link'>
                        <div className={`nav-list-item d-flex align-items-center ${path=="/managements"&&'active'}`}>
                            {/* <ShoppingCartOutlinedIcon/> */}
                            <div to={"/managements" } className='link nav-options ms-1'>Managements</div>
                        </div>
                    </Link>

                    <Link to={"/report" } className='link'  id='report-link'>
                        <div className={`nav-list-item  d-flex align-items-center ${path=="/report"&&'active'}`}>

                            {/* <AddCircleOutlineOutlinedIcon/> */}
                            <div to={"/report" } className='link nav-options ms-1'>Reports</div>
                        </div>
                    </Link>

                </div>
            </div>
        </>
    )
}

