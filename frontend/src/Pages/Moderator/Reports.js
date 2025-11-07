import React, { useEffect, useState } from 'react'
import '../../Css/Reports.css'
import { axiosModerator } from '../../API\'s/axios';
import ReportImageCard from '../../Components/CommonComponents/ReportImageCard';
import ReportVideoCard from '../../Components/CommonComponents/ReportVideoCard';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('images');
  const [reportedImages, setReportedImages] = useState([]);
  const [reportedVideos, setReportedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const reportedImagesList = async() => {
    try{
      const response = await axiosModerator.post('getreportedimages')
      setReportedImages(response.data.data)
      console.log(response.data.data)
    }catch (error) {
      console.error('Error fetching reported images:', error);
    } finally {
      setLoading(false);
    }     
  }

  const reportedVideosList = async() => {
    try{
      const response = await axiosModerator.get('/reported-videos')
      setReportedVideos(response.data.reports)
      console.log(response.data.reports)
    }catch (error) {
      console.error('Error fetching reported videos:', error);
    } finally {
      setLoading(false);
    }     
  }

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'images') {
      reportedImagesList();
    } else {
      reportedVideosList();
    }
  }, [activeTab])

  return (
    <div className="p-6">

       <h3 className="text-2xl font-bold text-gray-800 mb-6">
        {activeTab === 'images' ? 'REPORTED IMAGES' : 'REPORTED VIDEOS'}
      </h3>

      {/* Tab Switcher */}
      <div className='d-flex justify-content-start ms-3 mt-4'> 
        <div className="tab-switcher mb-6">
          <button
            className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            Images
          </button>
          <button
            className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading reported {activeTab}...</p>
      ) : activeTab === 'images' ? (
        reportedImages.length === 0 ? (
          <p>No reported images found.</p>
        ) : (
          <div className="d-flex flex-wrap gap-6 justify-start mt-3">
            {reportedImages.map((report) => (
              <ReportImageCard key={report.report_id} report={report} />
            ))}
          </div>
        )
      ) : reportedVideos.length === 0 ? (
        <p>No reported videos found.</p>
      ) : (
        <div className="d-flex flex-wrap gap-6 justify-start mt-3">
          {reportedVideos.map((report) => (
            <ReportVideoCard key={report.report_id} report={report} />
          ))}
        </div>
      )}
    </div>
  )
}
