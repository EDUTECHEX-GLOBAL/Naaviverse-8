import React, { useState, useEffect } from 'react';
import './CreateNewService.scss';
import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CreateNewService = ({ 
  setaccsideNav,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  
  // Form state - all on one page
  const [serviceForm, setServiceForm] = useState({
    // Billing Type
    billingType: '',
    
    // Category
    category: '',
    
    // Service Information
    name: '',
    code: '',
    productLabel: '',
    tagline: '',
    description: '',
    icon: null,
    
    // Currency
    currency: '',
    
    // Pricing
    price: '',
    monthlyPrice: '',
    gracePeriod: '',
    secondAttempt: '',
    thirdAttempt: '',
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    fetchCurrencies();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/categories`);
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/currencies`);
      setCurrencies(res.data?.currencies || []);
    } catch (err) {
      console.error('Error fetching currencies:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setServiceForm({ ...serviceForm, icon: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!serviceForm.billingType) {
      toast.error('Please select billing type');
      return;
    }
    if (!serviceForm.category) {
      toast.error('Please select a category');
      return;
    }
    if (!serviceForm.name || !serviceForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!serviceForm.currency) {
      toast.error('Please select a currency');
      return;
    }
    if (!serviceForm.price) {
      toast.error('Please enter a price');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(serviceForm).forEach(key => {
        if (serviceForm[key] !== null && serviceForm[key] !== '') {
          formData.append(key, serviceForm[key]);
        }
      });

      const res = await axios.post(`${BASE_URL}/api/services/create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.status) {
        toast.success('Service created successfully!');
        onSuccess?.();
        setaccsideNav('My Services');
      }
    } catch (err) {
      console.error('Error creating service:', err);
      toast.error('Failed to create service');
    } finally {
      setLoading(false);
    }
  };


 const handleGoBack = () => {
  if (typeof setaccsideNav === 'function') {
    setaccsideNav('Paths'); // Go back to paths list
  } else {
    // Fallback to navigate
    window.history.back();
  }
};

  return (
    <div className="new-service-container">
      <div className="new-service-content">
        
        {/* 1. Billing Type Section */}
        <div className="form-section">
          <h2 className="section-title">1. Select billing type</h2>
          <div className="form-field">
            <label>What is the billing type? <span className="required">*</span></label>
            <div className="billing-options">
              <button
                className={`billing-btn ${serviceForm.billingType === 'monthly' ? 'active' : ''}`}
                onClick={() => setServiceForm({...serviceForm, billingType: 'monthly'})}
              >
                Monthly Subscription
              </button>
              <button
                className={`billing-btn ${serviceForm.billingType === 'one-time' ? 'active' : ''}`}
                onClick={() => setServiceForm({...serviceForm, billingType: 'one-time'})}
              >
                One Time
              </button>
              <button
                className="billing-btn disabled"
                disabled
              >
                Staking (Not Available)
              </button>
            </div>
          </div>
        </div>

        {/* 2. Category Section */}
        <div className="form-section">
          <h2 className="section-title">2. Product category</h2>
          <div className="form-field">
            <label>What is the product category? <span className="required">*</span></label>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-btn ${serviceForm.category === cat.name ? 'active' : ''}`}
                  onClick={() => setServiceForm({...serviceForm, category: cat.name})}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Service Information Section */}
        <div className="form-section">
          <h2 className="section-title">3. Service information</h2>
          
          <div className="form-field">
            <label>What is the name of this service? <span className="required">*</span></label>
            <input
              type="text"
              placeholder="e.g., Research Mentorship"
              value={serviceForm.name}
              onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-field half">
              <label>Service Code</label>
              <input
                type="text"
                placeholder="e.g., SRV-001"
                value={serviceForm.code}
                onChange={(e) => setServiceForm({...serviceForm, code: e.target.value})}
              />
            </div>

            <div className="form-field half">
              <label>Product Label</label>
              <input
                type="text"
                placeholder="e.g., Premium"
                value={serviceForm.productLabel}
                onChange={(e) => setServiceForm({...serviceForm, productLabel: e.target.value})}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Service Tagline</label>
            <input
              type="text"
              placeholder="e.g., Expert guidance for your journey"
              value={serviceForm.tagline}
              onChange={(e) => setServiceForm({...serviceForm, tagline: e.target.value})}
            />
          </div>

          <div className="form-field">
            <label>Service Description <span className="required">*</span></label>
            <textarea
              placeholder="e.g., Academic mentorship focusing on research methodology and paper writing. Includes 6 sessions over 3 months."
              rows="4"
              value={serviceForm.description}
              onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
            />
          </div>

          <div className="form-field">
            <label>Service Icon (Optional)</label>
            <div className="icon-upload">
              {imagePreview ? (
                <div className="icon-preview">
                  <img src={imagePreview} alt="Service icon" />
                  <button 
                    className="remove-icon"
                    onClick={() => {
                      setImagePreview(null);
                      setServiceForm({...serviceForm, icon: null});
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <span>Upload Icon</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* 4. Currency Section */}
<div className="form-section">
  <h2 className="section-title">4. Select currency</h2>
  <div className="form-field">
    <label>What currency do you want to collect? <span className="required">*</span></label>
    <select
      value={serviceForm.currency}
      onChange={(e) => setServiceForm({...serviceForm, currency: e.target.value})}
      className="currency-select"
    >
      <option value="">Select a currency</option>
      {currencies.map(curr => (
        <option key={curr.code} value={curr.code}>
          {curr.code} - {curr.name}
        </option>
      ))}
    </select>
  </div>
</div>

        {/* 5. Pricing Section */}
        <div className="form-section">
          <h2 className="section-title">5. Pricing information</h2>
          
          {serviceForm.billingType === 'monthly' ? (
            <>
              <div className="form-field">
                <label>First month price <span className="required">*</span></label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                />
              </div>

              <div className="form-field">
                <label>Monthly price (after first month)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={serviceForm.monthlyPrice}
                  onChange={(e) => setServiceForm({...serviceForm, monthlyPrice: e.target.value})}
                />
              </div>

              <div className="form-field">
                <label>Grace period (days)</label>
                <input
                  type="number"
                  placeholder="e.g., 7"
                  value={serviceForm.gracePeriod}
                  onChange={(e) => setServiceForm({...serviceForm, gracePeriod: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-field half">
                  <label>Second attempt (days)</label>
                  <input
                    type="number"
                    placeholder="e.g., 3"
                    value={serviceForm.secondAttempt}
                    onChange={(e) => setServiceForm({...serviceForm, secondAttempt: e.target.value})}
                  />
                </div>

                <div className="form-field half">
                  <label>Third attempt (days)</label>
                  <input
                    type="number"
                    placeholder="e.g., 5"
                    value={serviceForm.thirdAttempt}
                    onChange={(e) => setServiceForm({...serviceForm, thirdAttempt: e.target.value})}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="form-field">
              <label>Service price <span className="required">*</span></label>
              <input
                type="number"
                placeholder="0.00"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
      
{/* Action Buttons */}
<div className="action-buttons">
  <button 
    className="btn-back" 
    onClick={handleGoBack}
  >
    Go Back
  </button>
  <button 
    className="btn-next" 
    onClick={handleSubmit}
    disabled={loading}
  >
    {loading ? 'Creating...' : 'Create Service'}
  </button>
</div>
      </div>
    </div>
  );
};

export default CreateNewService;