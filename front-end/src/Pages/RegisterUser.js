import React, { useEffect, useState } from 'react'
import logo from '../images/genimagin_logo.png'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Add icons to the library
library.add(faCheck, faTimes, faInfoCircle);


const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function RegisterUser() {

console.log("faInfoCircle:", faInfoCircle);
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] =useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(false);


    const [next,setNext] = useState(false);
    const [error, setError] = useState(null);

    const [usernameValidity, setUsernameValidity] = useState(false)
    const [emailValidity, setEmailValidity] = useState(false)
    const [passwordValidity, setPasswordValidity] = useState(false)
    const [confirmPasswordValidity, setConfirmPasswordValidity] = useState(false)

    const [usernameFocus, setUsernameFocus] = useState(false)
    const [passwordFocus, setPasswordFocus] = useState(false)
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false)
    
    const [pwdMatch,setPwdMatch] = useState(false)

    useEffect(() => {
        setPasswordValidity(PWD_REGEX.test(password));
        setPwdMatch(password === confirmPassword);
    }, [password, confirmPassword])

    useEffect(()=>{
        setEmailValidity(EMAIL_REGEX.test(email));
    },[email])

    useEffect(()=>{
        setUsernameValidity(USER_REGEX.test(username));
    },[username])
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/v1/auth/register', {
                email,
                password
            });
            console.log(response);
        } catch (error) {
            setError(error.message);
        }
    };
  return (
    <>
            <div className='login d-flex flex-column justify-content-center align-items-center'>
    
                    <img className='login-logo' src={logo} alt='genimagin'/>
                
                <div className='login-page br-10'>
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
                            <label htmlFor="exampleInputEmail1" className="form-label ">Age:</label>
                            <div className='email-input-container'>
                                <input 
                                    type="number" 
                                    placeholder='age' 
                                    className="form-control 
                                    email-input" 
                                    id="exampleInputEmail1" 
                                    value={age} 
                                    onChange={(e) => { setAge(e.target.value) }} 
                                    autoComplete='off'
                                    required/>
                            </div>
                        </div>
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
                        <button disabled={!usernameValidity || !emailValidity || !passwordValidity || !pwdMatch ? true : false} type="submit" className=" button dark-button w-100 br-100 mb-3">Create</button>
                        
                    </form>
                </div>
            </div>
        </>
  )
}
