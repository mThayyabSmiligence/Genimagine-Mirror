import React, { useContext, useEffect, useState } from 'react'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import "../../Css/SubTopBar.css"
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add';
import socket from '../../utils/socket';
import { useId } from 'react';
import { axiosPrivate } from '../../API\'s/axios';

export default function CreditBalance() {
    const [creditBalance,setCreditBalance]=useState(0)
    const { refreshCreditBalance, setRefreshCreditBalance} = useContext(RefreshDataContext)

    // const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    // const userId = userData.user_id;
    

    // useEffect(()=>{
    //     setCreditBalance(localStorage.getItem('credit_balance')
    //     )
    // },[refreshCreditBalance])

    useEffect(() => {
    console.log("succes in web socket")
    socket.on("scheduledUpdate", (data) => {
        if (data?.newCredits !== undefined) {
        setCreditBalance(data.newCredits);
        localStorage.setItem('credit_balance', data.newCredits);
        }
    });

    return () => socket.off("scheduledUpdate");
    }, []);



    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const response = await axiosPrivate.get('/user-data');
                const credits = response.data.data.credits || 0;
                setCreditBalance(credits);
                localStorage.setItem('credit_balance', credits);
            } catch (error) {
                console.error("Error getting user data", error);
            }
        };

        fetchCredits();
    }, [refreshCreditBalance]);
   

  return (
    <div className='credit-balance-container d-flex align-items-center ' title='credit points' >
        <span className='credit-balance-coin' ><p>C</p></span>
        <p className='credit-balance-value mx-2'>{creditBalance||0}</p>
        <Link to="/credit-purchase" className='link'><span className='plus-symbol'><AddIcon className='icon'/></span></Link>
    </div>
  )
}
