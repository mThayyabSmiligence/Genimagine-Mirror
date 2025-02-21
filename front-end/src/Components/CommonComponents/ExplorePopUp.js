import React from 'react';
import '../../Css/ExplorePopUp.css'
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';

function ExplorePopUp({ image, onClose }) {
  return (
    <div className="explore-popup-overlay">
      <div className="explore-popup-content">
        <div className="popup-image-container"> 
         <img src={image.image_url} alt={image.caption} className="popup-image" />
        </div>
        <div className="image-details ">
          <div className='image-prompt text-start p-2 '>
            <h5 className=' prompt-header'>Prompt :</h5>
            <div className='prompt-text-container p-2'>
              <div className='prompt-text-innner-container'>
               <p className='m-0'>the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv vo vewo voj v venvpuebnviuebvi ewvbeiuvbeinvebvjkb pvieqbvpuiqebvibdubvru rrrrrrrrrrrrrrrrr rrrrrrrrrrrrrrrrrrrrrr rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv  the cat smfmpoemfeocmckwkwiemvkv emvkevie vke viemmvieciwckwwnfkwnfnemcejofnvirmvqenvevinvneoveoiv </p>
              </div>
            </div>
          </div>

          <div className='image-caption'>
            <h5 className='caption-header'>Caption :</h5>
            <div className='caption-text-container p-2'>
              <div className='caption-text-innner-container'>
                <p className='m-0'>{image.caption}</p>
              </div>
            </div>

          </div>

          <div className='explore-metrics d-flex  justify-content-end'>
            <div className='user-like-container'>
              <button className=' button light-button user-like-button d-flex align-items-center'><FavoriteBorderIcon/>  <p className="ms-2 m-0">{image.likes_count}</p></button>
            </div>
            <div className='user-view-container mx-2'>
              <button className='button light-button user-view-button d-flex align-items-center'><VisibilityIcon/><p className="ms-2 m-0 ">{image.views_count}</p></button>
            </div>
          </div>
        </div>
      </div>
        <button className='close-button' onClick={onClose}><span class="material-symbols-outlined">close</span></button>
    </div>
  )
}

export default ExplorePopUp