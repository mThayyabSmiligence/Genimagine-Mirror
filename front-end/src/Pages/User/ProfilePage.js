import React, { useContext, useEffect, useRef, useState } from 'react'
import '../../Css/ProfilePage.css'
import AuthContext from '../../Context/AuthProvider';
import profile_avatar from "../../images/profile_avatar.gif"
import EditIcon from '@mui/icons-material/Edit';
import { Link, useLocation } from 'react-router-dom';
import { axiosInstance, axiosPrivate } from '../../API\'s/axios';
import DropdownContext from '../../Context/DropdownProvider';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';

function ProfilePage() {

   
    const {loggedIn}= useContext(AuthContext);
    const [userData,setUserData]= useState(null)
    const[libraryImages,setLibraryImages]= useState([])
    const[exploreImages,setExploreImages]= useState([])
    const { showEditProfile,setShowEditProfile,dropdownRef } = useContext(DropdownContext); 
  
    useEffect(() => {
      if(localStorage.getItem('user_data')){
        setUserData(JSON.parse(localStorage.getItem('user_data')))
      }
    }, [loggedIn])
    useEffect(()=>{
        getfirstLibraryData()
        getExplore_images()
        
      
    },[])


    const getExplore_images=async()=>{
        try{
            const response = await axiosPrivate.get('/explore')
            setExploreImages(response.data.images)
            console.log(response.data)

        }catch (err){
            console.error("error getting explore images",err)
        }
    }

    const getfirstLibraryData=async()=>{
        try{

            const response = await axiosPrivate.get('/get-library-images')
      
            setLibraryImages(response.data.data)
            sessionStorage.setItem('libraryImages', JSON.stringify(response.data.data))
            console.log(response.data)
            console.log("Library Images retrived succesfully")
          }catch(err){
            console.error(err)
          }
    }


  return (
    <div className='container mt-5 px-0'>
                <div className='mt-5     cover-pic'>

                </div>
                <div className='my-profile d-flex align-items-center '>
                    <div className='profile-data-container d-flex align-items-start justify-content-start '> 
                        {/* {userData?<div className='profile-pic-big ms-1'><p className='pt-1'>{userData.username[0]}</p></div>:<div></div>} */}
                        <img className='profile-pic-big' src={profile_avatar}></img>
                        <h1 className=' user-name h-1  '>{userData?.username||"Thayyab"}</h1>
                    </div>
                    

                    <div className='edit-profile-icon' ref={dropdownRef} onClick={() => setShowEditProfile(!showEditProfile)}>
                        <EditIcon className='edit-icon'  ></EditIcon>
                        {
                            showEditProfile&& (
                                <div className='dropdown-menu p-0 mt-2'> 
                                    <Link to="/edit-user-name" className="dropdown-item">Edit Username</Link>
                                    <Link to="/u/change-password" className="dropdown-item">Change Password</Link>
                                </div>
                            )
                        }
                    </div> 


                </div>
                <div className='profile-library'>
                    <div className='d-flex justify-content-between align-items-center'>
                        <h3 className=' text-start mx-2 mt-3'>MY Library</h3>
                        <Link to={"/u/library"} className="link material-symbols-outlined me-3 ">
                            <ArrowForwardIosOutlinedIcon/>
                        </Link>
                    </div>

                    <div className='my-library-sample d-flex mt-2'> 
                
                        {libraryImages.length == 0? <span className='text-danger text-center fs-4 w-100'>No Results Found!</span> 
                        : 
                            libraryImages.map((library) => (
                            <div key={library.id}>
                                <img className='library-images mx-2' src={library.image_url} style={{ objectFit:"cover" }}></img>
                            </div>
                        ))
                        }   
                    </div>
                </div>
                <div className='profile-library'>
                    <div className='d-flex justify-content-between align-items-center'>
                        <h3 className=' text-start mx-2 mt-3'>Published Images</h3>
                        <Link to={"/u/published-images"} className="link material-symbols-outlined me-3 ">
                            <ArrowForwardIosOutlinedIcon/>
                        </Link>
                    </div>

                    <div className='my-library-sample d-flex mt-2'>

                        {exploreImages.length == 0 ? <span className='text-danger text-center fs-4 w-100'>No Results Found!</span> 
                        : exploreImages.map((explore) => (
                            <div key={explore.id}>
                                <img className='library-images mx-2' title={explore.prompt} alt={explore.prompt} src={explore.image_url} style={{ objectFit:"cover" }}></img>
                            </div>
                        ))
                        }
                    </div>
                </div>
    </div>
  )
}

export default ProfilePage;