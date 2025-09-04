import * as React from 'react';
import '../../Css/CreateModeratorForm.css'
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect } from 'react';
import { axiosAdmin } from '../../API\'s/axios';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
function CreateModeratorForm({ isEditMode = false }) {
    const navigate = useNavigate();
    const { userId } = useParams();

    const [errorMessage, setErrorMessage] = useState(null);
    const [error, setError] = useState(null);

    const [username, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [DOB, setDOB] = useState(null);
    const [isVerified, setIsVerified] = useState(true);

    const [usernameFocus, setUsernameFocus] = useState(false)

    const [usernameValidity, setUsernameValidity] = useState(false)
    const [emailValidity, setEmailValidity] = useState(false)
    const [passwordValidity, setPasswordValidity] = useState(false)
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [dobError, setDobError] = useState(false);

    const [moderatorData, setModeratorData] = useState(null);
     useEffect(() => {
        if (isEditMode && userId) {
            fetchModeratorDetails(userId);
        }
    }, [isEditMode, userId]);

    useEffect(()=>{
        setUsernameValidity(USER_REGEX.test(username));
    },[username])

    const fetchModeratorDetails = async () => {
        try {
            const res = await axiosAdmin.get(`get-moderator-detail/${userId}`);
            console.log("moderator detail", res.data.rows);
            setModeratorData(res.data.rows)
           
        } catch (err) {
            console.error("Failed to fetch moderator details", err);
        }
    };

    useEffect(() => {
        if(moderatorData){
            setUserName(moderatorData.username || " ");
            setEmail(moderatorData.email || " ");
            setDOB(dayjs(moderatorData.dob));
            setIsVerified(moderatorData.is_verified)
        }
    },[moderatorData])

    useEffect(() => {
            setPasswordValidity(PWD_REGEX.test(password));
    }, [password])
    
    useEffect(()=>{
        setEmailValidity(EMAIL_REGEX.test(email));
    },[email])

    const handleSubmit = async() => {
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
    
    if (!DOB) {
        setDobError(true);
        return;
    }

    setDobError(false);
    const formattedDOB = DOB ? DOB.format("YYYY-MM-DD") : "";

    const formData = {
        username,
        email,
        password,
        dob: formattedDOB,
        is_verified: isVerified 
    };
    
    console.log("Submitting form with:", formData);

    try {
       const response = isEditMode
        ? await axiosAdmin.post(`/update-moderator/${userId}`, formData)
        : await axiosAdmin.post('/create-moderator', formData);

        if (response.status === 200 || response.status === 201) {
        setError(false) 
        navigate("/admin/moderator-management");
        }
    } catch (error) {
        console.error("Error saving moderator", error);
        setError(error.message);
        setErrorMessage(error?.response?.data?.message||error.message||"Error creating moderator")
    }
};
    
  return (
    <div className="container mt-5 ">
        <div className="row justify-content-center align-items-center">
            <div className="col-12 col-md-10 col-lg-8">
                <div className="moderator-create-form p-4">
                    <div className="form-title">
                      <p className="form-title-text d-flex justify-contengt-start">
                          {isEditMode ? "Edit Moderator" : "Create Moderator"}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                        <label htmlFor="user-name" className="form-label user-name-text required-label">User Name</label>
                        <input value={username} onChange={(e) => setUserName(e.target.value)}  onFocus={() => setUsernameFocus(true)} type="text" className="form-control user-name-box" placeholder="Enter User Name" aria-label="user name" id="user-name" required/>
                        <p id="uidnote" className={usernameFocus && username && !usernameValidity ? "instructions" : "offscreen"}>
                            

                            4 to 24 characters.<br />
                            Must begin with a letter.<br />
                            Letters, numbers, underscores, hyphens allowed.
                        </p>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label email-text required-label">
                            Email
                        </label>
                        <input value={email} onBlur={() => setEmailTouched(true)} onChange={(e) => setEmail(e.target.value)} type="text" className={`form-control email-box ${!emailValidity && emailTouched ? 'is-invalid' : ''}`} placeholder="Enter Email" aria-label="email" id="email" required/>
                        {!emailValidity && emailTouched && (
                            <div className="invalid-feedback text-start" style={{ display: 'block' }}>
                            Please enter a valid email address.
                            </div>
                        )}
                    </div>
                    {!isEditMode && (
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label password-text required-label">Password</label>
                        <input value={password} type="text"   onBlur={() => setPasswordTouched(true)} onChange={(e) => setPassword(e.target.value)}className={`form-control password-box ${!passwordValidity && passwordTouched ? 'is-invalid' : ''}`} placeholder="Password" aria-label="password description" id="password" required/>
                        {!passwordValidity && passwordTouched && (
                            <div className="invalid-feedback text-start" style={{ display: 'block' }}>
                            Password must be 8–24 characters, include upper & lower case, a number, and a special character.
                            </div>
                        )}
                    </div>
                    )}

                    <div className="mb-3">
                    <label htmlFor="dob" className="form-label dob-text required-label">DOB</label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                htmlFor="dob"
                                label=""
                                value={DOB}
                                onChange={(newValue) => {
                                    console.log("Selected DOB (Dayjs object):", newValue);         // Raw Dayjs object
                                    console.log("Formatted DOB:", newValue?.format("YYYY-MM-DD")); // Formatted string

                                    setDOB(newValue); // Save to state
                                }}
                                slotProps={{
                                textField: {   
                                    id: "dob",
                                    className: "custom-datepicker-input",
                                    fullWidth: true,
                                    error: dobError,
                                    helperText: dobError ? "Date of Birth is required" : "",
                                    variant: "outlined",
                                    InputProps: {
                                    style: {
                                        height: '35px', // match your input height
                                        padding: '10px 12px'
                                    }
                                    },
                                    InputLabelProps: {
                                    shrink: false
                                    }
                                }
                                }}
                            />
                        </LocalizationProvider>
                    </div>
                   
 
                    <div className='moderator-status-switch-btn d-flex flex-column justify-content-between align-items-start mb-3'>
                      <label className="plan-status-btn-text mb-1">Set Verify</label>
                      <label className='switch kids-mode-switch'>
                        <input 
                        type="checkbox" 
                        checked={isVerified}
                        onChange={(e) => setIsVerified(e.target.checked)}
                        />
                        <span className='slider round'></span>
                      </label>
                    </div>

                    <div className="submit-create-model-container d-flex justify-content-between align-items-center mt-4 gap-2">
                        <button className="create-model-btn" onClick={() => navigate("/admin/moderator-management")}>Back</button>
                        <button className="create-model-btn" onClick={handleSubmit}>{isEditMode ? "Update" : "Create"}</button>    
                    </div>
              
                </div>
            </div>
        </div>
    </div>
 
  )
}

export default CreateModeratorForm