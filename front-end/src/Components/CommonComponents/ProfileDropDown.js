import React, { useContext, useEffect, useState } from 'react'
import '../../Css/ProfileDropDown.css'
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../Context/AuthProvider';
import { axiosInstance, axiosPrivate } from '../../API\'s/axios';
import DropdownContext from '../../Context/DropdownProvider';
import SignOutConfirmationPopUp from './SignOutConfirmationPopUp';
import RefreshDataContext from '../../Context/RefreshDataProvider';
import FeedbackPopUp from './FeedbackPopUp';
import { Slide, toast } from 'react-toastify';

function ProfileDropDown() {

    const {loggedIn,setLoggedIn} = useContext(AuthContext)
    const {setShowDropdown,dropdownRef} = useContext(DropdownContext)
    const [userData, setUserData]= useState(null)
    const {refreshUserData,setRefreshUserData} = useContext(RefreshDataContext)
    const [showFeedbackPopUp,setShowFeedbackPopUp]=useState(false)


    const[showSignOutPopUp,setShowSignOutPopUp]=useState(false)
    const navigate = useNavigate()

    const handleLogout = async() => {
        try{
            const resopnse = await axiosInstance.get('/auth/logout')
            console.log("logged out successfully")
            setLoggedIn(false);
            setShowDropdown(false);
            await localStorage.removeItem('user_data')
            setRefreshUserData(!refreshUserData)
            await localStorage.removeItem('image_settings')
            navigate('/');
        }catch(error){
            console.error("error getting logout",error);
        }
    };

    const handleNavigation = () => {
        setShowDropdown(false);
    };

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        setUserData(userData);
    },[])

    const handleSendFeedback = async ({ category, message }) => {    
        try {
          const res = await axiosPrivate.post('submitfeedback', {
            category,
            message,
          });
          console.log('Feedback submitted successfully:', res.data);
          setShowFeedbackPopUp(false);
          toast.success('feedback sent successfully!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Slide,
            });
        } catch (error) {
          console.error('Error submitting feedback:', error);
        }
    };

    // useEffect(() => {
    //     if (showFeedbackPopUp === false) {
    //         setShowDropdown(false);
    //         return;
    //     }

    // }, [showFeedbackPopUp]);

  return (
    <>
    <div className="dropdown-menu p-0" ref={dropdownRef}>
        {   
        userData&&userData?.role !== "admin" && userData?.role !== "moderator" &&
        <>
            <Link to="/u/profile" className="dropdown-item" onClick={handleNavigation}>Profile</Link>
            <Link to="/u/library" className="dropdown-item" onClick={handleNavigation}>Library </Link>
            <div className="dropdown-item" onClick={() => setShowFeedbackPopUp(true)}>Feedback </div>
            <Link to="/u/published-images" className="dropdown-item" onClick={handleNavigation}>Published Images</Link>
        </>
        
        }
        {      
            userData?.role == "admin" &&
            // <Link to="" className="dropdown-item" onClick={handleNavigation}>Admin Panel</Link>
            <Link></Link>
        }
        {
            userData?.role == "moderator" &&
            // <Link to="" className="dropdown-item" onClick={handleNavigation}>Moderator Panel</Link>
            <Link to="/moderator/profile-page" className="dropdown-item">Profile</Link>
        }
        <button className="dropdown-item" onClick={()=>setShowSignOutPopUp(true)}>Sign Out</button>
        {
            showSignOutPopUp&&
            <SignOutConfirmationPopUp showSignOutPopUp={showSignOutPopUp} onHide={()=>setShowSignOutPopUp(false)} handelSignOut={handleLogout}></SignOutConfirmationPopUp>
        }
        {
            showFeedbackPopUp && (
                <FeedbackPopUp
                    showFeedbackPopUp={showFeedbackPopUp}
                    onHide={() => setShowFeedbackPopUp(false)}
                    handleSendFeedback={handleSendFeedback}
                    // validateMessage={validateMessage}
                />
            )     
        }
    </div>
    </>
  )
}

export default ProfileDropDown;