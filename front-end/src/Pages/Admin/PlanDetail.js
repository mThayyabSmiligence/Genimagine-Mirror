// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom';
// import { axiosAdmin } from '../../API\'s/axios';

// export default function PlanDetail() {
//     const [planDetail, setPlanDetail] = useState(null);
//     const {packageId} = useParams();

//     useEffect(() => {
//         if(packageId){
//             getPlanData(packageId);
//         }
//     }, [packageId]);

//     const getPlanData = async() =>{
//         try{
//             const response = await axiosAdmin.post(`plan/${packageId}`)
//             console.log("plan detail response", response.data.rows)
//             setPlanDetail(response.data.rows)
//         }catch(error){
//             console.error("Failed to fetch plan data", error);
//         }
//     }
//   return (
//     <div>PlanDetail</div>
//   )
// }

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosAdmin } from '../../API\'s/axios';
import '../../Css/PlanDetail.css'

export default function PlanDetail() {
  const [planDetail, setPlanDetail] = useState(null);
  const { packageId } = useParams();

  useEffect(() => {
    if (packageId) {
      getPlanData(packageId);
    }
  }, [packageId]);

  const getPlanData = async () => {
    try {
      const response = await axiosAdmin.post(`plan/${packageId}`);
      setPlanDetail(response.data.rows);
    } catch (error) {
      console.error('Failed to fetch plan data', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
  };

  if (!planDetail) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="container my-5 plan-detail-container">
        <div className="plan-detail-body">  

          <h5 className="plan-detail-heading-title text-start mb-4">Plan Details</h5>

          <div className="row gy-3 text-start">
            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted plan-id-data-text">ID</span>
              <span className='plan-data-value'>{planDetail.package_id}</span>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted package-name-data-text">Package Name</span>
              <span className='plan-data-value'>{planDetail.package_name}</span>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted credits-data-text">Credits</span>
              <span className='plan-data-value'>{planDetail.credits}</span>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted validity-data-text">Validity</span>
              <span className='plan-data-value'>{planDetail.validity_days} Day's</span>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted description-data-text">Description</span>
              <p className="mb-0 text-end plan-data-value">{planDetail.description === 'none' ? 'No description available.' : planDetail.description}</p>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted cost-data-text">Cost</span>
              <span className='plan-data-value'>{parseFloat(planDetail.cost).toFixed(2)}</span>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted currency-data-text">Currency</span>
              <span className='plan-data-value'>{planDetail.currency}</span>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted status-data-text">Status</span>
              <span className= {`${planDetail.is_active ? 'text-success' : 'text-danger'} plan-data-value`}>
                {planDetail.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted allow-renewal-data-text">Allow Renewal</span>
              <span className='plan-data-value'>{planDetail.allow_renewal ? 'Yes' : 'No'}</span>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted allow-topup-data-text">Allow Top up</span>
              <span className='plan-data-value'>{planDetail.is_latest ? 'Yes' : 'No'}</span>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted created-at-data-text">Created At</span>
              <span className='plan-data-value'>{formatDate(planDetail.created_at)}</span>
            </div>

            <div className="col-12 d-flex justify-content-start">
              <span className="text-muted updated-at-data-text">Updated At</span>
              <span className='plan-data-value'>{formatDate(planDetail.updated_at)}</span>
            </div>
          </div>

          <div className="text-center back-button-container">
            <button className="back-btn" onClick={() => window.history.back()}>
              ← Back
            </button>
          </div>   
        </div>
    </div>
  );
}
