import React from 'react'
import '../../Css/StyleManagement.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { axiosAdmin, axiosPrivate } from '../../API\'s/axios';

function AdminStyleListTable({styleList, onEditStyle, refreshStyles }) {
        const navigate = useNavigate();
        const [StyleImageList, setStyleImageList] = useState(styleList);


        
     
        useEffect(() => {
            setStyleImageList(styleList);
        },[styleList])

        //  const handleEdit = (styleId) => {
        //     navigate(`/admin/style/edit/${styleId}`);
        // };

        // const  handleViewDetails = (packageID) => {
        //     navigate(`/admin/plan-detail/${packageID}`)
        // }
 
        const handleDelete = async (styleId) => {

          

          if (!window.confirm("Are you sure you want to delete this style?")) return;

          try {
            const response = await axiosAdmin.post(`/delete-style/${styleId}`);
             if (response.data.success) {
                setStyleImageList(prev =>
                  prev.map(style =>
                    style.id === styleId
                      ? { ...style, is_deleted: 1, is_active: 0 }
                      : style
                  )
                );
              }
          } catch (error) {
            console.error("Delete failed:", error);
            alert("An error occurred while deleting the style.");
          }
        };
        
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="caption table">
        <TableHead>
          <TableRow>
            <TableCell className='style-table-title' align='start'><span>ID</span></TableCell>
            <TableCell className='style-table-title' align='center'><span>Style NAME</span></TableCell>
            <TableCell className='style-table-title' align='center'><span>IMAGE PATH</span></TableCell>
            <TableCell className='style-table-title' align='center'><span>STATUS</span></TableCell>
            <TableCell className='style-table-title' align='center'><span>ACTION</span></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {StyleImageList.map((row) => (
            <TableRow  key={row.id}   
                // className="clickable-row"
                // onClick={() => handleViewDetails(row.package_id)}
                className={row.is_deleted === 1 ? 'disabled-row' : ''}
            >
              <TableCell component="th" scope="row">
                {row.id}
              </TableCell>
              <TableCell align="center">{row.name}</TableCell>
              <TableCell align="center">{row.image_path}</TableCell>
              <TableCell align="center"> <button title={row?.is_active ? 'Active' : 'In Active'} className={`status-btn ${row?.is_active ? 'active' : 'Inactive'}`}>{row.is_active ? 'Active' : 'In Active'}</button></TableCell>
              <TableCell align="center"> 
                <button className="edit-btn reviewd-btn" disabled= {row.is_deleted === 1} onClick={(e) => {
                  e.stopPropagation(); 
                  onEditStyle(row.id); 
                }}>
                    Edit
                </button>
               
                <button className="delete-btn ms-2" disabled= {row.is_deleted === 1} onClick={(e) => {
                    e.stopPropagation(); // prevent triggering row click
                    handleDelete(row.id);
                  }}>
                   {row.is_deleted === 1 ? 'Deleted' : 'Delete'}
                </button>
              </TableCell>
              

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AdminStyleListTable