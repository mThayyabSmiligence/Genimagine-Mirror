import React from 'react'
import '../../Css/Reports.css'
import { Link } from 'react-router-dom'

function ReportImageCard({report}) {

    const truncateString=(str)=> {
        return str.length > 20 ? str.substring(0, 17) + "..." : str;
    }

  return (
    <div className="report-card">
    <div className="image-container">
      <img src={report.image_url || '/placeholder.png'} alt="Reported" />
      <span className="status-badge">Pending review</span>
    </div>
    <div className="report-details">
        <h3 className='text-lg font-semibold text-gray-900 mb-2 text-start'>Reported Image: {report.image_id}</h3>
        
        <div className='report-detail'>
            <p><strong>Prompt:</strong></p>
            <span>{truncateString(report.prompt)}</span>
        </div>

        <div className='report-detail'>
            <p> <strong>Report Count:</strong></p>
            <span>{report.report_count}</span>
        </div>

        <div className='report-detail'>
            <p><strong>Report ID:</strong></p>
            <span>{report.report_id}</span>
        </div>

        <div className='report-detail'>
            <p><strong>Initail Report at:</strong></p>
            <span>{report.reported_at.split('T')[0]}</span>
        </div>

        <div className='report-detail'>
            <p><strong>Action Type:</strong></p>
            <span>{report.action_type}</span>
        </div>

      <div className="action-buttons">
        <Link to={`/moderator/report-image-detail/${report.report_id}`} className="review-btn link w-100">Review</Link>
      </div>
    </div>
  </div>
  )
}

export default ReportImageCard