import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';

export default function VerifyUser() {
    const {verification_token}=useParams()

    const [loading, setLoading]=useState(true)

    const [succcess,setSuccess] = useState(false)

    const [ error,setError] = useState(false)
    const [errorCode,setErrorCode]=useState(null)
    const [errorMessage,setErrorMessage]=useState(null)

    const spinnerStyle = {
        width: "50px",
        height: "50px",
        border: "5px solid #f3f3f3",
        borderTop: "5px solid rgb(0, 0, 0)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      };

    useEffect(()=>{
        handelVerification()
    },[])

    const handelVerification=async()=>{
        try{
            const response = await axios.get(`http://localhost:3001/api/v1/auth/verify-user/${verification_token}`,
                {
                    withCredentials: true,
                }
            )
            setSuccess(true)
            setLoading(false)
        }catch(error){
            setError(true);
            console.log(error)
            setErrorMessage(error?.response?.data?.message)
            setErrorCode(error?.response?.status)
        }
        setLoading(false)
    }
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
   
       { 
       loading?(
        <div>
            <div style={spinnerStyle}></div>
        </div>
       ):(
        succcess?(
                <div>
                    <h1>Welcome to Genimagine!</h1>
                    <p>your email is verified , you can now login</p>
                    <Link to={"/login"} className='link button light-button'>to Login</Link>
                </div>
                ):(
                error? (
                        <div>
                            <h1>Error Occured</h1>
                            <p>{errorMessage}</p>
                            <p>Error Code: {errorCode}</p>
                        </div>
                    ):(
                        <div>
                            <h1>Welcome to Genimagine!</h1>
                            <p>your email is verified , you can now login</p>
                            <Link to={"/login"} className='link button light-button'>to Login</Link>
                        </div>
                    )
            )
        )
       }
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}
