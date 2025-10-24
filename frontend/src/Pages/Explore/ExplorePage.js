import React, { useEffect, useState } from "react";
import SortSection from "../../Components/Explore/SortSection";
import { axiosNoAUth } from "../../API's/axios";
import "../../Css/ExplorePage.css";
import { useInView } from "react-intersection-observer";
import Masonry from "react-masonry-css";
import imagesLoaded from "imagesloaded";
import { useNavigate } from "react-router-dom";

function ExplorePage() {
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreImages, setHasMoreImages] = useState(true);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("images");

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
        if (sort == 'top' && top) query += `&time=${top}`;

        try {
            console.log("Fetching:", query);
            const response = await axiosNoAUth.get(`explore${query}`);
            console.log("Response:", response.data);

            if (response.data.success) {
                setImages((prevImages) => reset ? response.data.images : [...prevImages, ...response.data.images]);
                setHasMoreImages(!!response.data.pagination.nextPage);
                setCurrentPage(pageNumber + 1);
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
        if (!hasMoreImages || loading) return;

        setLoading(true);

        let query = `?page=${pageNumber}`;
        if (sort) query += `&sort=${sort}`;
        if (sort == 'top' && top) query += `&time=${top}`;

        try {
            console.log("Fetching videos:", query);
            const response = await axiosNoAUth.get(`explore/videos${query}`);
            console.log("Videos Response:", response.data);

            if (response.data.success) {
                setVideos((prevVideos) => 
                    reset ? response.data.videos : [...(prevVideos || []), ...response.data.videos]
                );
                setHasMoreImages(!!response.data.pagination.nextPage);
                setCurrentPage(pageNumber + 1);
            }
        } catch (error) {
            console.error("Error fetching explore videos", error);
            setHasMoreImages(false);
        } finally {
            setLoading(false);
        }
    };

    // Load first page when sort, top, or activeTab changes
    useEffect(() => {
        setImages([]);
        setVideos([]);
        setCurrentPage(1);
        setHasMoreImages(true);
        
        if (activeTab === "images") {
            getImages(1, true);
        } else {
            getVideos(1, true);
        }
    }, [sort, top, activeTab]);

    // Load next page when user reaches bottom
    useEffect(() => {
        if (inView && hasMoreImages && !loading) {
            if (activeTab === "images") {
                getImages(currentPage);
            } else {
                getVideos(currentPage);
            }
        }
    }, [inView]);

    const handleImageClick = (published_id) => {
        Navigate(`/explore/image/${published_id}`);
    };

    const handleVideoClick = (published_id) => {
        Navigate(`/explore/video/${published_id}`);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        if (images.length > 0 && activeTab === "images") {
            const grid = document.querySelector(".explore-image-masonry");
            imagesLoaded(grid, () => {
                console.log("All images loaded, reflowing Masonry...");
            });
        }
    }, [images]);

    return (
        <div className="mt-5 explore-page-container">
            <div className="explore-header-section">
                <div className="explore-heading text-start">
                    <h1>Explore</h1>
                </div>

                {/* Tab Switcher */}
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
                {activeTab === "images" ? (
                    <div className="explore-image-container">
                        <Masonry
                            breakpointCols={{ default: 4, 992: 3, 768: 2, 576: 1 }}
                            className="explore-image-masonry"
                            columnClassName="explore-image-column"
                        >
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className="explore-image col-6 col-md-4 col-lg-3 br-10"
                                    onClick={() => handleImageClick(image.published_id)}
                                >
                                    <img src={image.image_url} alt={image.caption} className="br-10 img-fluid shadow" />
                                </div>
                            ))}
                        </Masonry>
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
                                {videos && videos.map((video, index) => (
                                    <div
                                        key={index}
                                        className="explore-video-card"
                                        onClick={() => handleVideoClick(video.published_id)}
                                    >
                                        <div className="video-thumbnail-wrapper">
                                            <img
                                                src={video.thumbnail_url}
                                                alt={video.title}
                                                className="video-thumbnail"
                                            />
                                            <div className="video-overlay">
                                                <div className="play-button">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="64"
                                                        height="64"
                                                        viewBox="0 0 24 24"
                                                        fill="white"
                                                    >
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {video.duration && (
                                                <div className="video-duration">{video.duration}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Loading Spinner */}
            {loading && <p className="text-center my-4">Loading more {activeTab}...</p>}

            {/* Invisible div for detecting scroll */}
            <div ref={ref} style={{ height: "10px", background: "transparent" }}></div>
        </div>
    );
}

export default ExplorePage;