import React, { useEffect, useRef, useState } from 'react'
import { useParams } from "react-router-dom";
import { axiosModerator } from '../../API\'s/axios';
import "../../Css/UserDetail.css"
import SuspendPopUp from '../../Components/CommonComponents/SuspendPopUp';
import dayjs from 'dayjs'; 
import WarnPopUp from '../../Components/CommonComponents/WarnPopUp';



// import SuspendModal from "./SuspendModal";

export default function UserDetail() {

  const { user_id } = useParams();
  const [user, setUser] = useState(null);
  const [suspendDate, setSuspendDate] = useState(dayjs()); 
  const [reason, setReason] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showSuspendPopup, setShowSuspendPopup] = useState(false);
  const [showWarnPopUp, setShowWarnPopUp] = useState(false)



    useEffect(() => {
        getUserDetails()
    }, []);

   

    const getUserDetails = async () => {
        try{
            const response = await axiosModerator.get(`${user_id}/getuser`)
            console.log(response.data)
            setUser(response.data.user)
        }catch(err){
            console.log(err)    
        }
    }
    

    const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
    };

   

    const handleVerificationStatus = (is_verified) => {
        if(is_verified === 0) {
          return(
            <span className='text-danger fw-semibold'>Not Verified</span>
          )
        }else{
          return(
            <span className='text-success fw-semibold'>Verified</span>
          )
        }
    }

   const handleUserStatus =(status) => {
       if(status === "active") {
         return(
           <span className='text-success fw-semibold'>Active</span>
         )
       }else if(status == "banned") {
         return(
           <span className='text-danger fw-semibold'>Banned</span>
         )
       }else if(status == "suspended") {
         return(
           <span className='text-primary fw-semibold'>Suspended</span>
         )
       }else{
         return(
           <span className='text-danger fw-semibold'>deleted</span>
         )
       }
     }
   
     const handleBanUser = async () => {
       try {
        if (user.status === "deleted") {
          alert("User is already deleted");
          return;
        }
        if (user.status === "banned") {
          alert("User is already banned");
          return;
        }
         const response = await axiosModerator.post(`${user.user_id}/ban`);
         console.log(response.data);
   
         setUser(prev => ({
            ...prev,
            status: "banned"
          }));
       } catch (error) {
         console.error("Error banning user:", error);
       }
     }
   
     const handleUnBanUser = async (userId) => {

       try {
        if (user.status !== "banned") {
          alert("User is not banned");
          return;
        }
         const response = await axiosModerator.post(`${userId}/unban`);
         console.log(response.data);
         
         setUser(prev => ({
            ...prev,
            status: "active"
          }));
       } catch (error) {
         console.error("Error unbanning user:", error);
       }
     }
   
    const handleDeleteUser = async(userId) => {
       try {
         const response = await axiosModerator.post(`${userId}/delete`);
         console.log(response.data);
         setUser(prev => ({
            ...prev,
            status: "deleted"
          }));
         
       } catch (error) {
         console.error("Error deleting user:", error);
       }
    }

    // const calculateDurationInMinutes = (selectedDate) => {
    //   const now = new Date();
    //   const diffMs = selectedDate.getTime() - now.getTime();
    //   return Math.ceil(diffMs / (1000 * 60)); // Convert ms to minutes
    // };
    

    const handleSuspendUser = async () => {
      if (!reason.trim()) {
        alert("Please provide a reason for suspension.");
        return;
      }

      if (user.status === "banned") {
        alert("User is banned and cannot be suspended.");
        return;
      }
    
      if (user.status === "deleted") {
        alert("User is deleted and cannot be suspended.");
        return;
      }
    
      console.log("Raw suspendDate:", suspendDate); // should look like "2025-04-10T23:45"
      console.log("Parsed suspendDate:", dayjs(suspendDate));
      console.log("Now:", dayjs());

      // Date from the date picker
      const pickedDate = new Date(suspendDate.$d);

      // Current time
      const now = new Date();
      console.log(now)

      // Difference in milliseconds
      const diffMs = pickedDate-now;

      // Convert milliseconds to minutes
      const diffMinutes = Math.floor(diffMs / 60000);

      console.log(`Difference in minutes: ${diffMinutes}`);
      
      if (diffMinutes <= 0) {
        alert("Please select a valid suspension date.");
        return;
      }
    
      try {
        const response = await axiosModerator.post(`${user.user_id}/suspend`, {
          minutes: diffMinutes,
          reason,
        });
    
        setUser(prev => ({ ...prev, status: "suspended" }));
        setShowSuspendPopup(false); 
      } catch (error) {
        console.error("Suspend Error:", error);
        alert("Failed to suspend user.");
      }
    };

    const handleUnSuspendUser = async(userId) => {
        try{

          if (user.status !== "suspended") {
            alert("User is not suspended");
            return;
          }

            const response = await axiosModerator.post(`${userId}/unsuspend`)
            console.log(response.data)
            setUser(prev => ({
                ...prev,
                status: "active"
              }));
        }catch(error){
            console.log("Error unsuspending user:", error )
        }
    }
   
    const handleWarnUser = async () => {
      if (["banned", "suspended", "deleted"].includes(user?.status)) {
        alert(`Cannot warn a user who is already ${user.status}.`);
        return;
      }  
      
        try {
          const response = await axiosModerator.post(`${user.user_id}/warn`, {
            reason,      
          });
      
          
          setUser(prevUser => ({
            ...prevUser,
            status: response.data.data.count >= 4 ? "banned" : 
                    response.data.data.count === 3 ? "suspended" : "active",
            warning_data: response.data.data
          }));

          setReason(""); 
        } catch (error) {
          console.error("Error warning user:", error);
          alert("Failed to warn user.");
        }
      };

  return (
    <>
    <div className="container-xxl flex-grow-1 container-p-y user-data-container ">
      <div className='card mb-4'>
      <h2 className="card-header font-bold mb-4">User Details</h2>
        <div className='card-body'>
          <form id='formUserDetails'>
            <h4 className='text-start mb-3'>User ID: {user?.user_id}</h4>
            <div className='row'>
              <div className='mb-3 col-md-6 '>
                <label className='form-label' htmlFor='name'>User Name:</label>
                <input className='input1 label-input' id='name' value={user?.username} readOnly/>
              </div>

              <div className='mb-3 col-md-6'>
                <label className='form-label' htmlFor='Date-of-Birth'>Date of Birth:</label>
                <input className='input2 label-input' id='Date-of-birth' value={user?.DOB?.split('T')[0]} readOnly></input>
              </div>
            </div>

            <div className='row'>
              <div className='mb-3 col-md-6'>
                <label className='form-label' htmlFor='age'>Age:</label>
                <input className='input3 label-input' id='age' value={user?.age} readOnly></input>
              </div>

              <div className='mb-3 col-md-6'>
                <label className='form-label' htmlFor='email'>Email:</label>
                <input className='imput4 label-input ' id='email' value={user?.email} readOnly/>
              </div>

            </div>

            <div className='row'>
              <div className='mb-3 col-md-6'>
                <label className='form-label' htmlFor='credits'>Credits:</label>
                <input className='input5 label-input' id='credits' value={user?.credits} readOnly></input>
              </div>

              <div className='mb-3 col-md-6'>
                <label className='form-label' htmlFor='verification-status'>Verification Status:</label>
                <input className={`imput6 label-input ${user?.is_verified ? ' text-success' : ' text-danger'}`}id='verification-status' value={user?.is_verified ? "Verified" : "Not Verified"} readOnly/>
              </div>
            </div>

            <div className='row'>
            <div className='mb-3 col-md-6'>
              <label className='form-label' htmlFor='register-type'>Register Type:</label>
              <input className='input7 label-input' id='register-type' value={user?.register_type} readOnly />
            </div>

            <div className='mb-3 col-md-6'>
              <label className='form-label' htmlFor='role'>Role:</label>
              <input className='input8 label-input' id='role' value={user?.role} readOnly />
            </div>
          </div>

          <div className='row'>
            <div className='mb-3 col-md-6'>
              <label className='form-label' htmlFor='status'>Status:</label>
              <input
                className={`input9 label-input ${
                  user?.status === 'active'
                    ? 'text-success'
                    : user?.status === 'banned'
                    ? 'text-danger'
                    : user?.status === 'suspended'
                    ? 'text-primary'
                    : 'text-muted'
                }`}
                id='status'
                value={
                  user?.status === 'active'
                    ? 'Active'
                    : user?.status === 'banned'
                    ? 'Banned'
                    : user?.status === 'suspended'
                    ? 'Suspended'
                    : 'Deleted'
                }
                readOnly
              />
            </div>

            
          <div className='mb-3 col-md-6 d-flex flex-column align-items-end justify-content-end'>
               <label className='form-label action-label text-invisible'>Actions</label> 
             <div className="dropdown " ref={dropdownRef}>
                <button 
                  type="button" 
                  className="dropdown-toggle action-button button-wh dark-button-wh m-1" 
                  onClick={toggleDropdown}
                  aria-expanded={dropdownOpen}
                >
                  Select Action
                </button>

                {dropdownOpen && (
                  <ul className="dropdown-menu p-0" aria-labelledby="actionDropdown">
                  {user?.status === "banned" ? (
                          <li>
                            <button 
                            disabled = {user?.status === "deleted"}
                              type="button"
                              className="dropdown-item text-success" 
                              onClick={() => handleUnBanUser(user.user_id)}
                            >
                              Unban
                            </button>
                          </li>
                        ) : (
                          <li>
                            <button 
                              disabled = { user?.status === "deleted"}
                              type="button"
                              className="dropdown-item text-danger" 
                              onClick={() => handleBanUser(user.user_id)}
                            >
                              Ban
                            </button>
                          </li>
                        )
                  }
                  {user?.status === "suspended" ? (
                          <li>
                            <button 
                              disabled = {user?.status === "banned" || user?.status === "deleted"}
                              type="button"
                              className="dropdown-item text-success" 
                              onClick={() => handleUnSuspendUser(user.user_id)}
                            >
                              Unsuspend
                            </button>
                          </li>
                        ) : (
                          <li>
                            <button 
                              disabled = {user?.status === "banned" || user?.status === "deleted"}
                              type="button"
                              className="dropdown-item text-warning" 
                              onClick={() => setShowSuspendPopup(true)}
                            >
                              Suspend
                            </button>
                          </li>
                        )}
                        
                        <li>
                          <button 
                            type='button'
                            className="dropdown-item text-secondary" 
                            onClick={() => setShowWarnPopUp(true)}
                            disabled={["suspended", "banned", "deleted"].includes(user?.status)}
                          >
                            Warn
                          </button>
                        </li>
                  {user?.status !== "deleted" && (
                          <li>
                            <button 
                              type="button"
                              className="dropdown-item text-danger" 
                              onClick={() => handleDeleteUser(user.user_id)}                        
                            >
                              Delete
                            </button>
                          </li>
                        )
                    }                
                  </ul>
                )}
              </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
{
  showSuspendPopup && (
    <SuspendPopUp
      onHide={() => setShowSuspendPopup(false)}
      handleSuspendUser={handleSuspendUser}
      showSuspendPopup={showSuspendPopup}
      suspendDate={suspendDate}
      setSuspendDate={setSuspendDate}
      reason={reason}
      setReason={setReason}
    />
  )
}

{
  showWarnPopUp && (
    <WarnPopUp 
      reason = {reason}
      setReason = {setReason}
      handleWarnUser = {handleWarnUser}
      showWarnPopUp = {showWarnPopUp}
      onHide={() => setShowWarnPopUp(false)}
    />
  )
}
</>
  );
};

