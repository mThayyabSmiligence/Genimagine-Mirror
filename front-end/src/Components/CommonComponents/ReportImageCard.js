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
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <h3 className='h-3 text-lg font-semibold text-gray-900 m-0 text-start'>ID: {report.image_id}</h3>
          <div className='report-detail'>
              <h3 className='h-3 font-semibold'>{report.reported_at.split('T')[0]}</h3>
          </div>
        </div>
        
        {/* <div className='report-detail'>
            <p><strong>Prompt:</strong></p>
            <span>{truncateString(report.prompt)}</span>
        </div> */}

                <div className="mb-2">
                  <span className="d-flex mb-1 prompt-container-text details-title">Prompt:</span>
                  <div className='prompt-container-box border'>                 
                    <p>{report.prompt || 'No prompt available'}</p>
                  </div> 
                </div>

        {/* <div className='report-detail m-2'>
          <p><strong>Prompt:</strong></p>
          <div className="prompt-box">
            {report.prompt || 'No prompt available'}
          </div>
        </div> */}

        <div className='report-detail'>
            <p className='details-title'>Report Count:</p>
            <span>{report.report_count}</span>
        </div>

        <div className='report-detail'>
            <p className='details-title'>Report ID:</p>
            <span>{report.report_id}</span>
        </div>

        

      <div className="action-buttons">
        <Link to={`/moderator/report-image-detail/${report.report_id}`} className="review-btn link w-100">Review</Link>
      </div>
    </div>
  </div>
  )
}

export default ReportImageCard