import React, { useEffect, useState } from 'react'
import '../../Css/ModelDetail.css'
import { axiosAdmin } from '../../API\'s/axios';
import { useParams } from 'react-router-dom';

function ModelDetail() {
    const [modelDetail, setModelDetail] = useState(null);
    const {modelId} = useParams();

    useEffect(() => {
        if (modelId) {
          getModelData(modelId);
        }
      }, [modelId]);
    
    const getModelData = async(modelId) =>{
        try{
            const response = await axiosAdmin.get(`/models/${modelId}`)
            console.log("detail data", response.data.rows)
            setModelDetail(response.data.rows)
        }catch(error){
            console.error(`error grttimg model data ${modelId} `)
        }     
    }

    if (!modelDetail) return <div className="text-center mt-5">Loading model details...</div>;
    return (
        // <div className='model-detail-container mt-5 mx-4'>
        //     <div className='d-flex justify-content-start align-items-center mb-2'>
        //         <h1 className='model-detail-heading-title'>Model detail</h1>

        //         <div className=''>
                    
        //         </div>
        //     </div> 
        // </div>

            <div className='model-detail-container container mt-5'>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <h1 className='model-detail-heading-title'>Model Details</h1>
                    <span className={`badge ${modelDetail.is_active ? 'bg-success' : 'bg-danger'} model-status-badge`}>
                        {modelDetail.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
    
                {/* Basic Model Info */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">                                    
                                    <p className='model-detail-heading span'><span>{modelDetail.id} . {modelDetail.name}</span></p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <h5 className="text-muted">Description</h5>
                                    <p>{modelDetail.description || "This is a generative AI model designed to produce high-quality images based on user prompts. It supports multiple resolution and aspect ratio configurations, allowing for flexible and optimized output. The model integrates with Cloudflare for fast and secure content delivery."}</p>
                                </div>
                                <div className="mb-3">
                                    <h5 className="text-muted">Cloudflare Model URL</h5>
                                    <p className="text-truncate">{modelDetail.cloudflare_model_url}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    
                {/* Configuration Tables */}
                <div className="row">
                    {/* Resolution Config */}
                    <div className="col-lg-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header bg-light">
                                <h5 className="mb-0 q-config">Selected quality</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Resolution</th>
                                                <th>Default</th>
                                                <th>Credit Points</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(modelDetail.resolution_config || []).map((res, index) => (
                                                <tr key={index} className={res.is_default ? 'table-primary' : ''}>
                                                    <td>{res.name || "not selected"}</td>
                                                    <td>{res.is_default ? 'Yes' : 'No'}</td>
                                                    <td>{res.credit_points || "not selected"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    {/* Aspect Ratio Config */}
                    <div className="col-lg-6 mb-4">
                        <div className="card h-100">
                            <div className="card-header bg-light">
                                <h5 className="mb-0 ar-config">Selected Aspect Ratio</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Aspect Ratio</th>
                                                <th>Default</th>
                                                <th>Credit Points</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(modelDetail.aspect_ratio_config || []).map((ratio, index) => (
                                                <tr key={index} className={ratio.is_default ? 'table-primary' : ''}>
                                                    <td>{ratio.ratio || "not selected"}</td>
                                                    <td>{ratio.is_default ? 'Yes' : 'No'}</td>
                                                    <td>{ratio.credit_points || "not selected"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    
                {/* Dates */}
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <p className="text-muted mb-1 heading-color">Created At</p>
                                <p>{new Date(modelDetail.created_at).toLocaleDateString('en-GB')}</p>

                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <p className="text-muted mb-1 heading-color">Updated At</p>
                                <p>{new Date(modelDetail.updated_at).toLocaleDateString('en-GB')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
export default ModelDetail
















 // <div className="container mt-4">
    //   <div className="card shadow-sm">
    //     <div className="card-header bg-primary text-white">
    //       <h4 className="mb-0">Model Details</h4>
    //     </div>
    //     <div className="card-body">
    //       <div className="row mb-3">
    //         <div className="col-md-4 font-weight-bold">Model Name:</div>
    //         <div className="col-md-8">{model.name}</div>
    //       </div>

    //       <div className="row mb-3">
    //         <div className="col-md-4 font-weight-bold">Description:</div>
    //         <div className="col-md-8">{model.description}</div>
    //       </div>

    //       <div className="row mb-3">
    //         <div className="col-md-4 font-weight-bold">Model URL:</div>
    //         <div className="col-md-8">
    //           <a href={model.model_url} target="_blank" rel="noopener noreferrer">
    //             {model.model_url}
    //           </a>
    //         </div>
    //       </div>

    //       <div className="row mb-3">
    //         <div className="col-md-4 font-weight-bold">Resolution Config:</div>
    //         <div className="col-md-8">
    //           {model.resolution_config.map((res, index) => (
    //             <span key={index} className="badge badge-info mr-2">
    //               {res.label} ({res.points} pts)
    //             </span>
    //           ))}
    //         </div>
    //       </div>

    //       <div className="row mb-3">
    //         <div className="col-md-4 font-weight-bold">Aspect Ratio Config:</div>
    //         <div className="col-md-8">
    //           {model.aspect_ratio_config.map((aspect, index) => (
    //             <span key={index} className="badge badge-secondary mr-2">
    //               {aspect.label} ({aspect.points} pts)
    //             </span>
    //           ))}
    //         </div>
    //       </div>

    //       <div className="row mb-3">
    //         <div className="col-md-4 font-weight-bold">Is Active:</div>
    //         <div className="col-md-8">
    //           <span className={`badge ${model.is_active ? 'badge-success' : 'badge-danger'}`}>
    //             {model.is_active ? 'Active' : 'Inactive'}
    //           </span>
    //         </div>
    //       </div>

    //       <div className="row mb-3">
    //         <div className="col-md-4 font-weight-bold">Is Default:</div>
    //         <div className="col-md-8">
    //           <span className={`badge ${model.is_default ? 'badge-primary' : 'badge-warning'}`}>
    //             {model.is_default ? 'Default' : 'Custom'}
    //           </span>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>