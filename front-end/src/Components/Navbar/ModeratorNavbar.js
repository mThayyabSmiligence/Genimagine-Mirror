import React from 'react'

function ModeratorNavbar() {
    return (
        <>
            <div className='side-nav-middle-section p-relative h-auto moderator-navbar-section' style={{ height:`${height-150}px`} }>

                <div className='sub-mid-section moderator-nav-sub-section'>

                    <Link to={"/explore" } className='link mb-1'  id='explore-link'>
                        <div className={`nav-list-item d-flex align-items-center ${path=="/explore"&&'active'}`}>

                            <ExploreOutlinedIcon/>
                            <div to={"/explore" } className='link nav-options ms-1'>Explore</div>
                        </div>
                    </Link>
                    <Link to={"/credit-purchase" } className='link mb-1' >
                        <div className={`nav-list-item d-flex align-items-center ${path=="/credit-purchase"&&'active'}`}>
                            <ShoppingCartOutlinedIcon/>
                            <div to={"/credit-purchase" } className='link nav-options ms-1'>Buy Credits</div>
                        </div>
                    </Link>

                    <Link to={"/image-generation" } className='link'  id='new-chat-link'>
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