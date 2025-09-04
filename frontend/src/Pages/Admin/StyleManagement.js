import React from 'react'
import '../../Css/StyleManagement.css'
import AdminStyleListTable from '../../Components/CommonComponents/AdminStyleListTable'
import { Link } from 'react-router-dom'
import { axiosAdmin } from '../../API\'s/axios';
import { useState } from 'react';
import { useEffect } from 'react';
import StyleFormModal from '../../Components/CommonComponents/StyleFormModal';

export default function StyleManagement() {

    const [styleList, setStyleList] = useState([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editStyleData, setEditStyleData] = useState(null);

    useEffect(()=>{
        getAllStyles()
    },[]);
    const getAllStyles = async() => {
        try{
        const response = await axiosAdmin.post("/admin/styles")
        setStyleList(response.data.data)
        console.log("styles data", response.data.data)
        }catch(error){
        console.log("error fetching data",error)
        }
    }

    const handleCreateNew = () => {
        setEditStyleData(null); // Clear any previous edit data
        setShowFormModal(true);
    };

    const handleEdit = (styleId) => {
        const selectedStyle = styleList.find((style) => style.id === styleId);
        console.log("selectedStyle: ", selectedStyle)
        if (selectedStyle) {
        setEditStyleData(selectedStyle);
        setShowFormModal(true);
        }
    };

    return (
        <div className='style-list-container p-4 mx-4'>
    
        <div className='action-btn-container d-flex justify-content-end align-items-center mb-2'>
            <button className='create-btn-link link'  onClick={handleCreateNew}>Create</button>
        </div>
        <div className='style-wrapper'>
            <h1 className='style-heading-title text-start mb-3'>Styles List</h1>
            <AdminStyleListTable
                styleList = {styleList}
                onEditStyle={handleEdit} // Pass edit handler
                refreshStyles={getAllStyles}
            />
        </div>

        {showFormModal && (
            <StyleFormModal
            onClose={() => setShowFormModal(false)}
            refreshStyles={getAllStyles}
            editStyleData={editStyleData}
            />
        )}
        </div>
    )
}
