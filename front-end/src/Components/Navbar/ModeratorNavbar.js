import React from 'react'

function ModeratorNavbar() {
    return (
        <>
            <div className='side-nav-middle-section p-relative h-auto moderator-navbar-section' style={{ height:`${height-150}px`} }>

                <div className='sub-mid-section moderator-nav-sub-section'>

                    <Link to={"/user-management" } className='link mb-1'  id='user-management-link'>
                        <div className={`nav-list-item d-flex align-items-center ${path=="/explore"&&'active'}`}>

                            <ExploreOutlinedIcon/>
                            <div to={"/user-management" } className='link nav-options ms-1'>User Management</div>
                        </div>
                    </Link>
                    <Link to={"/" } className='link mb-1' >
                        <div className={`nav-list-item d-flex align-items-center ${path=="/credit-purchase"&&'active'}`}>
                            <ShoppingCartOutlinedIcon/>
                            <div to={"/credit-purchase" } className='link nav-options ms-1'>Buy Credits</div>
                        </div>
                    </Link>

                    <Link to={"/" } className='link'  id='new-chat-link'>
                        <div className={`nav-list-item  d-flex align-items-center ${path=="/image-generation"&&'active'}`}>

                            <AddCircleOutlineOutlinedIcon/>
                            <div to={"/image-generation" } className='link nav-options ms-1'>{loggedIn?'New Chat':'Generate'}</div>
                        </div>
                    </Link>

                </div>
            </div>
        </>
    )
}

export default ModeratorNavbar