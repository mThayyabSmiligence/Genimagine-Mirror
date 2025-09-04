
import React, { useEffect, useState } from 'react'
import logo from '../../images/genimagin_logo.png'
import { axiosPrivate } from '../../API\'s/axios';
import { useNavigate } from 'react-router-dom';




const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

function ChangePassword() {
    

    const [next,setNext] = useState(false);
    
    const[password,setPassword]=useState()
    const[confirmPassword,setConfirmPassword]=useState()
    const [currentPassword,setCurrentPassword]=useState()

    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(false);

    const [currentPasswordVisibility, setCurrentPasswordVisibility] = useState(false);

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

    const [loading,setLoading] = useState(false)

    const Navigate = useNavigate();

    
    const spinnerStyle = {
        width: '20px',
        height: '20px',
        border: '4px solid #ccc',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      };

    // useEffect(() =>{
    //     if(success){
    //         setTimeout(()=>{
    //             Navigate('/u/profile', {replace: true})
    //         },2500)
    //     }
    // },[success])

    useEffect(() => {
    if (success) {
        const userData = JSON.parse(localStorage.getItem("user_data"));
        const role = userData?.role;

        setTimeout(() => {
        if (role === "moderator") {
            Navigate('/moderator/profile-page', { replace: true });
        } else {
            Navigate('/u/profile', { replace: true });
        }
        }, 2500);
    }
    }, [success]);


    const handelSubmit=async(e)=>{
        e.preventDefault()
        setError(false)
        setSuccess(false)
        setLoading(true)
        try{
            const response = await axiosPrivate.post(`/change-password`, {
                currentPassword:currentPassword,
                newPassword:password
            });

            setSuccess(true)
            setSuccessMessage(response.data.message)
        }catch(err){
            setError(true)
            setErrorMeaage(err?.response?.data?.message)
        }finally{
            setLoading(false)
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
                            <h3 className='text-start ms-2'>Change Password</h3>
                        </div>
                        <form className="container login-form" onSubmit={(e) => handelSubmit(e)}>
                           
                            {/* password */}
                            <div className='password-container mb-3'>
                                <label htmlFor="current-password" className="d-flex form-label ">
                                    Current Passwod :
                                </label>
                                
                                <div className='password-input-container d-flex align-items-center justify-content-center'>
                                    <input 
                                        type={currentPasswordVisibility? "text" : "password"} 
                                        placeholder='Current password' 
                                        className="form-control password-input" 
                                        id="current-password" 
                                        value={currentPassword} 
                                        onChange={(e) => 
                                        setCurrentPassword(e.target.value)}  
                                        required/>
                                    <div    type='none' 
                                            onClick={(e) =>{ 
                                                
                                                setCurrentPasswordVisibility(!currentPasswordVisibility);
                                                
                                            }} 
                                            className='password-visibility-toggle'>
                                        
                                        <span className="visibility-icon material-symbols-outlined">
                                            visibility
                                        </span>
                                        {
                                            currentPasswordVisibility && <span className='visibility-icon-cross'></span>
                                        }
                                    
                                    </div>
                                </div>
                            </div>

                            
                            <div className='password-container mb-3'>
                                <label htmlFor="new-password" className="d-flex form-label ">
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
                                        placeholder='New password' 
                                        className="form-control password-input" 
                                        id="new-password" 
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
                                <label htmlFor="confirm-password" className="form-label d-flex">
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
                                    <input type={confirmPasswordVisibility ? "text" : "password"} placeholder='Confirm password' className="form-control password-input" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
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
                            {
                                loading?
                                <button className=" button dark-button w-100 br-100 mb-3 d-flex justify-content-center align-items-center">
                                    <div style={spinnerStyle}></div>
                                    <style>{`
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                    `}</style>
                                </button>
                                :
                                <button disabled={ !currentPassword ||  !passwordValidity || !pwdMatch ? true : false} type="submit" className=" button dark-button w-100 br-100 mb-3" id='change-password-submit-button'>Change Password</button>
                            }
                            
                        </form>
                    </div>
                </div>
            </>
  )
}

export default ChangePassword;