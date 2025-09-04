import React from 'react'
import '../../Css/ModeratorManagement.css'
import { Link } from 'react-router-dom'
import { axiosAdmin } from '../../API\'s/axios';
import { useEffect } from 'react';
import { useState } from 'react';
import AdminModeratorsListTable from '../../Components/CommonComponents/AdminModeratorsListTable';

function ModeratorManagement() {

  const [moderatorList, setModeratorList] = useState([]);
  
    useEffect(()=>{
      getAllModerators()
    },[]);
    const getAllModerators = async() => {
      try{
        const response = await axiosAdmin.get("/get-all-moderators")
        setModeratorList(response.data.rows)
        console.log("moderator data", response.data.rows)
      }catch(error){
        console.log("error fetching data",error)
      }
    }

  return (
    <div className='moderator-list-container p-4 mx-4'>
      <div className='create-btn-container d-flex justify-content-end align-items-center mb-2'>
        <Link to={"/admin/moderator-management/create-moderator"} className='create-btn-link link'>Create</Link>
      </div>
      <div className='moderator-wrapper'>
        <h1 className='moderator-heading-title text-start mb-3'>Moderator List</h1>
         
          <AdminModeratorsListTable
            moderatorList={moderatorList}    
          />
          
      </div>
    </div>
  )
}

export default ModeratorManagement