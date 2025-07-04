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

    const [packageName, setPackageName] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [credits, setCredits] = useState('');
    const [isRenewal, setIsRenewal] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const { packageId } = useParams(); 
    const [planData, setPlanData] = useState(null);
    const [allPlans, setAllPlans] = useState([]);
    

    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [selectedValidity, setSelectedValidity] = useState(null);

    const [formErrors, setFormErrors] = useState({});


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

     useEffect(() => {
      if (planData) {
        setPackageName(planData.package_name || '');
        setDescription(planData.description || '');
        setCredits(planData.credits || '');
        setCost(planData.cost || '');
        setIsRenewal(planData.allow_renewal);
        setIsActive(planData.is_active);
        setSelectedCurrency(currencyOptions.find(opt => opt.value === planData.currency) || null);
        setSelectedValidity(validityOptions.find(opt => opt.value === planData.validity_days) || null);
      }
    }, [planData]);  

     useEffect(() => {
      axiosAdmin.post('plans')
        .then(res => {
          setAllPlans(res.data.data || []);
        })
        .catch(err => {
          console.error("Failed to fetch all plans:", err);
        });
    }, []);

    const isEmptyOrWhitespace = (str) => {
      return !str || str.trim() === '';
    };

    const validateForm = () => {
      const errors = {};

      if (isEmptyOrWhitespace(packageName)) {
        errors.packageName = "*Package name is required.";
      }

      if (isEmptyOrWhitespace(description)) {
        errors.description = "*Description is required.";
      }

      if (!credits || isNaN(parseInt(credits))) {
        errors.credits = "*Valid credits number is required.";
      }

      if (!cost || isNaN(parseFloat(cost))) {
        errors.cost = "*Valid cost is required.";
      }

      if (!selectedCurrency) {
        errors.currency = "*Currency must be selected.";
      }

      if (!selectedValidity) {
        errors.validity = "*Validity must be selected.";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };


    const handleSubmit = async () => {
      if (!validateForm()) return;
      const planData = {
        package_name: packageName,
        credits: parseInt(credits),
        description: description,
        cost: cost, 
        currency: selectedCurrency ? selectedCurrency.value : '',
        allow_renewal: isRenewal ? 1: 0,
        is_active: isActive? 1 : 0,
        validity_days: selectedValidity ? selectedValidity.value : 0
      }

      if (!packageName.trim()) return alert("Package name is required");
      if (!description.trim()) return alert("Description is required");
      if (!cost || isNaN(parseFloat(cost))) return alert("Valid cost is required");
      if (!credits || isNaN(parseInt(credits))) return alert("Valid credits number is required");
      if (!selectedCurrency) return alert("Currency must be selected");
      if (!selectedValidity) return alert("Validity must be selected");

        // Check for duplicate name
        if(isEditMode){
          const nameExists = allPlans.some(plan =>
            plan.package_name.toLowerCase() === packageName.trim().toLowerCase() 
          );
          if (nameExists) {
            return alert("A plan with this package name already exists.");
          }
        }

      try{
        console.log("PLAN DATA", planData)
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
                        <input value={packageName}
                         onChange={(e) => {setPackageName(e.target.value)
                          if (formErrors.packageName && !isEmptyOrWhitespace(e.target.value)) {
                            setFormErrors(prev => ({ ...prev, packageName: undefined }));
                          }
                        }} 
                        type="text" className="form-control package-name-box" placeholder="Enter Package Name" aria-label="package name" id="package-name" required/>
                        {formErrors.packageName && <p className="error-text">{formErrors.packageName}</p>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="credits" className="form-label credits-text required-label">Credits</label>
                        <input value={credits} 
                          onChange={(e) => {setCredits(e.target.value)
                            if (formErrors.credits && !isNaN(parseInt(e.target.value))) {
                              setFormErrors(prev => ({ ...prev, credits: undefined }));
                            }
                          }}
                          type="number" className="form-control credits-box" placeholder="Enter Credits" aria-label="credits" id="credits" required/>
                          {formErrors.credits && <p className="error-text">{formErrors.credits}</p>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label description-text required-label">Description</label>
                        <textarea value={description} 
                        onChange={(e) => {setDescription(e.target.value)
                          if (formErrors.description && !isEmptyOrWhitespace(e.target.value)) {
                            setFormErrors(prev => ({ ...prev, description: undefined }));
                          }
                        }} 
                        className="form-control description-box" placeholder="Description" aria-label="Model description" id="description" required/>
                        {formErrors.description && <p className="error-text">{formErrors.description}</p>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="cost" className="form-label cost-text required-label">Cost</label>
                        <input value={cost} 
                        onChange={(e) => {setCost(e.target.value)
                           if (formErrors.cost && !isEmptyOrWhitespace(e.target.value)) {
                            setFormErrors(prev => ({ ...prev, cost: undefined }));
                          }
                        }} type="number" className="form-control cost-box" placeholder="Enter cost" aria-label="Cost" id="Cost" required/>
                        {formErrors.cost && <p className="error-text">{formErrors.cost}</p>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label currency-text required-label">Currency</label>
                      <Select
                        options={currencyOptions}
                        value={selectedCurrency}
                        onChange={(option) => {
                          setSelectedCurrency(option);
                          if (formErrors.currency) {
                            setFormErrors(prev => ({ ...prev, currency: undefined }));
                          }
                        }}
                        placeholder="Select Currency"
                        className="currency-select text-start"
                        classNamePrefix="select"
                        required
                      />
                      {formErrors.currency && <p className="error-text">{formErrors.currency}</p>}
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
                        onChange={(option) => {
                          setSelectedValidity(option);
                          if (formErrors.validity) {
                            setFormErrors(prev => ({ ...prev, validity: undefined }));
                          }
                        }}
                        placeholder="Select Validity (in days)"
                        className="validity-select text-start"
                        classNamePrefix="select"
                        required 
                      />
                      {formErrors.validity && <p className="error-text">{formErrors.validity}</p>}
                    </div>

                    <div className="submit-create-model-container d-flex justigy-content-start align-items-center mt-4 gap-2">
                        <button className="create-model-btn" onClick={() => navigate("/admin/plans-management")}>Back</button>
                        <button className="create-model-btn" onClick={handleSubmit}>{isEditMode ? "Edit" : "Create"}</button>    
                    </div>
              
                </div>
            </div>
        </div>
    </div>
  )
}