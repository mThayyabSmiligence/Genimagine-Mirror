import React, { useContext, useEffect, useState } from 'react'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import "../../Css/SubTopBar.css"
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add';

export default function CreditBalance() {
    const [creditBalance,setCreditBalance]=useState(0)
    const { refreshCreditBalance} = useContext(RefreshDataContext)

    useEffect(()=>{
        setCreditBalance(localStorage.getItem('credit_balance')
        )
    },[refreshCreditBalance])
  return (
    <div className='credit-balance-container d-flex align-items-center ' title='credit points' >
        <span className='credit-balance-coin' ><p>C</p></span>
        <p className='credit-balance-value mx-2'>{creditBalance||1000}</p>
        <Link to="/credit-purchase" className='link'><span className='plus-symbol'><AddIcon className='icon'/></span></Link>
    </div>
  )
}
