import React, { useEffect, useState } from "react";
import { axiosNoAUth } from "../../API's/axios";
import { useInView } from "react-intersection-observer";
import VideoCard from "../../Components/Explore/VideoCard";
import VideoGenerationModal from "../../Components/StoriesComponent/VideoGenerationModal";

function ExploreVideos({loggedIn}) {
    const [videos, setVideos] = useState([]);
    const [videoCurrentPage, setVideoCurrentPage] = useState(1);
    const [hasMoreVideos, setHasMoreVideos] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { ref, inView } = useInView();

    // Fetch Explore Videos
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

    // Initial fetch when component mounts
    useEffect(() => {
        if (videos.length === 0) {
            setVideoCurrentPage(1);
            setHasMoreVideos(true);
            getVideos(1, true);
        }
    }, []);

    // Load next page when user reaches bottom
    useEffect(() => {   
        if (inView && !loading && hasMoreVideos) {
            getVideos(videoCurrentPage);
        }
    }, [inView]);

    const handleVideoPlay = (video) => {
        setSelectedVideo(video);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedVideo(null), 300);
    };

    return (
        <>
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
                                loggedIn = {loggedIn}
                            />
                        ))}
                    </div>
                )}
            </div>

            {loading && <p className="text-center my-4">Loading more videos...</p>}

            <div ref={ref} style={{ height: "10px", background: "transparent" }}></div>

            <VideoGenerationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                videoData={selectedVideo}
                storyId={selectedVideo?.story_id} 
            />
        </>
    );
}

export default ExploreVideos;
