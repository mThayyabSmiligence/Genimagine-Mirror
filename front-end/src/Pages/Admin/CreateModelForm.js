import React, { useState, useEffect } from "react";
import '../../Css/CreateModelForm.css'
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { axiosAdmin } from "../../API's/axios";
import { useNavigate, useParams } from "react-router-dom";

const modelTypeOptions = [
  { value: 'cloudflare', label: 'Cloudflare' },
  { value: 'stability', label: 'Stability' },
];

export default function CreateModelForm({ isEditMode = false }) {
  const navigate = useNavigate();

  const [qualityOptions, setQualityOptions] = useState([]);
  const [aspectRatioOptions, setAspectRatioOptions] = useState([]);
  const [selectedModelType, setSelectedModelType] = useState(null);
  const [defaultQuality, setDefaultQuality] = useState(null);
  const [defaultAspectRatio, setDefaultAspectRatio] = useState(null);

  const [selectedQualities, setSelectedQualities] = useState([]);
  const [selectedAspectRatios, setSelectedAspectRatios] = useState([]);
  const [qualityCredits, setQualityCredits] = useState({});
  const [aspectRatioCredits, setAspectRatioCredits] = useState({});

  const [modelName, setModelName] = useState('');
  const [description, setDescription] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const { modelId } = useParams(); // Get model ID from URL
  const [modelData, setModelData] = useState(null);

  useEffect(() => {
    if (isEditMode && modelId) {
      axiosAdmin.get(`models/${modelId}`)
        .then(res => {
          setModelData(res.data.rows);
          console.log("res data", res.data.rows)
        })
        .catch(err => {
          console.error("Failed to fetch model data:", err);
        });
    }
  }, [isEditMode, modelId]);

  useEffect(() => {
    console.log("respomse modal data", modelData)
    if (modelData) {
      console.log("response modal data", modelData.name);

      setModelName(modelData.name);
      setDescription(modelData.description);
      setModelUrl(modelData.cloudflare_model_url);
      setIsActive(modelData.is_active);
      setIsDefault(modelData.is_default);
      // setSelectedQualities(modelData.resolution_config);
      // setSelectedAspectRatios(modelData.aspect_ratio_config) 
      const qualities = (modelData.resolution_config || []).map((q) => ({
        label: q.name,
        value: q.quality_level_id,
        isDefault: q.is_default,
        creditPoints: q.credit_points,
      }));
      
      const qualityCreditMap = {};
      qualities.forEach(q => {
        qualityCreditMap[q.value] = q.creditPoints;
      });
      setQualityCredits(qualityCreditMap);

      const defaultQ = qualities.find(q => q.isDefault === 1 || q.isDefault === true);
      if (defaultQ) setDefaultQuality(defaultQ.value)
      setSelectedQualities(qualities);


      // Convert aspect_ratio_config similarly
      const aspectRatios = (modelData.aspect_ratio_config || []).map((r) => ({
        label: r.ratio,
        value: r.aspect_ratio_id,
        isDefault: r.is_default,
        creditPoints: r.credit_points,
      }));

        const aspectRatioCreditMap = {};
        aspectRatios.forEach(r => {
        aspectRatioCreditMap[r.value] = r.creditPoints;
      });
      setAspectRatioCredits(aspectRatioCreditMap);

      const defaultR = aspectRatios.find(r => r.isDefault === 1 || r.isDefault === true);
      if (defaultR) setDefaultAspectRatio(defaultR.value);
      setSelectedAspectRatios(aspectRatios);
    }
  }, [modelData]);

  useEffect(()=> {
    getSelectOptions();
  },[])

  
  const getSelectOptions = async() => {
    try{
      const response = await axiosAdmin.get("/model/select-options")
      console.log(response.data);
      const { quality_levels, aspect_ratios } = response.data;

      const formattedQualities = quality_levels.map(item => ({
        value: item.value,
        label: item.label,
        is_default: item.is_default,
      }));
    
      const formattedAspectRatios = aspect_ratios.map(item => ({
        value: item.value,
        label: item.label,
        is_default: item.is_default,
      }));

      setQualityOptions(formattedQualities);
      setAspectRatioOptions(formattedAspectRatios);
    }catch (error){
      console.log("error fetching data",error.message)
    }
  }

  

    const handleSubmit = async () => {
      const payload = {
        name: modelName,
        description,  
        model_url: modelUrl,
        is_default: isDefault,
        is_active: isActive,
        resolution_config: selectedQualities.map((q) => ({
          quality_level_id: q.value,
          name: q.label,
          credit_points: Number(qualityCredits[q.value] || 0),
          is_default: q.value === defaultQuality ? 1 : 0,
        })),
        aspect_ratio_config: selectedAspectRatios.map((r) => ({
          aspect_ratio_id: r.value,
          ratio: r.label,
          credit_points: Number(aspectRatioCredits[r.value] || 0),
          is_default: r.value === defaultAspectRatio ? 1 : 0,
        }))
      };
      
      console.log("super payload", payload)
      try {
        const response = isEditMode
          ? await axiosAdmin.post(`/edit/model/${modelId}`, payload)
          : await axiosAdmin.post("/create-model", payload);
    
        if (response.status === 200 || response.status === 201) {
          navigate("/admin/model-management");
        }
      } catch (err) {
        console.error("Error saving model:", err);
        alert("Server error occurred");
      }
    }

  const handleQualityChange = (selectedOptions) => {
    setSelectedQualities(selectedOptions);

    
    // const defaultOption = selectedOptions.find(q => q.is_default === 1);
    // if (defaultOption) {
    //   setDefaultQuality(defaultOption.value);
    // } else {
    //   setDefaultQuality(null); // Reset if no default
    // }

    const stillExists = selectedOptions.some(q => q.value === defaultQuality);
    if (!stillExists) {
      const defaultOption = selectedOptions.find(q => q.is_default === 1);
      if (defaultOption) {
        setDefaultQuality(defaultOption.value);
      } else {
        setDefaultQuality(null);
      }
    }
  };

  const handleAspectRatioChange = (selectedOptions) => {
    setSelectedAspectRatios(selectedOptions);

    // const defaultOption = selectedOptions.find(r => r.is_default === 1);
    // if (defaultOption) {
    //   setDefaultAspectRatio(defaultOption.value);
    // } else {
    //   setDefaultAspectRatio(null);
    // }

    const stillExists = selectedOptions.some(r => r.value === defaultAspectRatio);
    if (!stillExists) {
      const defaultOption = selectedOptions.find(r => r.is_default === 1);
      if (defaultOption) {
        setDefaultAspectRatio(defaultOption.value);
      } else {
        setDefaultAspectRatio(null);
      }
    }
  };

  const handleQualityCreditChange = (quality, credit) => {
    setQualityCredits(prev => ({ ...prev, [quality]: credit }));
  };
  
  const handleAspectRatioCreditChange = (ratio, credit) => {
    setAspectRatioCredits(prev => ({ ...prev, [ratio]: credit }));
  };
  
   return(
        <div className="container mt-5 ">
          <div className="row justify-content-center align-items-center">
            <div className="col-12 col-md-10 col-lg-8">
              <div className="model-create-form p-4">
                <div className="form-title">
                  <p className="form-title-text d-flex justify-contengt-start">{isEditMode ? "Edit Model" : "Create Model"}</p>
                </div>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label name-text required-label">Model Name</label>
                  <input value={modelName} onChange={(e) => setModelName(e.target.value)} type="text" className="form-control name-box" placeholder="Name" aria-label="Model name" id="name" required/>
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label description-text required-label">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-control description-box" placeholder="Description" aria-label="Model description" id="description" required/>
                </div>

                <div className="mb-3">
                  <label htmlFor="modelType" className="form-label required-label model-type-text">Model Type</label>
                  <Select
                    id="modelType"
                    options={modelTypeOptions}
                    value={selectedModelType}
                    onChange={(selectedOption) => setSelectedModelType(selectedOption)}
                    placeholder="Select model type"
                    className="model-type-select text-start"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="url" className="form-label url-text required-label">Model URL</label>
                  <input value={modelUrl} onChange={(e) => setModelUrl(e.target.value)} type="text" className="form-control url-box" placeholder="Enter URL" aria-label="URL" id="url" required/>
                </div>
    
                <div className='default-switch-btn d-flex justify-content-between align-items-center mb-3'>
                  <label className="default-btn-text">Set Default:</label>
                  <label className='switch kids-mode-switch'>
                    <input 
                    type="checkbox" 
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    <span className='slider round'></span>
                  </label>
                </div>
    
                <div className='status-switch-btn d-flex justify-content-between align-items-center mb-3'>
                  <label className="status-btn-text">Set Active:</label>
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
                    <label htmlFor="qualitySelect" className="form-label required-label quality-text">Select Quality</label>
                    <Select
                        onChange={handleQualityChange}
                        id="qualitySelect"
                        closeMenuOnSelect={false}
                        components={makeAnimated()}
                        isMulti
                        options={qualityOptions}
                        value={selectedQualities}
                        className="quality-select text-start"
                        classNamePrefix="select-quality"
                        required
                    />
                </div>
                {selectedQualities.map((q) => (
                  <div className="d-flex align-items-center mb-2" key={q.value}>
                    <input
                      value={defaultQuality}
                      type="checkbox"
                      className="me-2"
                      checked={defaultQuality === q.value}
                      onChange={() => setDefaultQuality(q.value)}
                    />
                    <span className="me-2">{q.label}</span>
                    <input
                      type="number"
                      placeholder="Credit points"
                      className="form-control w-25"
                      value={qualityCredits[q.value] || ''}
                      onChange={(e) => handleQualityCreditChange(q.value, e.target.value)}
                    />
                  </div>
                ))}

                <div className="mb-3">
                    <label htmlFor="aspectratioSelect" className="form-label required-label aspect-ratio-text">Select Aspect Ratio</label>
                    <Select
                        onChange={handleAspectRatioChange}
                        id="aspectratioSelect"
                        closeMenuOnSelect={false}
                        components={makeAnimated()}
                        isMulti
                        options={aspectRatioOptions}
                        value={selectedAspectRatios}
                        className="aspectratio-select text-start"
                        classNamePrefix="select-aspect-ratio"
                        required
                    />
                </div>
                
                {selectedAspectRatios.map((r) => (
                  <div className="d-flex align-items-center mb-2" key={r.value}>
                    <input
                      value={defaultAspectRatio}
                      type="checkbox"
                      className="me-2"
                      checked={defaultAspectRatio === r.value}
                      onChange={() => setDefaultAspectRatio(r.value)}
                    />
                    <span className="me-2">{r.label}</span>
                    <input
                      type="number"
                      placeholder="Credit points"
                      className="form-control w-25"
                      value={aspectRatioCredits[r.value] || ''}
                      onChange={(e) => handleAspectRatioCreditChange(r.value, e.target.value)}
                    />
                  </div>
                ))}


                <div className="submit-create-model-container d-flex justigy-content-start align-items-center mt-4 gap-2">
                    <button className="create-model-btn" onClick={() => navigate("/admin/model-management")}>back</button>
                    <button className="create-model-btn" onClick={handleSubmit}>{isEditMode ? "Edit" : "Create"}</button>
                </div>
              </div>
            </div>
          </div>
        </div> 
   )
};