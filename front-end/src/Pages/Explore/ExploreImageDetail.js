import React, { useContext, useEffect, useRef, useState } from "react";
import { replace, useLocation, useNavigate, useParams } from "react-router-dom";
import { axiosNoAUth, axiosPrivate } from "../../API's/axios";
import "../../Css/ExploreImageDetail.css";
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import anime from '../../images/style/Anime.png'
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import BrushIcon from '@mui/icons-material/Brush';
import RefreshDataContext from "../../Context/RefreshDataProvider";
import AuthContext from "../../Context/AuthProvider";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '../../images/sharelogo.png';
import LinkIcon from '@mui/icons-material/Link';
import config from "../../Config";
// import { useInView } from "react-intersection-observer";
// import EditIcon from '@mui/icons-material/Edit';

function ExploreImageDetail() {
    const { published_id } = useParams(); 
    const [imageData, setImageData] = useState({});
    const [loading, setLoading] = useState(false);
    const [userData,setUserData]=useState({})
    const hasViewed = useRef(false);
    const [isUserLiked,setIsUserLiked]=useState(false)
    const {loggedIn}= useContext(AuthContext);
    const {refreshImageSettings,setRefreshImageSettings} = useContext(RefreshDataContext)
    const [showCopyOption, setShowCopyOption] = useState(false);
    const [copied, setcopied] = useState(false);
    const [imageCaptionOption, setImageCaptionOption] = useState(false);
    const [imagePathCopied, setImagePathCopied] = useState(false);

    const Navigate = useNavigate();

    const location = useLocation();

        useEffect(() => {
            ImageDetail();
        }, [published_id]);

        useEffect(() => {
            if (!hasViewed.current ) {
            showview();
            hasViewed.current = true; // Set flag to true after first call
            }
            console.log(imageData);
        }, []);

         useEffect(()=>{
            if(imageData.isUserLiked===1){
            setIsUserLiked(true)
            }else{
            setIsUserLiked(false)
            }
            console.log("User likes state updated")
        },[imageData])
    
        useEffect(() => {
          if(copied){
            setTimeout(() => {
              setcopied(false);
              setShowCopyOption(false);
            }, 3000);
          }
        },[copied])

        useEffect(() => {
            if(imagePathCopied){
                setTimeout(() => {
                setImagePathCopied(false);
                setImageCaptionOption(false);
                }, 3000);
            }
            },[imagePathCopied])


    const ImageDetail = async () => {
        setLoading(true);
        try {
            const response = await axiosNoAUth.get(`/explore/${published_id}`);
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

    // const handelEdit=()=>{
    //     localStorage.setItem("temp_image_data",JSON.stringify(image))
    //     Navigate('/u/publish?edit=1')
    
    //   }

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
    
      const addLikes = async() => {
        if (!loggedIn) {
            Navigate('/login',{state: {from: location}});
            return;
          }

          try{
            const response = await axiosPrivate.post(`/explore/${published_id}/like`)
            console.log('response in adding likes',response.data)
            if(response.data.success){
                imageData.likes_count++
                imageData.isUserLiked =1;
              setIsUserLiked(true)
              console.log("Like count updated successfully")
            }
          }catch(e){
            console.log('error in adding likes',e)
          }
       
      }
    
      const removeLike = async() => {
        try{
              const response = await axiosPrivate.post(`/explore/${published_id}/unlike`)
              console.log(response)
              if(response.data.success){
                imageData.likes_count--
                imageData.isUserLiked=0
                setIsUserLiked(false)
                console.log("Like count updated successfully, unlike")
              }
            }catch(error){
              console.log(error)
            }
      } 

      const showview = async() => {
      
          try{
            const response = await axiosNoAUth.post(`explore/${published_id}/view`)
            console.log(response)
            if(response.data.success){
              imageData.views_count++
              console.log("View count updated successfully")
              console.log(response.data)
            }
          }catch(error){
            console.log(error)
        }
        }

        const handleShare = (image) => {
            if (image.image_url) {
              navigator.clipboard.writeText(config.Base_Url + location.pathname)
              .then(() => {
                setcopied(true);
                setImagePathCopied(true)
              })
              .catch((error) => {
                console.error("Failed to copy URL: ", error);
              });
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
        <div className="image-detail-outer-container explore-image-detail-container mt-5">
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
                            <button onClick={() => handleCopy(imageData)} className="prompt-copy-button">Use This Prompt</button>
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
                            <p className="m-0">: {imageData.style}</p>
                        </div>
                    </div>
                    {/* caption container */}
                    <div className='image-caption p-2'>
                        <div className="user-id-tag-outer-container d-flex justify-content-between align-items-center pb-1">
                            <div className="user-id-tag d-flex align-items-center">
                                <img className="user-id-tag-image" src={anime} alt="anime"/>
                                <p className="mb-0 me-1">{userData?.username||"user name"}</p>
                            </div>
                            <button onClick={() => setImageCaptionOption(!imageCaptionOption)} className="explore-caption-option d-flex justify-content-center align-items-center" id="explore-detail-option-button"><MoreVertOutlinedIcon className="icon"></MoreVertOutlinedIcon></button>
                            {
                                imageCaptionOption?
                                <div className='caption-option-copy-link-container'>           
                                {
                                    imagePathCopied ?
                                    <button className='option-copy-link-button'>Copied</button> :
                                    <button onClick={() => handleShare(imageData)} className='option-copy-link-button'><LinkIcon fontSize='small'></LinkIcon>Copy link</button>
                                }   
                                </div>
                                :
                                null
                            }
                        </div>
                            
                        {/* <div className='d-flex justify-content-between mb-1'>
                            <h5 className='caption-header'>Caption :</h5>
                            {
                                path=='/u/published-images'&&
                            <button onClick={handelEdit} className='edit-button edit-caption-button d-flex justify-content-center align-items-center'><EditIcon className='edit-icon'></EditIcon></button>
                            }
                        </div> */}
                          
                        <div className='caption-text-container p-2'> 
                            <div className='caption-text-inner-container text-start'>
                                <p className='m-0 test-start'>{imageData.caption}</p>
                            </div>
                        </div>
                    </div>

                    <div className="explore-metrics d-flex justify-content-end">
                        <div className='user-like-container'>
                            {
                                isUserLiked?
                                <button onClick={() => removeLike()} className='button-wh light-button-wh user-like-button d-flex align-items-center px-3'><FavoriteIcon className='liked-button'/>  <p className="ms-2 m-0">{imageData.likes_count}</p></button>
                                :
                                <button onClick={() => addLikes()} className='button-wh light-button-wh  user-like-button d-flex align-items-center px-3'><FavoriteBorderIcon/><p className="ms-2 m-0">{imageData.likes_count}</p></button>
                            }
                        </div>
                        <div className='user-view-container'>
                            <button className='button-wh light-button-wh user-view-button d-flex align-items-center px-3'><VisibilityIcon /><p className="ms-2 m-0 ">{imageData.views_count}</p></button>
                        </div>
                        <div className='share-image-container'>
                            <button onClick={() => setShowCopyOption(!showCopyOption)} className='button-wh light-button-wh share-image-button d-flex align-items-center px-3'>
                                <img className='share-image-icon' src={ShareIcon} alt='share icon'/>
                            </button>
                            {
                                showCopyOption?
                                <div className='copy-link-container'>           
                                {
                                    copied ?
                                    <button className='copy-link-button'>Copied</button> :
                                    <button onClick={() => handleShare(imageData)} className='copy-link-button'><LinkIcon fontSize='small'></LinkIcon>Copy link</button>
                                }   
                                </div>
                                :
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>  
    );
}

export default ExploreImageDetail;