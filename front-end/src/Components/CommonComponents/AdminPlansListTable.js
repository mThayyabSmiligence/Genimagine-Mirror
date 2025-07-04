import * as React from 'react';
import '../../Css/PlansManagement.css'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosAdmin, axiosPrivate } from '../../API\'s/axios';



export default function AdminPlansListTable({plans, onDelete}) {
    const navigate = useNavigate();

    const handleEdit = (packageID) => {
        navigate(`/admin/plan/edit/${packageID}`);
    };

    const  handleViewDetails = (packageID) => {
        navigate(`/admin/plan-detail/${packageID}`)
    }
        
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="caption table">
        <TableHead>
          <TableRow>
            <TableCell className='plans-table-title' align='start'><span>ID</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>PACKAGE NAME</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>CREDITS</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>PARENT PACKAGE ID</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>VALIDITY</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>STATUS</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>ACTION</span></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plans.map((row) => (
            <TableRow  key={row.package_id} 
                className="clickable-row"
                onClick={() => handleViewDetails(row.package_id)}
            >
              <TableCell component="th" scope="row">
                {row.package_id}
              </TableCell>
              <TableCell align="center">{row.package_name}</TableCell>
              <TableCell align="center">{row.credits}</TableCell>
              <TableCell align="center">{row.parent_package_id}</TableCell>
              <TableCell align="center">{row.validity_days}</TableCell>
              <TableCell align="center"> <button title={row?.is_active ? 'Active' : 'In Active'} className={`status-btn ${row?.is_active ? 'active' : 'Inactive'}`}>{row.is_active ? 'Active' : 'In Active'}</button></TableCell>
              <TableCell align="center"> 
                <button className="edit-btn reviewd-btn" disabled= {row?.is_deleted === 1} onClick={(e) => {
                  e.stopPropagation(); 
                  handleEdit(row.package_id)
                }}>
                    Edit
                </button>
                {/* <button className="view-details-btn ms-2" onClick={() => handleViewDetails(row.package_id)}>View</button> */}
                <button className="delete-btn ms-2" disabled= {row?.is_deleted === 1} onClick={(e) => {
                    e.stopPropagation(); // prevent triggering row click
                    onDelete(row.package_id);
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

