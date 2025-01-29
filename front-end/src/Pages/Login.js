import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import "../Css/Login.css"
import axios from 'axios'

export default function Login() {
    const[password,setPassword]= useState("")
    const [email,setEmail]=useState("")
    const [passwordVisibility,setPasswordVisibility]=useState(false)

    const handleSubmit=async(e)=>{
        e.preventDefault()
        try{
            const response =await axios.post("http://localhost:3001/api/v1/user/login",
                {
                    password:password,
                    email:email
                },
                {
                    withCredentials: true,

                }
            )
            console.log(response)
        }catch(err){
            console.error(err)
        }
    }
    const handelLogout=async(e)=>{
        e.preventDefault()
        try{
            const response =await axios.get("http://localhost:3001/api/v1/user/logout",
                {
                    withCredentials: true,
                }
            )
            console.log(response)
        }catch(err){
            console.error(err)
        }
    }
  return (
    <div className='login-page'>
        <form clasame="login-form " onSubmit={(e) => handleSubmit(e)}>
            <div className="mb-3 d-flex flex-column justify-content-start email-container">
                <label htmlFor="exampleInputEmail1" className="form-label ">Email</label>
                <div className='email-input-container'>
                    <input type="email" placeholder='email' className="form-control email-input" id="exampleInputEmail1" value={email} onChange={(e) => { setEmail(e.target.value) }} />
                </div>
            </div>
            <div className='password-container'>
                <label htmlFor="exampleInputPassword1" className="form-label ">Password</label>
                <div className='password-input-container d-flex align-items-center justify-content-center'>
                    <input type={passwordVisibility ? "text" : "password"} placeholder='password' className="form-control password-input" id="password-input" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <div    type='none' 
                            onClick={(e) =>{ 
                                
                                setPasswordVisibility(!passwordVisibility);
                                
                            }} 
                            className='password-visibility-toggle'>
                        
                        <span className="visibility-icon material-symbols-outlined">
                            visibility
                        </span>
                        {
                            passwordVisibility && <span className='visibility-icon-cross'></span>
                        }
                       
                    </div>
                </div>
            </div>
            <div className='forgot-password-container text-end'>
                <button className='forgot-password-button mb-4 '>Forgot Password?</button>
            </div>
            <button type="submit" className=" button dark-button">Login</button>
            
        </form>
        <button onClick={(e)=>handelLogout(e)} className=" button dark-button">Logout</button>
    </div>
  )
}
