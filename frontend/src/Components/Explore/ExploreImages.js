import React, { useEffect, useState } from "react";
import { axiosNoAUth } from "../../API's/axios";
import { useInView } from "react-intersection-observer";
import Masonry from "react-masonry-css";
import imagesLoaded from "imagesloaded";
import { useNavigate } from "react-router-dom";
import SortSection from "../../Components/Explore/SortSection";

function ExploreImages() {
    const [images, setImages] = useState([]);
    const [imageCurrentPage, setImageCurrentPage] = useState(1);
    const [hasMoreImages, setHasMoreImages] = useState(true);
    const [loading, setLoading] = useState(false);
    const [sortSelectedIndex, setSortSelectedIndex] = useState(0);
    const [topSelectedIndex, setTopSelectedIndex] = useState(0);
    const [sort, setSort] = useState("");
    const [top, setTop] = useState("");
    
    const Navigate = useNavigate();
    const { ref, inView } = useInView();

    // Fetch Explore Images
    const getImages = async (pageNumber, reset = false) => {
        if (!hasMoreImages || loading) return;

        setLoading(true);

        let query = `?page=${pageNumber}`;
        if (sort) query += `&sort=${sort}`;
        if (sort === 'top' && top) query += `&time=${top}`;

        try {
            console.log("Fetching images:", query);
            const response = await axiosNoAUth.get(`explore${query}`);

            if (response.data.success) {
                setImages((prevImages) => reset ? response.data.images : [...prevImages, ...response.data.images]);
                setHasMoreImages(!!response.data.pagination.nextPage);
                setImageCurrentPage(pageNumber + 1);
            }
        } catch (error) {
            console.error("Error fetching explore images", error);
            setHasMoreImages(false);
        } finally {
            setLoading(false);
        }
    };

    // Effect for when sort/top changes
    useEffect(() => {
        setImages([]);
        setImageCurrentPage(1);
        setHasMoreImages(true);
        getImages(1, true);
    }, [sort, top]);

    // Load next page when user reaches bottom
    useEffect(() => {
        if (inView && !loading && hasMoreImages) {
            getImages(imageCurrentPage);
        }
    }, [inView]);

    const handleImageClick = (published_id) => {
        Navigate(`/explore/image/${published_id}`);
    };

    useEffect(() => {
        if (images.length > 0) {
            const grid = document.querySelector(".explore-image-masonry");
            if (grid) {
                imagesLoaded(grid, () => {
                    console.log("All images loaded, reflowing Masonry...");
                });
            }
        }
    }, [images]);

    return (
        <>
            <div className="d-flex w-100">
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
            </div>

            <div className="explore-image-container">
                {images.length === 0 && !loading ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="80"
                                height="80"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                            </svg>
                        </div>
                        <h3 className="empty-state-title">No Images Found</h3>
                    </div>
                ) : (
                    <Masonry
                        breakpointCols={{ default: 4, 992: 3, 768: 2, 576: 1 }}
                        className="explore-image-masonry"
                        columnClassName="explore-image-column"
                    >
                        {images.map((image, index) => (
                            <div
                                key={`${image.published_id}-${index}`}
                                className="explore-image col-6 col-md-4 col-lg-3 br-10"
                                onClick={() => handleImageClick(image.published_id)}
                            >
                                <img src={image.image_url} alt={image.caption} className="br-10 img-fluid shadow" />
                            </div>
                        ))}
                    </Masonry>
                )}
            </div>

            {loading && <p className="text-center my-4">Loading more images...</p>}

            <div ref={ref} style={{ height: "10px", background: "transparent" }}></div>
        </>
    );
}

export default ExploreImages;
