import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../Css/TopUpManagement.css'
import AdminTopUpListTable from '../../Components/CommonComponents/AdminTopUpListTable'
import { axiosAdmin } from '../../API\'s/axios';


export default function TopUpManagement() {
    const [TopUpList, setTopUpList] = useState([]);

  useEffect(()=>{
    getAllTopUpList()
  },[]);
  const getAllTopUpList = async() => {
    try{
      const response = await axiosAdmin.post("top-ups")
      setTopUpList(response.data.data)
      console.log("top up data", response.data.data)
    }catch(error){
      console.log("error fetching data",error)
    }
  }
  return (
    <div className='top-up-list-container p-4 mx-4'>
  
      <div className='action-btn-container d-flex justify-content-end align-items-center mb-2'>
        <Link to={"/admin/top-up-management/create-plan"} className='create-btn-link link'>Create</Link>
      </div>
      <div className='top-up-wrapper'>
        <h1 className='top-up-heading-title text-start mb-3'>Top Up List</h1>
          <AdminTopUpListTable
            TopUpList = {TopUpList}
          />
      </div>
    </div>
  )
}