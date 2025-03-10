import React, { useContext, useEffect, useState } from 'react'
import AuthContext from '../../Context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../../API\'s/axios';
import RefreshDataContext from '../../Context/RefreshDataProvider';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
export default function EditUserName() {

    const navigate= useNavigate()
    const {getUserData}= useContext(RefreshDataContext)
    const [username, setUserName] = useState('');
    const [usernameFocus, setUsernameFocus] = useState(false)
    const [usernameValidity, setUsernameValidity] = useState(false)
    const [loading, setLoading] = useState(false)

    const[error,setError] = useState(false)
    const[errorMessage,setErrorMessage] = useState("")

    useEffect(()=>{
        const user_data=JSON.parse(localStorage.getItem('user_data'))
        setUserName(user_data.username)
    },[])

    useEffect(()=>{
            setUsernameValidity(USER_REGEX.test(username));
    },[username])

    const handleSubmit = async (e) => {
    
        e.preventDefault();
        setError(null)
        setLoading(true)
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
        try{    
            const response = await axiosPrivate.post('/edit-user',
            {
                userName:username
            }
        )
        getUserData()
        navigate('/u/profile')
        }catch(err){
            setError(true)
            setErrorMessage(err?.response?.data?.message)

        }finally{
            setLoading(false)
        }
    }
  return (
    <div className='edit-user-name-page  d-flex flex-column justify-content-center align-items-center'>
        
        <div  className='edit-user-name-container login-page br-10 w-ft mt-3'>
            {
                error &&
                <div className='alert alert-danger'>{errorMessage}</div>
            }
            {
                loading &&
                <div className='spinner-border text-primary'></div>
            }

            <h2>Edit User Name</h2>
            <form className="container login-form" onSubmit={(e) => handleSubmit(e)}>
            <div className="mb-2 d-flex flex-column justify-content-start email-container">
                            <label htmlFor="exampleInputEmail1" className="form-label mb-1 d-flex">
                                New User Name :
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
                                    placeholder='New User Name' 
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
                        <button disabled={!usernameValidity ? true : false} type="submit" className=" button-wh dark-button-wh w-100 br-100 mb-3">Edit</button>

            </form>
            
        </div>
    </div>
  )
}
