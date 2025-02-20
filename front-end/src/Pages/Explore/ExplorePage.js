import React, { useEffect, useState } from 'react';
import SortSection from '../../Components/Explore/SortSection';
import { axiosNoAUth } from '../../API\'s/axios';
import '../../Css/ExplorePage.css';
import { Pagination } from '@mui/material';

function ExplorePage() {

    const [images, setImages] = useState([]);

    useEffect(() => {
        getImages();
    },[])
    

    const getImages = async () => {
        try {
            const response = await axiosNoAUth.get('explore');
            console.log(response.data);
            setImages(response.data.images);
        } catch (error) {
            console.error("error in fetching explore images", error)
        }
    }

  return (
    <div className='mt-5 explore-page-container'>
        <div className='explore-heading text-start ms-3 mb-3'>
            <h1>Explore</h1>
        </div>
        <div className='explore-sort-section'>
            <SortSection></SortSection>
        </div>
        <div className='explore-body'>
            <div className='explore-image-container d-flex flex-wrap justify-content-start my-4'>
                {
                    images.map((image, index) => (
                        <div key={index} className='explore-image mx-3 d-flex justify-content-center align-items-center my-2'>
                            <img src={image.image_url} alt={image.caption} />
                        </div>
                    ))
                }
            </div>
        </div>
        <Pagination></Pagination>
    </div>
  )
}

export default ExplorePage