import React, { useEffect, useState } from 'react'
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import profile_avatar from "../images/profile_avatar.gif"
import { Link, useParams } from 'react-router-dom';
import { axiosNoAUth, axiosPrivate } from '../API\'s/axios';

export default function OtherUserProfile() {

    const {userId}= useParams()
    const [userData,setUserData] = useState()
    const [exploreImages,setExploreImages] = useState([])


    useEffect(()=>{
        console.log("user id",userId)
        getImageDetails()
        getUserDetails()
    },[])

    const getImageDetails=async()=>{
        try{
            const response = await axiosPrivate.get('/explore?limit=4',{
                userId: userId,
            })
            setExploreImages(response.data.images)
            console.log(response.data)
        
        }catch(e){
            console.log('error geting published images from other user',e)
        }
    }

    const getUserDetails=async()=>{
        try{
            const response = await axiosNoAUth.get(`user/${userId}`)
            console.log("user data",response.data)
            setUserData(response.data.data)
        
        }catch(e){
            console.log('error geting user details',e)
        }
    }


  return (
    <div className='container mt-5 px-0'>
    <div className='mt-5 cover-pic'>

    </div>
    <div className='my-profile d-flex align-items-center '>
        <div className='profile-data-container d-flex align-items-start justify-content-start '> 
            {/* {userData?<div className='profile-pic-big ms-1'><p className='pt-1'>{userData.username[0]}</p></div>:<div></div>} */}
            <img className='profile-pic-big' alt='profile pic' src={profile_avatar}></img>
            <h1 className=' user-name h-1  '>{userData?.username||"Thayyab"}</h1>
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
            : exploreImages.map((explore,index) => (
                index<4&&
                <div key={index}>
                    <img className='library-images mx-2' title={explore.prompt} alt={explore.prompt} src={explore.image_url} style={{ objectFit:"cover" }}></img>
                </div>
            ))
            }
        </div>
    </div>
</div>
  )
}
