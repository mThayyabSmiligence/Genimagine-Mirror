import React, { useEffect, useState } from 'react'
import '../../Css/Reports.css'
import { axiosModerator } from '../../API\'s/axios';
import ReportImageCard from '../../Components/CommonComponents/ReportImageCard';

export default function Reports() {

    const [reportedImages, setReportedImages] = useState([]);
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

    useEffect(() => {
        reportedImagesList();
    },[])


  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">REPORTED IMAGES</h3>
      {loading ? (
        <p>Loading reported images...</p>
      ) : reportedImages.length === 0 ? (
        <p>No reported images found.</p>
      ) : (
        <div className="d-flex flex-wrap gap-6 justify-start">
          {reportedImages.map((report) => (
            <ReportImageCard
              key={report.report_id}
              report={report}
            />
          ))}
        </div>
      )}
    </div>
  )
}
























// {loading ? (
//     <p>Loading reported images...</p>
//     ) : reportedImages.length === 0 ? (
//         <p>No reported images found.</p>
//     ) : (
//     <div className="table-responsive mx-5">
//       <table className="table table-bordered table-striped">
//         <thead className="table-dark">
//           <tr>
//             <th>Reported Image</th>
//             <th>Report ID</th>
//             <th>Image ID</th>
//             <th>Prompt</th>
//             <th>Caption</th>
//             <th>Upload By</th>
//             {/* <th>Report Details</th> */}   
//             <th>Report Count</th>
//             <th>Action Type</th>    
//             {/* <th>Warning Data</th> */}
//           </tr>
//         </thead>
//         <tbody>
//           {reportedImages.map((report) => (
//             <tr key={report.report_id}>
//               <td><img src={report.generation_image_url} className='reported-image'/></td>
//               <td>{report.report_id}</td>
//               <td>{report.image_id}</td>
//               <td>{report.prompt}</td>
//               <td>{report.caption || "-"}</td>
//               <td>{report.uploader_username}</td>
//               {/* <td>{report.report_details}</td> */}
//               <td>{report.report_count}</td>
//               <td>{report.action_type}</td>
//               {/* <td>{report.warning_data || 'N/A'}</td> */}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   )}