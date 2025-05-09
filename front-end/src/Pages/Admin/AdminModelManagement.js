import React, { useEffect, useState } from 'react'
import AdminModelsListTable from '../../Components/CommonComponents/AdminModelsListTable'
import { axiosAdmin } from '../../API\'s/axios';
import '../../Css/AdminModelManagement.css'
import { Link, useNavigate } from 'react-router-dom';

export default function AdminModelManagement() {
  const navigate = useNavigate()

  const [models, setModels] = useState([]);

  useEffect(()=>{
    getAllModels()
  },[]);
  const getAllModels = async() => {
    try{
      const response = await axiosAdmin.get("models")
      setModels(response.data.rows)
      console.log("modles data", response.data.rows)
    }catch(error){
      console.log("error fetching data",error)
    }
  }

  // const handleOnclickCreate = () => {
  //   navigate("")
  // }


  return (
    <div className='model-list-container p-4 mx-4'>
      <div className='create-btn-container d-flex justify-content-end align-items-center mb-2'>
        <Link to={"/admin/model-management/create-model"} className='create-btn-link link'>create</Link>
      </div>
      <div className='model-wrapper'>
        <h1 className='model-heading-title text-start mb-3'>Models List</h1>
          <AdminModelsListTable
            models={models}
          />
      </div>
    </div>
  )
}
