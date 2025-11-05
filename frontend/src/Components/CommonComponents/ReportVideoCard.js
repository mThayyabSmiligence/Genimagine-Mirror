import React from 'react';
import { Link } from 'react-router-dom';

function ReportVideoCard({ report }) {
  const getStatusBadge = (actionType) => {
    switch (actionType) {
      case 'warn':
        return { label: 'Warned', className: 'badge-warn' };
      case 'suspend':
        return { label: 'Suspended', className: 'badge-suspend' };
      case 'ban':
        return { label: 'Banned', className: 'badge-ban' };
      case 'delete':
        return { label: 'Deleted', className: 'badge-delete' };
      case 'no_action':
        return { label: 'No Action', className: 'badge-no-action' };
      case 'none':
      default:
        return { label: 'Pending Review', className: 'badge-pending' };
    }
  };

  const { label, className } = getStatusBadge(report.action_type);

  const formatDate = (dateString) => {
    return dateString.split('T')[0];
  };

  const getPromptText = () => {
    if (report.report_details && report.report_details.length > 0) {
      const firstReport = report.report_details[0];
      return `Reported by ${firstReport.username} for ${firstReport.reason}`;
    }
    return 'No details available';
  };

  return (
    <div className="report-card">
      <div className="report-image-container">
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Video ID: {report.video_id}</span>
        </div>
        <span className={`status-badge ${className}`}>{label}</span>
      </div>
      
      <div className="report-details">
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <h3 className='h-3 text-lg font-semibold text-gray-900 m-0 text-start'>ID: {report.video_id}</h3>
          <div className='report-detail'>
            <h3 className='h-3 font-semibold'>{formatDate(report.reported_at)}</h3>
          </div>
        </div>

        <div className="mb-2">
          <span className="d-flex mb-1 prompt-container-text details-title">Prompt:</span>
          <div className='prompt-container-box border'>
            <p>{getPromptText()}</p>
          </div>
        </div>

        <div className='report-detail'>
          <p className='details-title'>Report Count:</p>
          <span>{report.report_count}</span>
        </div>

        <div className='report-detail'>
          <p className='details-title'>Report ID:</p>
          <span>{report.report_id}</span>
        </div>

        <div className="action-buttons">
          <Link to={`/moderator/report-video-detail/${report.report_id}`} className="review-btn link w-100">
            Review
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ReportVideoCard;
