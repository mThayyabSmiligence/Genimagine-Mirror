import React, { useContext, useEffect, useState } from 'react'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import "../../Css/SubTopBar.css"
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add';
import socket from '../../utils/socket';

export default function CreditBalance() {
    const [creditBalance,setCreditBalance]=useState(0)
    const { refreshCreditBalance} = useContext(RefreshDataContext)

    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const userId = userData.user_id;

    useEffect(()=>{
        setCreditBalance(localStorage.getItem('credit_balance')
        )
    },[refreshCreditBalance])

    useEffect(() => {
        if (!socket || !userId) return;

        socket.emit("joinUserRoom", userId);

        socket.on("creditsUpdated", (data) => {
            setCreditBalance(data.credits_remaining);
            localStorage.setItem('credit_balance', data.credits_remaining); // optional: keep storage updated
        });

        return () => {
            socket.off("creditsUpdated");
        };
    }, [userId]);

  return (
    <div className='credit-balance-container d-flex align-items-center ' title='credit points' >
        <span className='credit-balance-coin' ><p>C</p></span>
        <p className='credit-balance-value mx-2'>{creditBalance||0}</p>
        <Link to="/credit-purchase" className='link'><span className='plus-symbol'><AddIcon className='icon'/></span></Link>
    </div>
  )
}
