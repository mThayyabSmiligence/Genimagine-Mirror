import React from 'react'

import '../../Css/TopUpCard.css'
import { useLocation } from 'react-router-dom'


function TopUpCard({activeTopUps, topUp, buyCredits, loggedIn}) {

     const location = useLocation()
    const handleTopUp = async(e) => {
        buyCredits(topUp.topup_package_id,null,e,'topup')
    }
  return (
    <div>
        {activeTopUps.includes(topUp.topup_package_id) ? (
            <div className="badge active">Active</div>
        ):(
            <div className="badge topup">Top Up</div>
        )}

        <div className="price text-start">₹{topUp.cost}</div>
        <div className="subtext text-start">One time payment</div>

        <div className="credit-pill">{topUp.credits} Credits</div>

        <button onClick={handleTopUp} className="select-btn fw-semibold"><span className='select-btn-top-up'>Top Up</span></button>
    </div>
  )
}

export default TopUpCard