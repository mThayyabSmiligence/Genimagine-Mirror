  import React, { use, useContext, useEffect, useRef, useState } from 'react';
import '../../Css/ExplorePopUp.css'
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { axiosNoAUth, axiosPrivate } from '../../API\'s/axios';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AuthContext from '../../Context/AuthProvider';
import { Navigate, useNavigate } from 'react-router-dom';
import DeletePopUp from '../CommonComponents/DeletePopUp';

function ExplorePopUp({ image, onClose ,view , isDelete,handelDeletePublishedImage, showDeletePopUp, setShowDeletePopUp }) {
  const hasViewed = useRef(false); // Prevents multiple calls
  const [isUserLiked,setIsUserLiked]=useState(false)
  const {loggedIn}= useContext(AuthContext);
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

  return (
    <div className="explore-popup-overlay">
      <div className="explore-popup-content">
        <div className="popup-image-container"> 
         <img src={image.image_url} alt={image.caption} className="popup-image" />
        </div>
        <div className="image-details ">


        <div className='image-caption'>
            <h5 className='caption-header'>Caption :</h5>
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
                <span className="material-symbols-outlined setting-icon" title='Image Setting'>
                  settings
                </span>
                <div className='setting-tags p-secondary' title='model'>model :{image.model}</div>
                <div className='setting-tags p-secondary' title='aspect ratio'>Aspect Ratio :{image.aspect_ratio}</div>
                <div className='setting-tags p-secondary' title='Style'>Style :none</div>
              </div>  
            </div>  
          </div>

          

          <div className='explore-metrics d-flex justify-content-end'>

            <div className='user-like-container'>
              {
                isUserLiked?
                <button onClick={() => removeLike()} className='button light-button user-like-button d-flex align-items-center px-3'><FavoriteIcon className='liked-button'/>  <p className="ms-2 m-0">{image.likes_count}</p></button>
                :
                <button onClick={() => addLikes()} className='button light-button  user-like-button d-flex align-items-center px-3'><FavoriteBorderIcon/><p className="ms-2 m-0">{image.likes_count}</p></button>
              }
            </div>
            <div className='user-view-container mx-2'>
              <button className='button light-button user-view-button d-flex align-items-center px-3'><VisibilityIcon /><p className="ms-2 m-0 ">{image.views_count}</p></button>
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
        <button className='close-button' onClick={onClose}><span class="material-symbols-outlined">close</span></button>
    </div>
  )
}

export default ExplorePopUp