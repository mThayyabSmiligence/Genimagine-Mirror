import React, { useEffect, useState } from 'react'
import AdminPlansListTable from '../../Components/CommonComponents/AdminPlansListTable'
import { axiosAdmin } from '../../API\'s/axios';
import { Link } from 'react-router-dom';
import '../../Css/PlansManagement.css'

function PlansManagement() {

  const [plans, setPlans] = useState([]);

  useEffect(()=>{
    getAllPlans()
  },[]);
  const getAllPlans = async() => {
    try{
      const response = await axiosAdmin.post("plans")
      setPlans(response.data.data)
      console.log("plans data", response.data.data)
    }catch(error){
      console.log("error fetching data",error)
    }
  }

  return (
    <div className='plan-list-container p-4 mx-4'>
      <div className='create-btn-container d-flex justify-content-end align-items-center mb-2'>
        <Link to={"/admin/plans-management/create-plan"} className='create-btn-link link'>create</Link>
      </div>
      <div className='plan-wrapper'>
        <h1 className='plan-heading-title text-start mb-3'>Plans List</h1>
          <AdminPlansListTable
            plans = {plans}
          />
      </div>
    </div>
  )
}

export default PlansManagement