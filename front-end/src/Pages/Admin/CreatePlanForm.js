import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { axiosAdmin } from '../../API\'s/axios';
import '../../Css/CreatePlanForm.css'

export default function CreatePlanForm({ isEditMode = false }) {

    const [packageName, setPackageName] = useState('');
    const [description, setDescription] = useState('');
    const [credits, setCredits] = useState('');
    const [isRenewal, setIsRenewal] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const { packageId } = useParams(); 
    const [planData, setPlanData] = useState(null);
    
      useEffect(() => {
        if (isEditMode && packageId) {
          axiosAdmin.post(`/plan/${packageId}`)
            .then(res => {
              setPlanData(res.data.rows);
              console.log("res data", res.data.rows)
            })
            .catch(err => {
              console.error("Failed to fetch model data:", err);
            });
        }
      }, [isEditMode, packageId]);
    
  return (
    <div className="container mt-5 ">
        <div className="row justify-content-center align-items-center">
            <div className="col-12 col-md-10 col-lg-8">
                <div className="plan-create-form p-4">
                    <div className="form-title">
                        <p className="form-title-text d-flex justify-contengt-start">
                            {isEditMode ? "Edit plan" : "Create Plan"}
                            {/* Create Plan */}
                        </p>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="package-name" className="form-label package-name-text required-label">Model Name</label>
                        <input value={packageName} onChange={(e) => setPackageName(e.target.value)} type="text" className="form-control package-name-box" placeholder="Enter Package Name" aria-label="package name" id="package-name" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="credits" className="form-label credits-text required-label">Credits</label>
                        <input value={credits} onChange={(e) => setCredits(e.target.value)} type="text" className="form-control credits-box" placeholder="Enter Credits" aria-label="credits" id="credits" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label description-text required-label">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-control description-box" placeholder="Description" aria-label="Model description" id="description" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="cost" className="form-label cost-text required-label">Cost</label>
                        <input value={credits} onChange={(e) => setCredits(e.target.value)} type="text" className="form-control cost-box" placeholder="Enter cost" aria-label="Cost" id="Cost" />
                    </div>

                    <div className='allow-renewal-switch-btn d-flex flex-column justify-content-between align-items-start mb-3'>
                      <label className="allow-renewal-btn-text mb-1">Allow Renewal</label>
                      <label className='switch kids-mode-switch'>
                        <input 
                        type="checkbox" 
                        checked={isRenewal}
                        onChange={(e) => setIsRenewal(e.target.checked)}
                        />
                        <span className='slider round'></span>
                      </label>
                  </div>
                    
                  

                <div className='plan-status-switch-btn d-flex flex-column justify-content-between align-items-start mb-3'>
                    <label className="plan-status-btn-text mb-1">Set Active</label>
                    <label className='switch kids-mode-switch'>
                      <input 
                      type="checkbox" 
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <span className='slider round'></span>
                    </label>
                </div>

                

                </div>
            </div>
        </div>
    </div>
  )
}