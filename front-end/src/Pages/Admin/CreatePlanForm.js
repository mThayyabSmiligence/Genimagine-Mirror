import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { axiosAdmin } from '../../API\'s/axios';
import '../../Css/CreatePlanForm.css'
import Select from 'react-select';

const currencyOptions = [
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
];

const validityOptions = [
  { value: 1, label: '1 Days' },
  { value: 2, label: '2 Days' },
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
];

export default function CreatePlanForm({ isEditMode = false }) {
    const navigate = useNavigate();

    const [packageName, setPackageName] = useState('test 2');
    const [description, setDescription] = useState('new test package');
    const [cost, setCost] = useState('10.00');
    const [credits, setCredits] = useState('10');
    const [isRenewal, setIsRenewal] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const { packageId } = useParams(); 
    const [planData, setPlanData] = useState(null);
    

    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [selectedValidity, setSelectedValidity] = useState(null);

      useEffect(() => {
        console.log("hello edit mode", packageId+" "+ isEditMode)
        if (isEditMode && packageId) {
             axiosAdmin.post(`plan/${packageId}`)
               .then(res => {
                 setPlanData(res.data.rows);
                 console.log("res data", res.data.rows)
               })
               .catch(err => {
                 console.error("Failed to fetch model data:", err);
               });
           }
      }, [isEditMode, packageId])

      useEffect(() =>{
        if (planData) {
          setPackageName(planData.package_name || '');
          setDescription(planData.description || '');
          setCredits(planData.credits || '');
          setCost(planData.cost || '');
          setIsRenewal(planData.allow_renewal || false);
          setIsActive(planData.is_active || true);
          setSelectedCurrency(currencyOptions.find(opt => opt.value === planData.currency) || null);
          setSelectedValidity(validityOptions.find(opt => opt.value === planData.validity_days) || null);
        }
      })

      const handleSubmit = async () => {
        const planData = {
          package_name: packageName,
          description: description,
          credits: credits,
          cost: cost, 
          currency: selectedCurrency ? selectedCurrency.value : '',
          allow_renewal: isRenewal,
          is_active: isActive,
          validity_days: selectedValidity ? selectedValidity.value : 0
        }

        try{
          const response = isEditMode
          ? await axiosAdmin.post(`/edit/plan/${packageId}`, planData)
          : await axiosAdmin.post('create-plan',planData); 

          if (response.status === 200 || response.status === 201) {
          navigate("/admin/plans-management");
          }
        }catch(error){
          console.log("Error saving model:", error)
          alert("Server error occurred")
        }
      }
    
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
                        <input value={cost} onChange={(e) => setCost(e.target.value)} type="text" className="form-control cost-box" placeholder="Enter cost" aria-label="Cost" id="Cost" />
                    </div>

                    <div className="mb-3">
                      <label className="form-label currency-text required-label">Currency</label>
                      <Select
                        options={currencyOptions}
                        value={selectedCurrency}
                        onChange={setSelectedCurrency}
                        placeholder="Select Currency"
                        className="currency-select text-start"
                        classNamePrefix="select"
                      />
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

                    <div className="mb-3">
                      <label className="form-label validity-text required-label">Validity Days</label>
                      <Select
                        options={validityOptions}
                        value={selectedValidity}
                        onChange={setSelectedValidity}
                        placeholder="Select Validity (in days)"
                        className="validity-select text-start"
                        classNamePrefix="select"
                      />
                    </div>

                    <div className="submit-create-model-container d-flex justigy-content-start align-items-center mt-4 gap-2">
                        <button className="create-model-btn" onClick={() => navigate("/admin/plans-management")}>back</button>
                        <button className="create-model-btn" onClick={handleSubmit}>{isEditMode ? "Edit" : "Create"}</button>    
                    </div>
              
                </div>
            </div>
        </div>
    </div>
  )
}