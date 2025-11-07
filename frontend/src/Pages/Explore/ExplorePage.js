import React, { useContext, useState } from "react";
import "../../Css/ExplorePage.css";
import ExploreImages from "../../Components/Explore/ExploreImages";
import ExploreVideos from "../../Components/Explore/ExploreVideos";
import AuthContext from "../../Context/AuthProvider";


function ExplorePage() {
    const [activeTab, setActiveTab] = useState("images");
    const {loggedIn}= useContext(AuthContext);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

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

            <div className="explore-body">
                {activeTab === "images" ? <ExploreImages /> : <ExploreVideos loggedIn = {loggedIn}/>}
            </div>
        </div>
    );
}

export default ExplorePage;
