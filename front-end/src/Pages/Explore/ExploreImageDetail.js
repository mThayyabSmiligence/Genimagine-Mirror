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
import EditIcon from '@mui/icons-material/Edit';
import DeletePopUp from "../../Components/CommonComponents/DeletePopUp";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const styleList = [
    { id: 1, style_name: "Textured Oil Painting", },
    { id: 2, style_name: "Chalk and Charcoal", },
    { id: 3, style_name: "Chinese Ink Painting", },
    { id: 4, style_name: "Realism", },
    { id: 5, style_name: "3D Render", },
    { id: 6, style_name: "Ink & Wash", },
    { id: 7, style_name: "Bright and Exaggerated Cartoon World", },
    { id: 8, style_name: "Anime", },
    { id: 9, style_name: "Black & White", },
    { id: 10, style_name: "Bokeh",  },
    { id: 11, style_name: "Cinematic",  },
    { id: 12, style_name: "Comic Book",  },
    { id: 13, style_name: "Film Noir",  },
    { id: 14, style_name: "Indian Miniature",  },
    { id: 15, style_name: "Japanese Ukiyo-e",  },
    { id: 16, style_name: "Neon Glow",  },
    { id: 17, style_name: "Pixel Art",  },
    { id: 18, style_name: "Steampunk",  },
    { id: 19, style_name: "Baroque Portrait",  },
    { id: 20, style_name: "Cyberpunk Setting",  },
    { id: 21, style_name: "Delicate Watercolor Painting",  },
    { id: 22, style_name: "Dreamlike and Abstract Composition",  },
    { id: 23, style_name: "Dynamic Graffiti Artwork",  },
    { id: 24, style_name: "Gothic Horror Setting",  },
    { id: 25, style_name: "High Dynamic Range Photography",  },
    { id: 26, style_name: "Monochrome Sketch",  },
    { id: 27, style_name: "Moody Gothic Atmosphere",  },
    { id: 28, style_name: "Mythical World",  },
    { id: 29, style_name: "Pencil Sketch Style",  },
    { id: 30, style_name: "Playful Cartoon Style",  },
    { id: 31, style_name: "Pop Art Style",  },
    { id: 32, style_name: "Richly Detailed Baroque Style",  },
    { id: 33, style_name: "Soft Watercolor Style",  },
    { id: 34, style_name: "Surreal Landscape",  },
    { id: 35, style_name: "80s inspired vaporwave style",  },
    { id: 36, style_name: "Thick Oil Painting Style",  },
    { id: 37, style_name: "Ultra Realistic HDR Style",  },
    { id: 38, style_name: "Urban Street Art Style",  },
    { id: 39, style_name: "Vaporwave Aesthetic",  },
    { id: 40, style_name: "Vibrant Pop Art Illustration",  }
]
function ExploreImageDetail() {
    const location = useLocation()
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
    const [isUsersImage, setIsUsersImage] = useState(location.pathname.includes("/u/published-images"));
    const [showDeletePopUp, setShowDeletePopUp] = useState(false);
    const Navigate = useNavigate();

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
            const response = await axiosNoAUth.get(`/explore/image/${published_id}`);
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

    const handelEdit=()=>{
        localStorage.setItem("temp_image_data",JSON.stringify(imageData))
        Navigate('/u/publish?edit=1',{state:{from:location}})
    
      }

    const handleCopy = (image) => {
        const style = styleList.find((style) => imageData?.style == style.style_name)

        localStorage.setItem("image_settings", JSON.stringify(
          {
            model: image.model,
            aspectRatio: {
              aspectRatio: image.aspect_ratio
            },
            style: style.id
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

        const handelDeletePublishedImage=async(published_id) => {
                try{
                    const response = await axiosPrivate.delete(`/explore/${published_id}`)
                    console.log(response)
                    if(response.data.success){
                       Navigate('/u/published-images',{replace: true})
                    }
                }
                catch(error){
                    console.log(error)
                }
            }

        const handleDelete = () => {
            handelDeletePublishedImage(imageData.published_id)
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
                            <div className="d-flex ">                
                                {
                                    isUsersImage&&
                                    <button onClick={handelEdit} className='edit-button  d-flex justify-content-center align-items-center me-2' id="published-image-edit-button"><EditIcon className=' icon'></EditIcon></button>

                                }
                                
                                <button onClick={() => setImageCaptionOption(!imageCaptionOption)} className={`explore-caption-option d-flex justify-content-center align-items-center`} id="explore-detail-option-button"><MoreVertOutlinedIcon className="icon"></MoreVertOutlinedIcon></button>
                                {
                                    imageCaptionOption?
                                    <div className={`caption-option-copy-link-container  ${isUsersImage&& "published-image"}`}>           
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
                        {
                            isUsersImage?
                            <div>
                            <button onClick={() =>setShowDeletePopUp(true)} className='button-wh light-button-wh delete-button d-flex align-items-center  br-100 p-1'><DeleteOutlineOutlinedIcon className='delete-icon'></DeleteOutlineOutlinedIcon></button>
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
        </div>  
    );
}

export default ExploreImageDetail;