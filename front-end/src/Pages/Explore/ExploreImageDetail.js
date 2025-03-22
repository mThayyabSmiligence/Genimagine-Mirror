import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosNoAUth } from "../../API's/axios";
import "../../Css/ExploreImageDetail.css";
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import anime from '../../images/style/Anime.png'
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import BrushIcon from '@mui/icons-material/Brush';

function ExploreImageDetail() {
    const { publish_id } = useParams(); 
    const [imageData, setImageData] = useState({});
    const [loading, setLoading] = useState(false);
    const [userData,setUserData]=useState({})

    useEffect(() => {
        ImageDetail();
    }, [publish_id]);

    const ImageDetail = async () => {
        setLoading(true);
        try {
            const response = await axiosNoAUth.get(`/explore/${publish_id}`);
            if (response.data.success) {
                setImageData(response.data.image);
                getUserDetails(response.data.image.user_id)
            }
        } catch (error) {
            console.error("Error fetching image details", error);
        } finally {
            setLoading(false);
        }
    };

    const getUserDetails=async(user_id)=>{
        try{
            const response = await axiosNoAUth.get(`user/${user_id}`)
            console.log("user data",response.data)
            setUserData(response.data.data)
       
        }catch(e){
            console.log('error geting user details',e)
        }
    }

    return loading?
    (
        <div className='w-100 h-100 d-flex justify-content-center align-items-center mt-5 pt-5'>
          <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      )
    :
    (
        <div className="image-detail-outer-container mt-5">
            <div className="image-detail-container ">
                <div className="image-container"> 
                    {console.log("image Data",imageData)}
                    <img src={imageData.image_url} alt={imageData.caption} className="explore-detail-image" />
                </div>   
    
                <div className="image-details d-flex flex-column ">
                    {/* prompt conatiner */}
                    <div className='image-prompt text-start p-2 '>
                        <div className="image-prompt-header d-flex justify-content-between align-items-center">
                            <h5 className=' prompt-header'>Prompt :</h5>
                            <button className="prompt-copy-button">Use This Prompt</button>
                        </div>
                        <div className='explore-prompt-setting-container flex-1'>
                            <div className='prompt-text-container p-2  h-100'>
                                <div className='prompt-text-innner-container'>
                                <p className='m-0'>{imageData.prompt?imageData.prompt:"the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv vo vewo voj v venvpuebnviuebvi ewvbeiuvbeinvebvjkb pvieqbvpuiqebvibdubvru rrrrrrrrrrrrrrrrr rrrrrrrrrrrrrrrrrrrrrr rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv  the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv "}</p>
                                </div>
                            </div>
                        </div>  
                    </div>
                    <div className="image-setting-tag-container d-flex justify-content-start align-items-center p-2 "> 
                        <div className="image-settings-tag d-flex justify-content-between align-items-center">
                            <p className="m-0">model:{imageData.model}</p>
                        </div>
                        <div className="image-settings-tag d-flex justify-content-between align-items-center">
                            <AspectRatioIcon className="icon"/>
                            <p className="m-0">: {imageData.aspect_ratio}</p>
                        </div>
                        <div className="image-settings-tag d-flex justify-content-between align-items-center">
                            <BrushIcon className="icon"/>
                            <p className="m-0">: {imageData.model}</p>
                        </div>
                    </div>
                    {/* caption container */}
                    <div className='image-caption p-2'>
                        <div className="user-id-tag-outer-container d-flex justify-content-between align-items-center pb-1">
                            <div className="user-id-tag d-flex align-items-center">
                                <img className="user-id-tag-image" src={anime} alt="anime"/>
                                <p className="mb-0 me-1">{userData?.username||"user name"}</p>
                            </div>
                            <button className="explore-caption-option d-flex justify-content-center align-items-center" id="explore-detail-option-button"><MoreVertOutlinedIcon className="icon"></MoreVertOutlinedIcon></button>

                        </div>
                            
                            {/* <h5 className='caption-header'>Caption :</h5> */}
                            {/* {
                                path=='/u/published-images'&&
                            <button onClick={handelEdit} className='edit-button edit-caption-button d-flex justify-content-center align-items-center'><EditIcon className='edit-icon'></EditIcon></button>
                            } */}
                          
                        <div className='caption-text-container p-2'> 
                            <div className='caption-text-innner-container text-start'>
                                <p className='m-0 test-start'>{imageData.caption}</p>
                            </div>
                        </div>
                    </div>
                    </div>
            </div>
        </div>










    //      <div className="image-detail-container">
    //      {imageData ? (
    //          <>
    //              <img src={imageData.image_url} alt={imageData.caption} className="detail-image" />
    //              <h2>{imageData.caption}</h2>
    //              <p>Uploaded by: {imageData.uploader}</p>
    //              <p>{imageData.description}</p>
    //          </>
    //      ) : (
    //          <p>Image not found</p>
    //      )}
    //  </div>
//  );
    );
}

export default ExploreImageDetail;