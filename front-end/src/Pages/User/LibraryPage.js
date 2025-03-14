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
      <div className='d-flex justify-content-between pt-3'>
        <h2 className='ms-3 text-start'>Library</h2>
        <button onClick={()=>GetLibraryImages()} className='button-wh dark-button-wh me-3'>Refresh</button>
      </div>

        <div className='my-library-sample d-flex mt-2 flex-wrap'>
                        <Masonry  
                            breakpointCols={{ default: 4, 992: 3, 768: 2, 576: 1 }} // Adjusts for responsive layouts
                            className="library-image-masonry"
                            columnClassName="library-image-column"
                        >
                          {libraryImages.length == 0 ? <span className='text-danger text-center fs-4 w-100'>No Results Found!</span> 
                          :
                          libraryImages.map((library,index) => (
                              <LibraryImageContainer key={index} index={index} removeImageFromLibraryArray={removeImageFromLibraryArray } library={library}> </LibraryImageContainer>
                          ))
                          }
                        </Masonry>
        </div>
    </div>
  )
}
