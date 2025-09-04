import React, { useContext, useEffect, useState } from 'react'
import { axiosInstance } from '../../API\'s/axios'
import '../../Css/LibraryPage.css'
import LibraryImageContainer from '../../Components/UserComponents/LibraryImageContainer'
import RefreshDataContext from '../../Context/RefreshDataProvider'
import Masonry from "react-masonry-css";
import imagesLoaded from "imagesloaded";

export default function LibraryPage() {

  const {refreshLibraryData,setRefreshLibraryData} = useContext(RefreshDataContext)

  const [error,setError]=useState(false)
  const [errorMessage,setErrorMessage]=useState(null)
  const [success,setSuccess]=useState(false)
  const [successMessage,setSuccessMessage]=useState(null)

  const [width, setWidth] = useState(window.innerWidth);
  const [imageColumns,setImageColumns]=useState(window.innerWidth<576?1:window.innerWidth<768?2:window.innerWidth<992?3:4)
          
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      if(window.innerWidth<576){
        setImageColumns(1)
      }
      else if(window.innerWidth<768){
        setImageColumns(2)
      }
      else if(window.innerWidth<992){
        setImageColumns(3)
      }
      else{
        setImageColumns(4)
      }
    };
        
    window.addEventListener('resize', handleResize);
        
    return () => {
      window.removeEventListener('resize', handleResize);
    };
}, []);

  const [libraryImages,setLibraryImages]= useState([{
    id:0,
    image_url:""}
  ])

  useEffect(()=>{
    if(refreshLibraryData){
      GetLibraryImages()
      return
    }
    if( sessionStorage.getItem('libraryImages')){
      console.log("Library Images retrived from local storage")
      setLibraryImages(JSON.parse(sessionStorage.getItem('libraryImages')))
      return
    }

    GetLibraryImages()

  },[])


  const removeImageFromLibraryArray= (index)=>{
    const newLibraryImages = [...libraryImages]
    newLibraryImages.splice(index,1)
    setLibraryImages(newLibraryImages)
    sessionStorage.setItem('libraryImages', JSON.stringify(newLibraryImages))
  }
  const GetLibraryImages= async()=>{
    try{
      const response = await axiosInstance.get('/user/get-library-images')

      setLibraryImages(response.data.data)
      sessionStorage.setItem('libraryImages', JSON.stringify(response.data.data))
      console.log(response.data)
      console.log("Library Images retrived succesfully")
      setRefreshLibraryData(false)
    }catch(err){
      console.error(err)
      setError(true)
      setErrorMessage(err?.response?.data?.message||err.message||"Error loading library")
    }
  }

  useEffect(() => {
    if (libraryImages.length > 0) {
      const grid = document.querySelector(".library-image-masonry");
      imagesLoaded(grid, () => {
        console.log("All images loaded, reflowing Masonry...");
      });
    }
  }, [libraryImages]);  
  
  return (
    <div className='mt-5 library_body'>
      <div className=' pt-3'>
        <h2 className='ms-3 text-start'>Library</h2>
      </div>

        <div className='my-library-sample d-flex mt-2 flex-wrap'>
                        <Masonry  
                            breakpointCols={{ default: 4, 992: 3, 768: 2, 576: 1 }} // Adjusts for responsive layouts
                            className="library-image-masonry"
                            columnClassName="library-image-column"
                        >
                          {libraryImages.length == 0 ||error ? <span className='text-danger text-center fs-4 w-100'>{error?errorMessage:"No Results Found!"}</span> 
                          :
                          libraryImages.map((library,index) => (
                              <LibraryImageContainer key={index} imageColumns={imageColumns} index={index} removeImageFromLibraryArray={removeImageFromLibraryArray } library={library}> </LibraryImageContainer>
                          ))
                          }
                        </Masonry>
        </div>
    </div>
  )
}
