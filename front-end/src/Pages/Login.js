import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import "../Css/Login.css"
import axios from 'axios'
import { auth, provider } from '../firebase'   //
import { signInWithPopup } from 'firebase/auth'
import useAuth from '../Hooks/useAuth'
import logo from '../images/genimagin_logo.png'
import google from '../images/pngwing.com.png'
import RefreshDataContext from '../Context/RefreshDataProvider'
import AuthContext from '../Context/AuthProvider'
import { axiosAuth } from '../API\'s/axios'
import OtpInput from 'react-otp-input';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

export default function Login() {

    console.log("base url",process.env.REACT_APP_API_URL)

    const {loggedIn}= useContext(AuthContext);
    const {setLoggedIn}= useAuth()
    const { refreshCreditBalance,setRefreshCreditBalance} = useContext(RefreshDataContext)
    const navigate=useNavigate()
    const location=useLocation()

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

    const [loading,setLoading] = useState(false)
    


    
    useEffect(()=>{})

    const navigateGuest = () => {
        if (loggedIn) { 
            const lastVisitedPage = localStorage.getItem("lastVisitedPage");
            if (lastVisitedPage) {
              localStorage.removeItem("lastVisitedPage"); // Clear stored page after redirection
              navigate(lastVisitedPage);
            } else {
              navigate("/image-generation"); // Default page after login
            }
          }
    }

    const spinnerStyle = {
        width: '20px',
        height: '20px',
        border: '4px solid #ccc',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      };

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
        setLoading(true)
        try{
            const response =await axiosAuth.post("/login",
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
            const redirectTo= location?.state?.from?.pathname || "/image-generation"
            console.log(redirectTo)
            navigate(redirectTo,{replace:true})
            
        }catch(err){
            console.error(err)
            setError(true)
            setErrorMessage(err?.response?.data?.message)
        }finally{
            setLoading(false)
        }
    }

    const handleOtpLogin = async (e) => {
        e.preventDefault();
        setError(false)
        setSucccess(false) 
        setLoading(true)
        try {
            // Send OTP to user's email
            const response = await axiosAuth.post("/email-otp-request",
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
        }finally{
            setLoading(false)
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(false)
        setSucccess(false) 
        setLoading(true)
        try{
            const response = await axiosAuth.post("/email-otp-verify",
                { email, otp },
                { withCredentials: true }
            );
            console.log(response);
            setLoggedIn(true);
            localStorage.setItem("user_data", JSON.stringify(response.data.user_data));
            localStorage.setItem("credit_balance", JSON.stringify(response.data.user_data.credits));
            setRefreshCreditBalance(!refreshCreditBalance)
            const redirectTo= location?.state?.from?.pathname || "/image-generation"
            console.log(redirectTo)
            navigate(redirectTo,{replace:true})
        }catch(err){
            setError(true)
            setErrorMessage(err.response.data.message)
        }finally{
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError(false)
        setSucccess(false) 
        setLoading(true)
        try{
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken(); // Get Firebase Token
            console.log("google sigin token:",idToken);
            console.log("User Info:", result.user);
            
            // Send token to backend for verification
            const response = await axiosAuth.post("/verify-google-token", 
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
            
            const redirectTo= location?.state?.from?.pathname || "/image-generation"
            console.log(redirectTo)
            navigate(redirectTo,{replace:true})
            
                    
        }catch(err){
            console.error("Error during sign-in");
            console.error(err)      
            setError(true)
            setErrorMessage(err?.response?.data?.message)
        } 
        finally{
            setLoading(false)
        }
    }

  return <>
        <div className='login d-flex flex-column justify-content-center align-items-center'>            
            <div className='login-page br-10'>

                
                    {error ? (
                        <div className='alert alert-danger'>{errorMessage}</div>
                    ) : succcess ? (
                        <div className='alert alert-success'>{successMessage}</div>
                    ) : null}
                {/* {
                    error&&
                    <div className='alert alert-danger'>{errorMessage}</div>
                }
                {
                    succcess&&
                    <div className='alert alert-success'>{successMessage}</div>
                } */}
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
                    {
                      (!otpSent||!isOtpLogin)&&
                        <div className="mb-3 d-flex flex-column justify-content-start email-container">
                            <label htmlFor="InputEmail1" className="form-label ">Email</label>
                            <div className='email-input-container'>
                                <input type="email" placeholder='Email' className="form-control email-input" id="InputEmail1" value={email} onChange={(e) => { setEmail(e.target.value) }} required />
                            </div>
                        </div> 
                    }
                    {isOtpLogin&&otpSent&&
                        <div>
                        <label htmlFor="exampleInputEmail1" className="form-label ">Otp</label>
                        <OtpInput
                            className="otp-input"
                            value={otp}
                            onChange={setOtp}
                            numInputs={6}
                            renderSeparator={<span>-</span>}
                            renderInput={(props) => <input {...props} />}
                            containerStyle="otp-input-container"
                            
                            inputType='number'
                            />
                        </div>
                    }
                    {!isOtpLogin&&
                    <div className='password-container'>
                        <label htmlFor="password-input" className="form-label ">Password</label>
                        <div className='password-input-container d-flex align-items-center justify-content-center'>
                            <input type={passwordVisibility ? "text" : "password"} placeholder='Password' className="form-control password-input" id="password-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <div    type='none' 
                                    onClick={(e) =>{ 
                                        
                                        setPasswordVisibility(!passwordVisibility);
                                        
                                    }} 
                                    className='password-visibility-toggle'>
                                
                                
                                <VisibilityOutlinedIcon className='visibility-icon' fontSize='small'/>
                                {
                                    passwordVisibility && <span className='visibility-icon-cross'></span>
                                }
                            
                            </div>
                        </div>
                    </div>

                    }


                    <div className='forgot-password-container text-end'>

                        {
                            isOtpLogin?

                            otpSent&&<div className='d-flex justify-content-end mt-2'>
                                <div  className='forgot-password-button mb-4 ' disabled={otpSent?false:true} title={!otpSent&&"first send the otp"} onClick={(e) => handleOtpLogin(e)}>Resend Otp</div>
                                </div>
                            :
                            <Link to={"/forgot-password"} className='forgot-password-button mb-4 '>{"Forgot Password?" }</Link>
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
                    :<button type="submit" className=" button dark-button w-100 br-100 mb-3">{otpSent?"Login" :isOtpLogin? "Send otp": "Login"}</button>
                    }
                </form>
                    <div className='divider d-flex align-items-center  '>
                        <span className='divider-line flex-1'></span>
                        <p className='divider-or'>OR</p>
                        <span className='divider-line flex-1'></span>
                    </div>
                    <div className='google-sign-in mt-3 d-flex justify-content-between'> 
                        <button className='google-sign-in-button d-flex align-items-center justify-content-center gap-2 pb-1 px-3 br-100 w-100 button button-white mb-4' onClick={handleGoogleSignIn}>
                            <img className='google-sign-in-logo' src={google} alt='google'/>
                            <p className='m-0 flex-1'>Sign-in with google</p>
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