import React from 'react'

export default function SubTopbar({setShowNavBar,showNavBar}) {
  return (
    <div className={`sub-top-bar ${showNavBar?"short":"big"} d-flex justify-content-between`} >

        <button className='button ' onClick={()=>setShowNavBar(!showNavBar)} >{showNavBar?<span class="material-symbols-outlined">left_panel_close</span>:<span class="material-symbols-outlined">left_panel_open</span>}</button>
        <div>Logo</div>
        <div> login</div>
    </div>
  )
}
