import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { axiosModerator } from '../../API\'s/axios';
import '../../Css/ReportImageDetail.css'

const ReportedImageDetail = () => {
  const { report_id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [actionStatus, setActionStatus] = useState({ type: '', message: '' });
  // const [suspendMinutes, setSuspendMinutes] = useState('');

  useEffect(() => {
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
    fetchReportDetails();
  }, [report_id]);

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
                  <div className="mb-2">
                    <span className="fw-bold">Username:</span> {report.uploader_username || 'N/A'}
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
            <div className="card-body">
              <div className='report-details-card'>
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
          
        </div>
      </div>
    </div>
  );
};

export default ReportedImageDetail;