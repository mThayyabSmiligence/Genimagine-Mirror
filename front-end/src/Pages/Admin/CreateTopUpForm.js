import React, { useEffect, useState } from 'react'
import '../../Css/CreateTopUpForm.css'
import { axiosAdmin } from '../../API\'s/axios';
import { useNavigate, useParams } from 'react-router-dom';
import leftArrow from '../../images/arrow.png'
import leftArrowHover from '../../images/leftArrowHover.png'

export default  function CreateTopUpForm({ isEditMode = false}) {
  const navigate =useNavigate();
  const { planId } = useParams(); 
  const [isHovering, setIsHovering] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    credits: '',
    cost: '',
    currency: '',
    is_active: true
  });

useEffect(() => {
  console.log("hello edit mode", planId + " " + isEditMode);
  if (isEditMode && planId) {
    axiosAdmin.post(`top-up/${planId}`)
      .then(res => {
        const data = res.data.rows; // assuming rows is an array
        console.log("data ", data)
        if (data) {
          setFormData({
            credits: data.credits,
            cost: data.cost,
            currency: data.currency,
            is_active: data.is_active === 1 || data.is_active === true, // normalize boolean
          });
        }
      })
      .catch(err => {
        console.error("Failed to fetch top-up plan data:", err);
      });
  }
}, [isEditMode, planId]);

const isEmptyOrWhitespace = (str) => {
  return !str || str.trim() === '';
};

const validateForm = () => {
  const errors = {};

  if (!formData.credits || isNaN(parseInt(formData.credits)) || parseInt(formData.credits) <= 0) {
    errors.credits = "*Valid credit amount is required.";
  }

  if (!formData.cost || isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) <= 0) {
    errors.cost = "*Valid cost amount is required.";
  }

  if (isEmptyOrWhitespace(formData.currency)) {
    errors.currency = "*Currency is required.";
  }

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};


 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    const response = isEditMode
    ? await axiosAdmin.post(`/edit/top-up/${planId}`, formData)
    : await axiosAdmin.post('/create-top-up', formData)

    if (response.status === 200 || response.status === 201) {
      navigate("/admin/top-up-management");
    }

    console.log('Form submitted:', response.data);
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};


  const currencies = [
    { value: 'INR', label: 'INR - Indian Rupee'},
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' }
  ];

  return (
    <div className="card top-up-create-form ms-5 mt-5 p-4">
      {/* <div className="card-header bg-white border-0 py-4"> */}
        <div className="d-flex align-items-center">
          <div>
            <h2 className="card-title h3 mb-1 fw-bold">Create Top-Up</h2>     
          </div>
        </div>
      {/* </div> */}
      
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {/* Credits Input */}
          <div className="mb-4">
            <label htmlFor="credits" className="form-label credit-input-text required-label">
              <i className="bi bi-coin me-2 text-primary"></i>
              Credits Amount
            </label>
            <input
              type="number"
              className="form-control credits-input"
              id="credits"
              placeholder="Enter credits amount"
              value={formData.credits}
              onChange={(e) => {
                setFormData({ ...formData, credits: e.target.value });
                if (formErrors.credits && parseInt(e.target.value) > 0) {
                  setFormErrors(prev => ({ ...prev, credits: undefined }));
                }
              }}
              required
            />
            {formErrors.credits && <p className="error-text">{formErrors.credits}</p>}
          </div>

          {/* Cost Input */}
          <div className="mb-4">
            <label htmlFor="cost" className="form-label cost-input-text required-label">
              <i className="bi bi-currency-dollar me-2 text-success"></i>
              Cost
            </label>
            <input
              type="number"
              step="0.01"
              className="form-control cost-input"
              id="cost"
              placeholder="Enter cost amount"
              value={formData.cost}
              onChange={(e) => {
                setFormData({ ...formData, cost: e.target.value });
                if (formErrors.cost && parseFloat(e.target.value) > 0) {
                  setFormErrors(prev => ({ ...prev, cost: undefined }));
                }
              }}
              required
            />
             {formErrors.cost && <p className="error-text">{formErrors.cost}</p>}
          </div>

          {/* Currency Select */}
          <div className="mb-4">
            <label htmlFor="currency" className="form-label currency-select-text required-label">
              Currency
            </label>
            <select
              className="form-select currency-input"
              id="currency"
              value={formData.currency}
              onChange={(e) => {
                setFormData({ ...formData, currency: e.target.value });
                if (formErrors.currency && e.target.value.trim()) {
                  setFormErrors(prev => ({ ...prev, currency: undefined }));
                }
              }}
              required
            >
              <option value="">Select currency</option>
              {currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
            {formErrors.currency && <p className="error-text">{formErrors.currency}</p>}
          </div>

          {/* Active/Inactive Switch */}
          <div className="mb-4 p-3 bg-light rounded-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <i className={`bi bi-activity me-3 fs-5 ${formData.is_active ? 'text-success' : 'text-muted'}`}></i>
                <div>
                  <label className="form-label status-switch-text mb-1">Status</label>
                  <p
                    className={`d-flex justify-content-start small mb-0 switch-status ${
                      formData.is_active ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {formData.is_active ? 'Currently active' : 'Currently inactive'}
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center me-3 top-up-status-switch-btn">
                <span className={`me-2 fw-medium ${formData.is_active ? 'text-success' : 'text-danger'}`}>
                  {formData.is_active ? 'Active' : 'Inactive'}
                </span>
                <label className="switch kids-mode-switch">
                  <input
                    className={`switch-input-status ${formData.is_active ? "istrue" : "false"}`}
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='d-flex justify-content-between align-itens-center'>

            <button 
              type="button"
              className='back-topup-btn d-flex align-items-center gap-2 ms-2 fw-semibold'
              onClick={() => navigate('/admin/top-up-management')}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* <span className='fw-bold'>{''}</span> */}
              <img src={isHovering ? leftArrow : leftArrowHover} className='left-arrow-image ms-2' />
              <span className='back-text'>Back</span>
            </button>

            <button 
              type="submit" 
              className='top-up-submit-button'
            >
             {isEditMode ? "Edit" : "Create"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

