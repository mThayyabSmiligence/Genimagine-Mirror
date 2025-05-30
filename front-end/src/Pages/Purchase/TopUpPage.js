import React, { useEffect, useState } from 'react';
import { axiosNoAUth, axiosPrivate } from '../../API\'s/axios';
import '../../Css/TopUpPage.css'

export default function TopUpPage() {
    const [topUpList, setTopUpList] = useState([]);
    const [activeTopUps, setActiveTopUps] = useState([]);

    useEffect(() => {
        handleGetTopUp();
    },[]);

    const handleGetTopUp = async () => {
        try {
            const response = await axiosPrivate.get('/get-active-topUp');
            console.log("top up list data", response.data);
            setTopUpList(response.data.data);
        } catch (error) {
            console.error("error getting top up data",error);
        }
    };

   const fetchUserActiveTopUps = async () => {
        try {
            const response = await axiosPrivate.get('/user/active-topups');
            const activePlanIds = response.data.data.map(item => item.plan_id);
            setActiveTopUps(activePlanIds);
        } catch (error) {
            console.error("Error getting user's active top-ups:", error);
        }
    };

    return (
        <div className="top-up-container p-4 mt-5">
            <div className="card-container">
                {topUpList.map((topUp, index) => (
                    <div key={index} className="card top-up-buy-card mb-2 ms-4">
                        {activeTopUps.includes(topUp.topup_package_id) ? (
                            <div className="badge active">Active</div>
                        ): (
                            <div className="badge topup">Top Up</div>
                        )}

                        <div className="price text-start">₹{topUp.cost}</div>
                        <div className="subtext text-start">One time payment</div>

                        <div className="credit-pill">{topUp.credits} Credits</div>

                        <button className="select-btn fw-semibold"><span className='select-btn-top-up'>Top Up</span></button>
                    </div>
                ))}
            </div>
        </div>
    );
}
