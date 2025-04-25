import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { axiosModerator, axiosPrivate } from '../../API\'s/axios';
import '../../Css/ReportImageDetail.css'
import SuspendPopUp from '../../Components/CommonComponents/SuspendPopUp';
import dayjs from 'dayjs'; 
import WarnPopUp from '../../Components/CommonComponents/WarnPopUp';
import DeleteReportImagePopUp from '../../Components/CommonComponents/DeleteReportImagePopUp';

const ReportedImageDetail = () => {
  const navigate = useNavigate();
  const { report_id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showWarnPopUp, setShowWarnPopUp] = useState(false);
  const [showSuspendPopup, setShowSuspendPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [reason, setReason] = useState('');
  const [suspendDate, setSuspendDate] = useState(dayjs()); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // const [showSuspendPopup, setShowSuspendPopup] = useState(false);
  // const [actionStatus, setActionStatus] = useState({ type: '', message: '' });
  // const [suspendMinutes, setSuspendMinutes] = useState('');
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchReportDetails = async () => {
    try {
      const res = await axiosModerator.post(`getreportdetail/${report_id}`);
      console.log('Report details now:', res.data);
      setReport(res.data?.reportDetails[0]|| {});
      setError('');
    } catch (err) {
      console.error('Error fetching report details:', err);
      setError('Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [report_id,user]);

  useEffect(() => {
    if (report?.uploader_id) {
      getUserDetails(report.uploader_id);
    }
  }, [report?.uploader_id]);

  // const takeAction = async (action) => {
  //   try {
  //     setActionStatus({ type: 'info', message: 'Processing...' });
      
  //     const urlMap = {
  //       ban: `/api/moderator/${report?.uploader_id}/ban`,
  //       warn: `/api/moderator/${report?.uploader_id}/warn`,
  //       suspend: `/api/moderator/${report?.uploader_id}/suspend`,
  //       delete: `/api/moderator/delete-reported-image/${report?.image_id}`
  //     };

  //     const body = action === 'suspend'
  //       ? { minutes: suspendMinutes, reason: 'Suspended by moderator' }
  //       : action === 'warn'
  //       ? { reason: 'Warned by moderator' }
  //       : {};

  //     const res = await axios.post(urlMap[action], body);
  //     setActionStatus({ type: 'success', message: res.data.message });
      
  //     // Refresh report data after action
  //     if (action === 'delete') {
  //       setReport(prev => ({ ...prev, generation_image_url: null, explore_image_url: null }));
  //     }
  //   } catch (err) {
  //     setActionStatus({ type: 'danger', message: err.response?.data?.message || 'Action failed' });
  //     console.error(err);
  //   }
  // };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="container mt-5">
      <div className={`alert alert-${error ? 'danger' : 'success'}`} role="alert">
        {error}
      </div>
    </div>
  );

  if (!report) return (
    <div className="container mt-5">
      <div className="alert alert-warning" role="alert">
        No report found
      </div>
    </div>
  );

  const getUserDetails = async (uploader_id) => {
    try{
        const response = await axiosModerator.get(`${uploader_id}/getuser`)
        console.log(response.data)
        setUser(response.data.user)
    }catch(err){
      console.error("Error fetching user details:", error);
      alert("Failed to fetch user details.");   
    }
  }

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

const handleBanUser = async () => {
  if (!user) {
    alert("User details not loaded.");
    return;
  }

  if (user.status === "banned") {
    alert("User is already banned.");
    return;
  }

  if (user.status === "deleted") {
    alert("Cannot ban a deleted user.");
    return;
  }
  try {
      const response = await axiosModerator.post(`report/${report.report_id}/ban`);
      alert("User has been banned.");
      setUser((prev) => ({ ...prev, status: "banned" }));
      console.log(response.data);
  } catch (error) {
      console.error("Error banning user:", error);
      alert("Failed to ban user.");
  }
};

const handleSuspendUser = async () => {
  if (!user) {
    alert("User details not loaded.");
    return;
  }

  if (user.status === "banned") {
    alert("Cannot suspend a banned user.");
    return;
  }

  if (user.status === "deleted") {
    alert("Cannot suspend a deleted user.");
    return;
  }

  if (!reason.trim()) {
    alert("Please provide a reason for suspension.");
    return;
  }
  try {
    const pickedDate = new Date(suspendDate.$d);

    // Current time
    const now = new Date();
    console.log(now)

    // Difference in milliseconds
    const diffMs = pickedDate-now;

    // Convert milliseconds to minutes
    const diffMinutes = Math.floor(diffMs / 60000);

    console.log(`Difference in minutes: ${diffMinutes}`);

    if (diffMinutes <= 0) {
      alert("Please select a valid suspension date.");
      return;
    }

      const response = await axiosModerator.post(`/report/${report.report_id}/suspend`, {
          minutes: diffMinutes,
          reason,
      });
      alert("User has been suspended.");
      setUser((prev) => ({ ...prev, status: "suspended" }));
      setShowSuspendPopup(false);
      console.log(response.data);
  } catch (error) {
      console.error("Error suspending user:", error);
      alert("Failed to suspend user.");
  }
};

const handleWarnUser = async () => {
    if (!user) {
      alert("User details not loaded.");
      return;
    }
  
    if (["banned", "suspended", "deleted"].includes(user.status)) {
      alert(`Cannot warn a user who is ${user.status}.`);
      return;
    }
  
    if (!reason.trim()) {
      alert("Please provide a reason for warning.");
      return;
    }

    try {
        const response = await axiosModerator.post(`/report/${report.report_id}/warn`, { reason });
        alert("User has been warned.");
        console.log(response.data);
        setUser((prevUser) => ({
          ...prevUser,
          warning_data: {
            ...prevUser.warning_data,
            count: (prevUser.warning_data?.count || 0) + 1, // Increment warning count
          },
        }));
        console.log(user);
        setShowWarnPopUp(false);
        console.log(response.data);
    } catch (error) {
        console.error("Error warning user:", error);
        alert("Failed to warn user.");
    }
};

const handleNoAction = async () => {
  if (!report) {
    alert("Report details not loaded.");
    return;
  }

  if (report.action_type === "no_action") {
    alert("This report is already marked as no action.");
    return;
  }

  try {
    const response = await axiosModerator.post(`/report/${report.report_id}/no-action`);
    if (response.data.success) {
      alert("Report marked as no action.");
      console.log(response.data);

      // Update the report state to reflect the no-action status
      setReport((prevReport) => ({
        ...prevReport,
        action_type: "no_action",
      }));
      navigate('/moderator/reports'); 
    } else {
      alert("Failed to mark report as no action.");
    }
  } catch (error) {
    console.error("Error marking report as no action:", error);
    alert("Failed to mark report as no action.");
  }
};

const handleDeleteImage = async (reason) => {
  if (!report?.image_id || !report?.published_id || !report?.generation_image_url) {
    alert("Required image information is missing.");
    return;
  }

  try {
    const response = await axiosModerator.post(`/report/image/delete/${report.report_id}`, {
      image_id: report.image_id,
      published_id: report.published_id,
      image_path: report.image_path,
      reason,
    });

    alert("Image has been deleted successfully.");
    console.log(response.data);

    // Optional: update state to show "Image has been deleted"
    setReport((prev) => ({
      ...prev,
      generation_image_url: null,
      explore_image_url: null,
    }));
    setShowDeletePopup(false);
    navigate('/moderator/reports'); 
  } catch (error) {
    console.error("Error deleting image:", error);
    alert("Failed to delete image.");
  }
};

  return (
    <div className="container p-6">
      <h2 className="mb-4 text-start">Reported Image Review</h2>
      
      <div className="row mt-4">
        {/* Left column - Image and Uploader Details */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Reported Content</h5>
            </div>
            <div className="card-body">
              {report.generation_image_url || report.explore_image_url ? (
                <img
                  src={report.generation_image_url || report.explore_image_url}
                  alt="Reported content"
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: '400px', width: 'auto' }}
                />
              ) : (
                <div className="alert alert-info">Image has been deleted</div>
              )}

              <div className="content-details"> 
                <div className="mb-2">
                  <span className="fw-bold d-flex mb-1">Prompt:</span>
                  <div className='prompt-container border'>                 
                    <p className="text-muted">{report.image_prompt || 'No prompt available'}</p>
                  </div> 
                </div>
                <div className="mb-2">
                  <span className="fw-bold d-flex mb-1">Caption:</span> 
                  <div className='caption-container border'>
                    <p className="text-muted">{report.explore_caption || 'No caption available'}</p>
                  </div>
                </div>  

                <div className="mb-2 d-flex">
                  <p className="fw-bold ">Image ID</p> 
                  <span className='ms-3'>:</span>
                  <p className='ms-3'>{report.image_id}</p>
                </div>
              </div>
              
              <hr />

              <div className="uploader-details text-start row">
                <h5 className="mb-3 col-12">Uploader Information</h5>

                <div className="uploader-info col-12 col-md-6 col-md-mb-3">
                  <div className="mb-2" title='view user detail'>
                    <span className="fw-bold">Username:</span> <Link to={`/moderator/user-Detail/${report.uploader_id}`} className='link' >{report.uploader_username || 'N/A'}</Link>
                  </div>
                  <div className="mb-2">
                    <span className="fw-bold">User ID:</span> {report.uploader_id || 'N/A'}
                  </div>
                </div>

                <div className="uploader-info col-12 col-md-6 mb-3">
                  <div className="mb-2">
                    <span className="fw-bold">Warnings:</span>
                    <span className={`badge ${report.warning_data?.count ? 'bg-warning' : 'bg-secondary'} ms-2`}>
                      {report.warning_data?.count || 0}
                    </span>
                  </div>

                  {/* <Link to={`/moderator/user-Detail/${report.uploader_id }`} className='uploader-view-detail-link text-danger link '>view-details</Link> */}
                </div>
              </div>    
            </div>
          </div>
        </div>

        {/* Right column - Report Details and Actions */}
        <div className="col-lg-6 report-detail-container">
            <div className="report-details-header mb-3">
              <h5 className="mb-0">REPORTS</h5>
            </div>

            <div className="scrollable-report-details">
              <div className="card-body report-details-card">
              {report.report_details && report.report_details.length > 0 ? (
              report.report_details.map((r, index) => (
                <div key={index} className="border rounded inner-card-detail">
                  <div className="user-id-tag-container d-flex justify-content-between align-items-center pb-1 mb-2">
                    <Link title='view user detail' to={`/moderator/user-Detail/${r.user_id}`} className="user-id-tag d-flex align-items-center link">{r.username || `user name not found`}</Link> 
                    <div>
                      <span>{r.reported_at.split('T')[0] || 'N/A'}</span>   
                    </div>
                  </div>
                  <div className="mb-2 text-start">
                    <span className="fw-bold">Reason:</span> {r.reason}
                  </div>
                </div>
               ))
              ) : (
                <div className="text-muted">No reports found.</div>
              )}
              </div>
            </div>
          
            <div className="action-dropdown-container justify-content-between me-4 mt-3">
            <button
              type="button"
              className="no-action-btn me-2"
              onClick={handleNoAction}
              disabled={report?.action_type === "no_action"}
            >
              No Action
            </button>
            
            <div className="dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="dropdown-toggle report-action-button"
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
              >
                Select Action
              </button>

              {dropdownOpen && (
                <ul className="dropdown-menu p-0" aria-labelledby="actionDropdown">
                      <li>
                        <button
                          type="button"
                          className="dropdown-item text-danger"
                          onClick={() => handleBanUser(report.report_id)}
                          disabled={user?.status === "banned" || user?.status === "deleted"}
                        >
                          Ban User
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="dropdown-item text-warning"
                          onClick={() => setShowSuspendPopup(true)}
                          disabled={["banned", "deleted", "suspended"].includes(user?.status)}
                        >
                          Suspend User
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="dropdown-item text-secondary"
                          onClick={() => setShowWarnPopUp(true)}
                          disabled={["banned", "deleted", "suspended"].includes(user?.status)}
                        >
                          Warn User
                        </button>
                      </li>
                  {report?.image_id && (
                    <li>
                      <button
                        type="button"
                        className="dropdown-item text-danger"
                        onClick={() => setShowDeletePopup(true)}
                      >
                        Delete Image
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      {showSuspendPopup && (
        <SuspendPopUp
            onHide={() => setShowSuspendPopup(false)}
            handleSuspendUser={handleSuspendUser}
            showSuspendPopup={showSuspendPopup}
            suspendDate={suspendDate}
            setSuspendDate={setSuspendDate}
            reason={reason}
            setReason={setReason}
        />
      )}

      {showWarnPopUp && (
          <WarnPopUp
              onHide={() => setShowWarnPopUp(false)}
              handleWarnUser={handleWarnUser}
              reason={reason}
              showWarnPopUp = {showWarnPopUp}    
              setReason={setReason}
          />
      )}
      {showDeletePopup && (
        <DeleteReportImagePopUp
          onHide={() => setShowDeletePopup(false)}
          handleDeleteImage={handleDeleteImage}
          showDeletePopUp={showDeletePopup}
        />
        
      )}
    </div>
  );
};

export default ReportedImageDetail;