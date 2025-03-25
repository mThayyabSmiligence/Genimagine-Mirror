import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer';
import { axiosNoAUth, axiosPrivate } from '../../API\'s/axios';
import SortSection from '../../Components/Explore/SortSection';
import ExplorePopUp from '../../Components/CommonComponents/ExplorePopUp';
import '../../Css/ExplorePage.css'
import '../../Css/PublishedImages.css'
import Masonry from "react-masonry-css";
import imagesLoaded from "imagesloaded";
import { useLocation, useParams, useNavigate  } from 'react-router-dom';

export default function PublishedImages() {

    const location = useLocation()
    const {userId}=useParams()
    const Navigate = useNavigate();

    const [images, setImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreImages, setHasMoreImages] = useState(true);
    const [loading, setLoading] = useState(false);

    const [sortSelectedIndex, setSortSelectedIndex] = useState(0);
    const [topSelectedIndex, setTopSelectedIndex] = useState(0);
    const [sort, setSort] = useState(""); // Sorting method (recent/top)
    const [top, setTop] = useState(""); // Time filter (day/week/month)
    const [selectedImage, setSelectedImage] = useState(false);
    const [showDeletePopUp, setShowDeletePopUp] = useState(false);

    const { ref, inView } = useInView(); // Detects when user reaches bottom

    // 🔹 Fetch Explore Images
    const getImages = async (pageNumber, reset = false) => {
        if (!hasMoreImages || loading) return;

        setLoading(true);

        let query = `?page=${pageNumber}`;
        if (sort) query += `&sort=${sort}`;
        if (sort =='top'&&top) query += `&time=${top}`;

        try {
            console.log("Fetching:", query);
            let response;
            
            if(location.pathname=="/u/published-images")
            {
                response = await axiosPrivate.get(`explore${query}`);
            }
            else{
                response = await axiosNoAUth.get(`explore/${userId}`)
            }
            console.log("Response:", response.data);

            if (response.data.success) {
                setImages((prevImages) => reset ? response.data.images : [...prevImages, ...response.data.images]);
                setHasMoreImages(!!response.data.pagination.nextPage);
                setCurrentPage(pageNumber + 1);
            }
        } catch (error) {
            console.error("Error fetching explore images", error);
        } finally {
            setLoading(false);
        }
    };

    // Load first page when sort or top changes
    useEffect(() => {
        setImages([]); 
        setCurrentPage(1); 
        setHasMoreImages(true); 
        getImages(1, true); 
    }, [sort, top]);

    // Load next page when user reaches bottom
    useEffect(() => {
        if (inView && hasMoreImages && !loading) {
            getImages(currentPage);
        }
    }, [inView]);

    const handleImageClick = (published_id) => {
        if(location.pathname.includes("/u/published-images")){
            Navigate(`/u/published-images/${published_id}`)
        }else{
            Navigate(`/explore/image/${published_id}`)
        }
    };

    const handleClosePopup = () => {
        setSelectedImage(false);
    };
    const handelDeletePublishedImage=async(published_id) => {
        try{
            const response = await axiosPrivate.delete(`/explore/${published_id}`)
            console.log(response)
            if(response.data.success){
                const filteredImages = images.filter(i=>i.published_id!==published_id)
                setImages(filteredImages)
                setSelectedImage(null)
                console.log("Image deleted successfully")
                setShowDeletePopUp(false);
            }
        }
        catch(error){
            console.log(error)
        }
    }

    return (
        <div className="mt-5 explore-page-container publish-page-container">
            <div className="explore-heading text-start ms-3 mb-3">
                <h1>Published Images</h1>
            </div>
            <div className="explore-sort-section mb-3">
                <SortSection
                    sort={sort}
                    setSort={setSort}
                    sortSelectedIndex={sortSelectedIndex}
                    setSortSelectedIndex={setSortSelectedIndex}
                    top={top}
                    setTop={setTop}
                    topSelectedIndex={topSelectedIndex}
                    setTopSelectedIndex={setTopSelectedIndex}
                    oldest={true}
                />
            </div>
            <div className="explore-body">
               
                <div className="explore-image-container">
                    <Masonry
                        breakpointCols={{ default: 4, 992: 3, 768: 2, 576: 1 }} // Adjusts for responsive layouts
                        className="explore-image-masonry"
                        columnClassName="explore-image-column"
                    >
                        {images.length == 0 ? <span className='text-danger fs-4 w-100'>No Results Found!</span> 
                        :
                        images.map((image, index) => (

                            <div key={index} className="explore-image d-flex justify-content-center align-items-center br-10"
                            onClick={() => handleImageClick(image.published_id)}
                            >
                                <img src={image.image_url} alt={image.caption} className="br-10" />
                            
                            </div>
                        ))}
                    </Masonry>
                </div>
            </div>

            {/* Loading Spinner */}
            {loading && <p>Loading more images...</p>}

            {/* Invisible div for detecting scroll */}
            <div ref={ref} style={{ height: "10px", background: "transparent" }}></div>

        </div>

    );
}
