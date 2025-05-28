import React, { useState } from 'react'

function CreateTopUpForm() {
  const [formData, setFormData] = useState({
    credits: '',
    cost: '',
    currency: '',
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const currencies = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' }
  ];

  return (
    <div className="card card-shadow border-0">
      {/* <div className="card-header bg-white border-0 py-4"> */}
        {/* <div className="d-flex align-items-center">
          <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
            <i className="bi bi-credit-card text-primary fs-4"></i>
          </div>
          <div>
            <h2 className="card-title h3 mb-1 fw-bold">Credit Management</h2>
            <p className="text-muted mb-0">Configure your credit settings and pricing</p>
          </div>
        </div> */}
      {/* </div> */}
      
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {/* Credits Input */}
          <div className="mb-4">
            <label htmlFor="credits" className="form-label fw-semibold">
              <i className="bi bi-coin me-2 text-primary"></i>
              Credits Amount
            </label>
            <input
              type="number"
              className="form-control form-control-lg"
              id="credits"
              placeholder="Enter credits amount"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
            />
          </div>

          {/* Cost Input */}
          <div className="mb-4">
            <label htmlFor="cost" className="form-label fw-semibold">
              <i className="bi bi-currency-dollar me-2 text-success"></i>
              Cost
            </label>
            <input
              type="number"
              step="0.01"
              className="form-control form-control-lg"
              id="cost"
              placeholder="Enter cost amount"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />
          </div>

          {/* Currency Select */}
          <div className="mb-4">
            <label htmlFor="currency" className="form-label fw-semibold">
              Currency
            </label>
            <select
              className="form-select form-select-lg"
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="">Select currency</option>
              {currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active/Inactive Switch */}
          <div className="mb-4 p-3 bg-light rounded-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <i className={`bi bi-activity me-3 fs-5 ${formData.isActive ? 'text-success' : 'text-muted'}`}></i>
                <div>
                  <label className="form-label fw-semibold mb-1">Status</label>
                  <p className={`${formData.isActive ? 'Currently-active' :'Currently-inactive '}small mb-0 switch-status`}>
                    {formData.isActive ? 'Currently active' : 'Currently inactive'}
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <span className={`me-3 fw-medium ${formData.isActive ? 'text-success' : 'text-muted'}`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="activeSwitch"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-100 fw-semibold"
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              border: 'none'
            }}
          >
            Save Credit Settings
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTopUpForm