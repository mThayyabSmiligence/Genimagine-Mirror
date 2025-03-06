import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CryptoJS from "crypto-js";
import logo from '../images/genimagin_logo.png'
import { axiosAuth } from '../API\'s/axios';



const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
export default function ResetPassword() {

    const secretKey="031ebf4c74af22bb6ec5eeaf8efa4d99acd3b9d4d7463fd07a8bc2c91f7bab7e"
    const {encrypted_email,reset_token} =useParams()
  

    const email=decryptEmail(encrypted_email)


    const [next,setNext] = useState(false);
    
    const[password,setPassword]=useState()
    const[confirmPassword,setConfirmPassword]=useState()

    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(false);


    const [passwordValidity, setPasswordValidity] = useState(false)
    const [confirmPasswordValidity, setConfirmPasswordValidity] = useState(false)

    const [passwordFocus, setPasswordFocus] = useState(false)
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false)
        
    const [pwdMatch,setPwdMatch] = useState(false)
    
    useEffect(() => {
        setPasswordValidity(PWD_REGEX.test(password));
        setPwdMatch(password === confirmPassword);
    }, [password, confirmPassword])


    const [error,setError]=useState(false)
    const [errorMessage,setErrorMeaage]=useState(null)

    const [success,setSuccess]=useState(false)
    const [successMessage,setSuccessMessage]=useState(null)

    function decryptEmail(encryptedEmail) {
        const decryptedBytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedEmail), secretKey);
        return decryptedBytes.toString(CryptoJS.enc.Utf8);
    }

    const handelSubmit=async(e)=>{
        e.preventDefault()
        setError(false)
        setSuccess(false)

        try{
            const response = await axiosAuth.post(`/reset-password/${reset_token}`, {
                new_password:password
            });

            setSuccess(true)
            setSuccessMessage(response.data.message)
        }catch(err){
            setError(true)
            setErrorMeaage(err?.response?.data?.message)
        }
    }

  return (
     <>
                <div className='login d-flex flex-column justify-content-center align-items-center'>
        
                        <img className='login-logo' src={logo} alt='genimagin'/>
                    
                    <div className='login-page br-10'>
                        {
                            error &&
                            <div className='alert alert-danger'>{errorMessage}</div>
                        }
                        {
                            success &&
                            <div className='alert alert-success'>{successMessage}</div>
                        }
                        <div>
                            <h3 className='text-start ms-2'>Reset Password</h3>
                        </div>
                        <form className="container login-form" onSubmit={(e) => handelSubmit(e)}>
                            
                            
                            
                           
                            {/* password */}
                            <div className='password-container'>
                                <label htmlFor="exampleInputPassword1" className="d-flex form-label ">
                                    New Password :
                                    {
                                        passwordValidity?
                                        password&&
                                        <span class="material-symbols-outlined">
                                         check
                                        </span>
                                        :
                                        password&&
                                        <span class="material-symbols-outlined">
                                            close
                                        </span>
                                    }
                                    
                                    </label>
                                <div className='password-input-container d-flex align-items-center justify-content-center'>
                                    <input 
                                        type={passwordVisibility ? "text" : "password"} 
                                        placeholder='password' 
                                        className="form-control password-input" 
                                        id="password-input" 
                                        value={password} 
                                        onChange={(e) => 
                                        setPassword(e.target.value)}  
                                        onFocus={() => setPasswordFocus(true)}
                                        onBlur={() => setPasswordFocus(false)}
                                        required/>
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
                            <p id="pwdnote" className={passwordFocus && !passwordValidity ? "instructions" : "offscreen"}>
                                        
                                8 to 24 characters.<br />
                                Must include uppercase and lowercase letters, a number and a special character.<br />
                                Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                            </p>
                            {/* confirm password */}
                            <div className='password-container mb-3'>
                                <label htmlFor="exampleInputPassword1" className="form-label d-flex">
                                    Confirm New Password :
                                    {
                                        pwdMatch?
                                        confirmPassword&&
    
                                        <span class="material-symbols-outlined">
                                         check
                                        </span>
                                        :
                                        confirmPassword&&
                                        <span class="material-symbols-outlined">
                                            close
                                        </span>
                                       
                                    }
                                    </label>
                                <div className='password-input-container d-flex align-items-center justify-content-center'>
                                    <input type={confirmPasswordVisibility ? "text" : "password"} placeholder='confirm password' className="form-control password-input" id="password-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
                                    <div    type='none' 
                                            onClick={(e) =>{ 
                                                
                                                setConfirmPasswordVisibility(!confirmPasswordVisibility);
                                                
                                            }} 
                                            className='password-visibility-toggle'>
                                        
                                        <span className="visibility-icon material-symbols-outlined">
                                            visibility
                                        </span>
                                        {
                                            confirmPasswordVisibility && <span className='visibility-icon-cross'></span>
                                        }
                                    
                                    </div>
                                </div>
                            </div>
                            <button disabled={ !passwordValidity || !pwdMatch      ? true : false} type="submit" className=" button dark-button w-100 br-100 mb-3">Reset</button>
                            
                        </form>
                    </div>
                </div>
            </>
  )
}
