import React, { useEffect, useState } from 'react'
import logo from '../images/genimagin_logo.png'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MathCaptcha from "../Components/Captcha/MathCaptcha";
import { axiosAuth } from '../API\'s/axios';

// Add icons to the library
library.add(faCheck, faTimes, faInfoCircle);


const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function RegisterUser() {

    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

    const handleCaptchaVerify = (status) => {
      setIsCaptchaVerified(status);
    };
  
    // const handleCaptcha = (e) => {
    //   e.preventDefault();
    //   if (!isCaptchaVerified) {
    //     alert("Please solve the CAPTCHA correctly.");
    //     return;
    //   }
    //   alert("Registration successful!");
    // };

console.log("faInfoCircle:", faInfoCircle);
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] =useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(false);


    const [next,setNext] = useState(false);

    const [errorCode, setErrorCode] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null);
    const [error, setError] = useState(null);

    const [usernameValidity, setUsernameValidity] = useState(false)
    const [emailValidity, setEmailValidity] = useState(false)
    const [passwordValidity, setPasswordValidity] = useState(false)
    const [confirmPasswordValidity, setConfirmPasswordValidity] = useState(false)
    const [dobValidity, setDobValidity] = useState(true)

    const [usernameFocus, setUsernameFocus] = useState(false)
    const [passwordFocus, setPasswordFocus] = useState(false)
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false)
    
    const [pwdMatch,setPwdMatch] = useState(false)

    const[loading,setLoading] = useState(false)

    const spinnerStyle = {
        width: '20px',
        height: '20px',
        border: '4px solid #ccc',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      };


    useEffect(() => {
        setPasswordValidity(PWD_REGEX.test(password));
        setPwdMatch(password === confirmPassword);
    }, [password, confirmPassword])

    useEffect(()=>{
        setEmailValidity(EMAIL_REGEX.test(email));
    },[email])

    useEffect(() => {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())
            .toISOString()
            .split("T")[0]; // Setting max date as today - 5 years

        const minDate = new Date(1900, 0, 1).toISOString().split("T")[0]; // Set a reasonable minimum date

        document.getElementById("dob").setAttribute("max", maxDate);
        document.getElementById("dob").setAttribute("min", minDate);
    }, []);

    useEffect(() => {
        if (!dob) return; // Prevent running on the initial render when dob is empty

        const today = new Date();
        const maxDate = new Date(today.setFullYear(today.getFullYear() - 5)) // 5 years ago
            .toISOString()
            .split("T")[0];

        const dobDate = new Date(dob);

        if (dobDate > new Date(maxDate)) {
            setDobValidity(false)
        }
        else{
            setDobValidity(true)
        }
    }, [dob]);


    useEffect(()=>{
        setUsernameValidity(USER_REGEX.test(username));
    },[username])

    useEffect(() => {
        if (next) {
            const timer = setTimeout(() => {
                setNext(false);
            }, 5000); // 3 seconds
    
            return () => clearTimeout(timer);
        }
    }, [next]);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNext(false)
        setError(false)

        if (!USER_REGEX.test(username)) {
            if (username.length < 4) {
                setError("Username must be at least 4 characters long.");
            } else if (username.length > 24) {
                setError("Username must not exceed 24 characters.");
            } else if (!/^[A-Za-z]/.test(username)) {
                setError("Username must start with a letter.");
            } else {
                setError("Username can only contain letters, numbers, hyphens, and underscores.");
            }
            return;
        }

        if (!isCaptchaVerified) {
            alert("Please solve the CAPTCHA correctly.");
            return;
        }

        try {
            setLoading(true);
            const response = await axiosAuth.post('/register', 
                {
                    "username": username,
                    "password": password,
                    "confirmPassword": confirmPassword,
                    "dob": dob,
                    "email": email
                });
            console.log(response);
            setNext(true);
            setError(false)      
            resetForm();
        } catch (error) {
            setError(error.message);
            console.log(error)
            setErrorMessage(error?.response?.data?.message)
            setErrorCode(error?.response?.status)
        }
        finally{
            setLoading(false);
        }
    };

    const resetForm = () => {
        setUserName('');
        setEmail('');
        setDob('');
        setPassword('');
        setConfirmPassword('');
        setIsCaptchaVerified(false);
        setPasswordVisibility(false);
        setConfirmPasswordVisibility(false);
      };
  return (
    <>
            <div className='login d-flex flex-column justify-content-center align-items-center'>
    
                    <img className='login-logo' src={logo} alt='genimagin'/>
                
                <div className='login-page br-10'>
                    {error ? (
                        <div className='alert alert-danger'>{errorMessage}</div>
                    ) : next ? (
                        <div className='alert alert-success'>Link has been sent to your email to Verify the Email.</div>
                    ) : null}


                    {/* {
                        error &&
                        <div className='alert alert-danger'>{errorMessage}</div>
                    }
                    {
                        next &&
                        <div className='alert alert-success'>Link has been sent to your email to Verify the Email.</div>
                    } */}

                    
                    <div>
                        <h3 className='text-start ms-2'>Create Account</h3>
                    </div>
                    <form className="container login-form" onSubmit={(e) => handleSubmit(e)}>
                        {/* username */}
                        <div className="mb-2 d-flex flex-column justify-content-start email-container">
                            <label htmlFor="exampleInputEmail1" className="form-label mb-1 d-flex">
                                User Name :
                                {
                                    usernameValidity?
                                    username&&
                                    <span class="material-symbols-outlined">
                                     check
                                    </span>
                                    :
                                    username&&
                                    <span class="material-symbols-outlined">
                                        close
                                    </span>
                                }
                                </label>
                            <div className='email-input-container'>
                                <input 
                                    type="text" 
                                    placeholder='User Name' 
                                    className="form-control email-input" 
                                    id="exampleInputEmail1" 
                                    value={username} 
                                    onChange={(e) => { setUserName(e.target.value) }} 
                                    onFocus={() => setUsernameFocus(true)}
                                    onBlur={() => setUsernameFocus(false)}
                                    autoComplete='off'
                                    required/>
                            </div>
                            <p id="uidnote" className={usernameFocus && username && !usernameValidity ? "instructions" : "offscreen"}>
                            

                            4 to 24 characters.<br />
                            Must begin with a letter.<br />
                            Letters, numbers, underscores, hyphens allowed.
                            </p>
                        </div>
                        {/* email */}
                        <div className="mb-2 d-flex flex-column justify-content-start email-container">
                        <label htmlFor="exampleInputEmail1" className="form-label mb-1 d-flex">
                                Email :
                                {
                                    emailValidity?
                                    email&&
                                    <span class="material-symbols-outlined">
                                     check
                                    </span>
                                    :
                                    email&&
                                    <span class="material-symbols-outlined">
                                        close
                                    </span>
                                }
                                </label>
                            <div className='email-input-container'>
                                <input 
                                    type="email" 
                                    placeholder='email' 
                                    className="form-control 
                                    email-input" 
                                    id="exampleInputEmail1" 
                                    value={email} 
                                    onChange={(e) => { setEmail(e.target.value) }} 
                                    autoComplete='off'
                                    required 
                                    />
                            </div>
                        </div>
                        {/* age */}
                        <div className="mb-2 d-flex flex-column justify-content-start email-container">
                            <label htmlFor="exampleInputEmail1" className="form-label d-flex">Date of Birth:
                            {
                                    dobValidity?
                                    dob&&
                                    <span class="material-symbols-outlined">
                                     check
                                    </span>
                                    :
                                    dob&&
                                    <span class="material-symbols-outlined">
                                        close
                                    </span>
                                }
                            </label>
                            <div className='email-input-container'>
                                <input 
                                    type="date" 
                                    placeholder='(DD/MM/YYYY)' 
                                    className="form-control 
                                    email-input" 
                                    id="dob" 
                                    value={dob} 
                                    onChange={(e) => { setDob(e.target.value) }} 
                                    autoComplete='off'
                                    required/>
                            </div>
                        </div>
                        <p id="pwdnote" className={ !dobValidity ? "instructions" : "offscreen"}>
                                    
                            user must be at least5 years old
                        </p>
                        {/* password */}
                        <div className='password-container'>
                            <label htmlFor="exampleInputPassword1" className="d-flex form-label ">
                                Password :
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
                                Confirm Password :
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
                        <div className='d-flex justify-content-center align-items-center'>

                        {
                            isCaptchaVerified?<div className='button-wh  success-button-wh   d-flex align-items-center w-ft '><span className="material-symbols-outlined me-2"> task_alt</span>Verification Success</div>:
                            <MathCaptcha onVerify={handleCaptchaVerify}/>
                        }
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
                        <button disabled={!usernameValidity || !emailValidity || !passwordValidity || !dobValidity || !pwdMatch || !isCaptchaVerified     ? true : false} type="submit" className=" button-wh dark-button-wh w-100 br-100 mb-3">Create</button>
                        }
                        
                    </form>
                </div>
            </div>
        </>
  )
}
