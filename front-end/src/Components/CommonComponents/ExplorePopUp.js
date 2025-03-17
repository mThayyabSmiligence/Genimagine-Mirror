  import React, { use, useContext, useEffect, useRef, useState } from 'react';
import '../../Css/ExplorePopUp.css'

import { axiosNoAUth, axiosPrivate } from '../../API\'s/axios';

import AuthContext from '../../Context/AuthProvider';

import DeletePopUp from '../CommonComponents/DeletePopUp';
import RefreshDataContext from '../../Context/RefreshDataProvider';

import { Link, Navigate, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';


function ExplorePopUp({ image, onClose ,view , isDelete,handelDeletePublishedImage, showDeletePopUp, setShowDeletePopUp }) {
  const hasViewed = useRef(false); // Prevents multiple calls
  const [isUserLiked,setIsUserLiked]=useState(false)
  const {loggedIn}= useContext(AuthContext);
  const {refreshImageSettings,setRefreshImageSettings} = useContext(RefreshDataContext)
  const Navigate = useNavigate();

  useEffect(() => {
    if (!hasViewed.current &&view) {
      showview();
      hasViewed.current = true; // Set flag to true after first call
    }
    console.log(image);
  }, []);
  useEffect(()=>{
    if(image.isUserLiked===1){
      setIsUserLiked(true)
    }else{
      setIsUserLiked(false)
    }
    console.log("User likes state updated")
  },[])

  const showview = async() => {

    try{
      const response = await axiosNoAUth.post(`explore/${image.published_id}/view`)
      console.log(response)
      if(response.data.success){
        image.views_count++
        console.log("View count updated successfully")
        console.log(response.data)
      }
    }catch(error){
      console.log(error)
  }
  }

  
  const addLikes = async() => {
    if (!loggedIn) {
      localStorage.setItem('lastVisitedPage', `/explore?likedPost=${image.image_id}`);
      Navigate('/login');
      return;
    }
    try{
      const response = await axiosPrivate.post(`/explore/${image.published_id}/like`)
      console.log(response)
      if(response.data.success){
        image.likes_count++
        image.isUserLiked=1;
        setIsUserLiked(true)
        console.log("Like count updated successfully")
      }
    }catch(error){
      console.log(error)
    } 
  }

  const removeLike = async() => {
    try{
      const response = await axiosPrivate.post(`/explore/${image.published_id}/unlike`)
      console.log(response)
      if(response.data.success){
        image.likes_count--
        image.isUserLiked=0
        setIsUserLiked(false)
        console.log("Like count updated successfully, unlike")
      }
    }catch(error){
      console.log(error)
    }
  } 
    

  const handleDelete = () => {
    handelDeletePublishedImage(image.published_id)
  }

  const handleCopy = (image) => {
    localStorage.setItem("image_settings", JSON.stringify(
      {
        model: image.model,
        aspectRatio: {
          aspectRatio: image.aspect_ratio
        }
      }
    ))
    setRefreshImageSettings(!refreshImageSettings)

    
    Navigate(`/image-generation?prompt=${image.prompt}`)
  }

  const handelEdit=()=>{
    localStorage.setItem("temp_image_data",JSON.stringify(image))
    Navigate('/u/publish?edit=1')

  }

  return (
    <div className="explore-popup-overlay">
      <div className="explore-popup-content">
        <div className="popup-image-container"> 
         <img src={image.image_url} alt={image.caption} className="popup-image" />
        </div>
        <div className="image-details ">


        <div className='image-caption'>
            <div className='d-flex justify-content-between mb-1'>
              <h5 className='caption-header'>Caption :</h5>
              <button onClick={handelEdit} className='edit-button edit-caption-button d-flex justify-content-center align-items-center'><EditIcon className='edit-icon'></EditIcon></button>
            </div>
            <div className='caption-text-container p-2'>
              <div className='caption-text-innner-container text-start'>
                <p className='m-0 test-start'>{image.caption}</p>
              </div>
            </div>

          </div>
          <div className='image-prompt text-start p-2 '>
            <h5 className=' prompt-header'>Prompt :</h5>
            <div className='explore-prompt-setting-container'>
              <div className='prompt-text-container p-2'>
                <div className='prompt-text-innner-container'>
                <p className='m-0'>{image.prompt?image.prompt:"the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv vo vewo voj v venvpuebnviuebvi ewvbeiuvbeinvebvjkb pvieqbvpuiqebvibdubvru rrrrrrrrrrrrrrrrr rrrrrrrrrrrrrrrrrrrrrr rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv  the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv "}</p>
                </div>
              </div>
              <div className='image-setting-container d-flex align-items-center px-1 flex-wrap' >
                <SettingsOutlinedIcon/>
                <div className='setting-tags p-secondary' title='model'>model :{image.model}</div>
                <div className='setting-tags p-secondary' title='aspect ratio'>Aspect Ratio :{image.aspect_ratio}</div>
                <div className='setting-tags p-secondary' title='Style'>Style :none</div>
              </div>  
            </div>  
          </div>

          

          <div className='explore-metrics d-flex justify-content-end'>

            <div className='user-copy-prompt-container'>
              <button title='copy' onClick={() => handleCopy(image)} className='button-wh light-button-wh user-copy-prompt-button d-flex align-items-center px-3'>
                <ContentCopyOutlinedIcon/>
              </button>
            </div>

            <div className='user-like-container'>
              {
                isUserLiked?
                <button onClick={() => removeLike()} className='button-wh light-button-wh user-like-button d-flex align-items-center px-3'><FavoriteIcon className='liked-button'/>  <p className="ms-2 m-0">{image.likes_count}</p></button>
                :
                <button onClick={() => addLikes()} className='button-wh light-button-wh  user-like-button d-flex align-items-center px-3'><FavoriteBorderIcon/><p className="ms-2 m-0">{image.likes_count}</p></button>
              }
            </div>
            <div className='user-view-container mx-2'>
              <button className='button-wh light-button-wh user-view-button d-flex align-items-center px-3'><VisibilityIcon /><p className="ms-2 m-0 ">{image.views_count}</p></button>
            </div>
            {
              isDelete?
              <div>
              <button onClick={() =>setShowDeletePopUp(true)} className='button light-button delete-button d-flex align-items-center  br-100 p-1'><DeleteOutlineOutlinedIcon className='delete-icon'></DeleteOutlineOutlinedIcon></button>
              <DeletePopUp
                show={showDeletePopUp}
                onHide={() => setShowDeletePopUp(false)}
                handelDelete={handleDelete}
                message="Are you sure you want to delete this item forn your published image page?"
                showDeletePopUp = {showDeletePopUp}
              />
              </div>
              :
              null
            }
          </div>
        </div>
      </div>
        <button className='close-button' onClick={onClose}><CloseOutlinedIcon/></button>
    </div>
  )
}

export default ExplorePopUp