import React, { useEffect, useState } from "react";
import SortSection from "../../Components/Explore/SortSection";
import { axiosNoAUth } from "../../API's/axios";
import "../../Css/ExplorePage.css";
import { useInView } from "react-intersection-observer";
import Masonry from "react-masonry-css";
import imagesLoaded from "imagesloaded";
import { useNavigate } from "react-router-dom";
import ExploreVideoPlayerModal from "../../Components/CommonComponents/ExploreVideoPlayerModal";
import VideoCard from "../../Components/Explore/VideoCard";

function ExplorePage() {
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    
    const [imageCurrentPage, setImageCurrentPage] = useState(1);
    const [videoCurrentPage, setVideoCurrentPage] = useState(1);
    const [hasMoreImages, setHasMoreImages] = useState(true);
    const [hasMoreVideos, setHasMoreVideos] = useState(true);
    
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("images");
    
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [sortSelectedIndex, setSortSelectedIndex] = useState(0);
    const [topSelectedIndex, setTopSelectedIndex] = useState(0);
    const [sort, setSort] = useState("");
    const [top, setTop] = useState("");
    const Navigate = useNavigate();

    const { ref, inView } = useInView();

    // 🔹 Fetch Explore Images
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

    // 🔹 Fetch Explore Videos
    const getVideos = async (pageNumber, reset = false) => {
        if (!hasMoreVideos || loading) return;

        setLoading(true);
        let query = `?page=${pageNumber}`;

        try {
            console.log("Fetching videos:", query);
            const response = await axiosNoAUth.get(`videos/explore${query}`);

            if (response.data.success) {
                const videosData = Array.isArray(response.data.videos) 
                    ? response.data.videos 
                    : [];
                
                setVideos((prevVideos) => 
                    reset 
                        ? videosData 
                        : [...(prevVideos || []), ...videosData]
                );
                setHasMoreVideos(!!response.data.pagination?.nextPage);
                setVideoCurrentPage(pageNumber + 1);
            }
        } catch (error) {
            console.error("Error fetching explore videos", error);
            setHasMoreVideos(false);
        } finally {
            setLoading(false);
        }
    };

    // ⭐ Effect for IMAGES when sort/top changes
    useEffect(() => {
        if (activeTab === "images") {
            setImages([]);
            setImageCurrentPage(1);
            setHasMoreImages(true);
            getImages(1, true);
        }
    }, [sort, top, activeTab]); // ⭐ Only affects images

    // ⭐ Effect for VIDEOS when switching to video tab (independent of sort/top)
    useEffect(() => {
        if (activeTab === "videos") {
            // Only fetch if videos array is empty (first time loading videos tab)
            if (videos.length === 0) {
                setVideoCurrentPage(1);
                setHasMoreVideos(true);
                getVideos(1, true);
            }
        }
    }, [activeTab]); // ⭐ Only depends on activeTab

    // ⭐ Load next page when user reaches bottom
    useEffect(() => {
        if (!inView || loading) return;

        if (activeTab === "images" && hasMoreImages) {
            getImages(imageCurrentPage);
        } else if (activeTab === "videos" && hasMoreVideos) {
            getVideos(videoCurrentPage);
        }
    }, [inView, activeTab]);

    const handleImageClick = (published_id) => {
        Navigate(`/explore/image/${published_id}`);
    };

    const handleVideoPlay = (video) => {
        setSelectedVideo(video);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedVideo(null), 300);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        if (images.length > 0 && activeTab === "images") {
            const grid = document.querySelector(".explore-image-masonry");
            if (grid) {
                imagesLoaded(grid, () => {
                    console.log("All images loaded, reflowing Masonry...");
                });
            }
        }
    }, [images, activeTab]);

    return (
        <div className="mt-5 explore-page-container">
            <div className="explore-header-section">
                <div className="explore-heading text-start">
                    <h1>Explore</h1>
                </div>

                <div className="explore-tabs-wrapper">
                    <div className="explore-tabs">
                        <button
                            onClick={() => handleTabChange("images")}
                            className={`explore-tab ${activeTab === "images" ? "active" : ""}`}
                        >
                            Images
                        </button>
                        <button
                            onClick={() => handleTabChange("videos")}
                            className={`explore-tab ${activeTab === "videos" ? "active" : ""}`}
                        >
                            Videos
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === "images" && (
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
            )}

            <div className="explore-body">
                {activeTab === "images" ? (
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
                ) : (
                    <div className="explore-video-container">
                        {(!videos || videos.length === 0) && !loading ? (
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
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                                        <line x1="7" y1="2" x2="7" y2="22"></line>
                                        <line x1="17" y1="2" x2="17" y2="22"></line>
                                        <line x1="2" y1="12" x2="22" y2="12"></line>
                                        <line x1="2" y1="7" x2="7" y2="7"></line>
                                        <line x1="2" y1="17" x2="7" y2="17"></line>
                                        <line x1="17" y1="17" x2="22" y2="17"></line>
                                        <line x1="17" y1="7" x2="22" y2="7"></line>
                                    </svg>
                                </div>
                                <h3 className="empty-state-title">No Videos Yet Published</h3>
                                <p className="empty-state-description">
                                    Be the first to share your creative videos with the community
                                </p>
                            </div>
                        ) : (
                            <div className="explore-video-grid">
                                {videos.map((video, index) => (
                                    <VideoCard
                                        key={`${video.id}-${index}`}
                                        video={video}
                                        onPlay={handleVideoPlay}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {loading && <p className="text-center my-4">Loading more {activeTab}...</p>}

            <div ref={ref} style={{ height: "10px", background: "transparent" }}></div>

            <ExploreVideoPlayerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                video={selectedVideo}
            />
        </div>
    );
}

export default ExplorePage;
