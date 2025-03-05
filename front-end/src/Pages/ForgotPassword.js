import React, { use, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../images/genimagin_logo.png'
import axios from 'axios'
import { axiosAuth } from '../API\'s/axios'

export default function ForgotPassword() {

    const [email,setEmail]= useState(null)

    const [error,setError]=useState(false)
    const [errorMessage,setErrorMeaage]=useState(null)

    const [success,setSuccess]=useState(false)
    const [successMessage,setSuccessMessage]=useState(null)


    const handleSubmit=async(e)=>{
        e.preventDefault()
        setError(false)
        setSuccess(false)

        try{
            const response = await axiosAuth.post('/forgot-password', {
                email:email
            });

            setSuccess(true)
            setSuccessMessage('Check your email for password reset link')
        }catch(err){
            setError(true)
            setErrorMeaage(err?.response?.data?.message)
        }
    }


  return (<>
    <div className='login d-flex flex-column justify-content-center align-items-center'>

            <img className='login-logo' src={logo} alt='genimagin'/>
        
        <div className='login-page br-10'>
            {
                error&&
                <div className='alert alert-danger'>{errorMessage}</div>
            }
            {
                success&&
                <div className='alert alert-success'>{successMessage}</div>
            }
            <div className='d-flex justify-content-between'>
                <h3 className='text-start ms-2'>Forgot Password</h3>
            </div>
            <p>link to reset the passwword will be sent your email</p>
            <form className="container login-form" onSubmit={(e) => handleSubmit(e)}>
                <div className="mb-3 d-flex flex-column justify-content-start email-container">
                    <label htmlFor="exampleInputEmail1" className="form-label ">Email</label>
                    <div className='email-input-container'>
                        <input type="email" placeholder='Enter Email' className="form-control email-input" id="exampleInputEmail1" value={email} onChange={(e) => { setEmail(e.target.value) }} />
                    </div>
                </div> 
                
                <button type="submit" className=" button dark-button w-100 br-100 mb-3">Send Link</button>
                
                
            </form>
            {/* <button onClick={(e)=>handelLogout(e)} className=" button dark-button">Logout</button> */}
        </div>
    </div>
</>
  )
}
