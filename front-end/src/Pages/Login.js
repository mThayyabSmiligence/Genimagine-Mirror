import React, { useContext, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import "../Css/Login.css"
import axios from 'axios'
import { auth, provider } from '../firebase'   //
import { signInWithPopup } from 'firebase/auth'
import useAuth from '../Hooks/useAuth'
import logo from '../images/genimagin_logo.png'
import google from '../images/pngwing.com.png'
import RefreshDataContext from '../Context/RefreshDataProvider'

export default function Login() {
    const {setLoggedIn}= useAuth()
    const navigate=useNavigate()
    const[password,setPassword]= useState("")
    const [email,setEmail]=useState("")
    const [passwordVisibility,setPasswordVisibility]=useState(false)
    const [isOtpLogin, setIsOtpLogin] = useState(false);  // State to toggle between password and OTP login
    const [otp, setOtp] = useState("");
    const [otpSent,setOtpSent] = useState(false); // State to toggle between

    const [succcess,setSucccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState(null)

    const [error,setError]=useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const { refreshCreditBalance,setRefreshCreditBalance} = useContext(RefreshDataContext)

    const handleSubmit=async(e)=>{
        if(!isOtpLogin){
            await handlePasswordLogin(e)
            return
        }
        if(!otpSent){
            await handleOtpLogin(e)
            return
        }
        await handleVerifyOtp(e);
    }

    const handlePasswordLogin = async(e)=> {
        e.preventDefault()
        setError(false)
        setSucccess(false) //
        try{
            const response =await axios.post("http://localhost:3001/api/v1/auth/login",
                {
                    password:password,
                    email:email
                },
                {
                    withCredentials: true,

                }
            )
            console.log(response)
            setLoggedIn(true)
            localStorage.setItem("user_data",JSON.stringify(response.data.user_data))
            localStorage.setItem("credit_balance",JSON.stringify(response.data.user_data.credits))
            navigate("/image-generation")
            
        }catch(err){
            console.error(err)
            setError(true)
            setErrorMessage(err?.response?.data?.message)
        }
    }

    const handleOtpLogin = async (e) => {
        e.preventDefault();
        setError(false)
        setSucccess(false) 
        try {
            // Send OTP to user's email
            const response = await axios.post("http://localhost:3001/api/v1/auth//email-otp-request",
                { email },
                { withCredentials: true }
            );
            
            setOtpSent(true);
            setSucccess(true)
            setSuccessMessage("OTP sent successfully");
        } catch (err) {
            console.error(err);
            setError(true)
            setErrorMessage(err.response.data.message)
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(false)
        setSucccess(false) 
        try{
            const response = await axios.post("http://localhost:3001/api/v1/auth//email-otp-verify",
                { email, otp },
                { withCredentials: true }
            );
            console.log(response);
            alert("Logged in successfully");
            setLoggedIn(true);
            localStorage.setItem("user_data", JSON.stringify(response.data.user_data));
            localStorage.setItem("credit_balance", JSON.stringify(response.data.user_data.credits));
            setRefreshCreditBalance(!refreshCreditBalance)
            navigate("/image-generation");
        }catch(err){
            setError(true)
            setErrorMessage(err.response.data.message)
        }
    }

    const handleGoogleSignIn = async () => {
        setError(false)
        setSucccess(false) 
        try{
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken(); // Get Firebase Token
            console.log("google sigin token:",idToken);
            console.log("User Info:", result.user);
            
            // Send token to backend for verification
            const response = await axios.post("http://localhost:3001/api/v1/auth/verify-google-token", 
                { token: idToken },  
                {
                    headers: {
                        "Authorization": `Bearer ${idToken}`, 
                        "Content-Type": "application/json",
                    },
                    withCredentials:true
                }
            ); 


            setLoggedIn(true)
            console.log("Response from Google API:", response.data);
            
           
            localStorage.setItem("user_data", JSON.stringify(response.data.user_data));
            localStorage.setItem("credit_balance", JSON.stringify(response.data.user_data.credits));
            
            navigate("/image-generation");
            
                    
        }catch(err){
            console.error("Error during sign-in");
            setError(true)
            setErrorMessage(err?.response?.data?.message)
        } 
    }

  return <>
        <div className='login d-flex flex-column justify-content-center align-items-center'>

                <img className='login-logo' src={logo} alt='genimagin'/>
            
            <div className='login-page br-10'>
                {
                    error&&
                    <div className='alert alert-danger'>{errorMessage}</div>
                }
                {
                    succcess&&
                    <div className='alert alert-success'>{successMessage}</div>
                }
                <div className='d-flex justify-content-between'>
                    <h3 className='text-start ms-2'>Sign-In</h3>
                    <div className='toggle-auth-method text-end'>
                        <p 
                            className='toggle-password' 
                            onClick={() => setIsOtpLogin(!isOtpLogin)}
                            style={{cursor: "pointer"}}
                        >
                            {isOtpLogin ? "Use Password Instead" : "Use OTP Instead"}
                        </p>
                    </div>
                </div>
                <form className="container login-form" onSubmit={(e) => handleSubmit(e)}>
                    <div className="mb-3 d-flex flex-column justify-content-start email-container">
                        <label htmlFor="InputEmail1" className="form-label ">Email</label>
                        <div className='email-input-container'>
                            <input type="email" placeholder='email' className="form-control email-input" id="InputEmail1" value={email} onChange={(e) => { setEmail(e.target.value) }} required />
                        </div>
                    </div> 
                    {isOtpLogin?
                        <div className="d-flex flex-column justify-content-start email-container">
                            <label htmlFor="exampleInputEmail1" className="form-label ">otp</label>
                            <div className='email-input-container'>
                                <input type="number" placeholder='enter otp' className="form-control email-input" id="exampleInputEmail1" disabled={!otpSent} value={otp} onChange={(e) => { setOtp(e.target.value) }} required/>
                            </div>
                        </div> 
                    :
                    <div className='password-container'>
                        <label htmlFor="exampleInputPassword1" className="form-label ">Password</label>
                        <div className='password-input-container d-flex align-items-center justify-content-center'>
                            <input type={passwordVisibility ? "text" : "password"} placeholder='password' className="form-control password-input" id="password-input" value={password} onChange={(e) => setPassword(e.target.value)} requierd/>
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

                    }


                    <div className='forgot-password-container text-end'>
                        <Link to={"/forgot-password"} className='forgot-password-button mb-4 '>{isOtpLogin? <span>Re-send otp</span>: "Forgot Password?" }</Link>
                    </div>
                    <button type="submit" className=" button dark-button w-100 br-100 mb-3">{otpSent?"login" :isOtpLogin? "Send otp": "Login"}</button>
                </form>
                    <div className='divider d-flex align-items-center  '>
                        <span className='divider-line flex-1'></span>
                        <p className='divider-or'>OR</p>
                        <span className='divider-line flex-1'></span>
                    </div>
                    <div className='google-sign-in mt-3 d-flex justify-content-between'> 
                        <button className='google-sign-in-button d-flex align-items-center justify-content-center gap-2 pb-1 px-3 br-100 w-100 button button-white mb-4' onClick={handleGoogleSignIn}>
                            <img className='google-sign-in-logo' src={google} alt='google'/>
                            <p className='m-0 flex-1'>signin with google</p>
                        </button>
                    </div>
                    <div className='divider d-flex align-items-center  '>
                        <span className='divider-line flex-1'></span>
                        <p className='divider-genimagin'>New to genimagin ?</p>
                        <span className='divider-line flex-1'></span>
                    </div>
                    <Link to="/register" className="link link-button button light-button w-100 br-100 mt-3" style={{"width":"100%"}}>Create account on Genimagin</Link>
                {/* <button onClick={(e)=>handelLogout(e)} className=" button dark-button">Logout</button> */}
            </div>
        </div>
    </>
}


// <div className='password-container'>
                        //     <label className="form-label">{isOtpLogin ? "Enter OTP" : "Password"}</label>
                        //         <div className='password-input-container d-flex align-items-center justify-content-center'>
                        //             <input 
                        //                 type={isOtpLogin ? "text" : passwordVisibility ? "text" : "password"} 
                        //                 placeholder={isOtpLogin ? "Enter OTP" : "Enter Password"} 
                        //                 className="form-control password-input" 
                        //                 value={isOtpLogin ? otp : password} 
                        //                 onChange={(e) => isOtpLogin ? setOtp(e.target.value) : setPassword(e.target.value)} 
                                        
                        //                 />
                        //             {!isOtpLogin && (
                        //                 <div className='password-visibility-toggle' onClick={() => setPasswordVisibility(!passwordVisibility)}>
                        //                     <span className="visibility-icon material-symbols-outlined">
                        //                         visibility
                        //                     </span>
                        //                     {passwordVisibility && <span className='visibility-icon-cross'></span>}
                        //                 </div>
                        //             )}
                        //         </div>
                        // </div>