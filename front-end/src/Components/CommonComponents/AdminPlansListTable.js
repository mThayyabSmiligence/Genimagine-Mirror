import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect } from 'react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminPlansListTable({plans}) {
     const [plansList, setPlansList] = useState(plans);
        useEffect(() => {
            setPlansList(plans);
        },[plans])

         const handleEdit = (packageID) => {
            Navigate(`/admin/plan/edit/${packageID}`);
        };
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="caption table">
        <TableHead>
          <TableRow>
            <TableCell className='plans-table-title' align='start'><span>ID</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>PACKAGE NAME</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>CREDITS</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>VALIDITY</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>STATUS</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>ACTION</span></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plans.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.package_id}
              </TableCell>
              <TableCell align="center">{row.package_name}</TableCell>
              <TableCell align="center">{row.credits}</TableCell>
              <TableCell align="center">{row.validity_days}</TableCell>
              <TableCell align="center"> <button title={row?.is_active ? 'Active' : 'In Active'} className={`status-btn ${row?.is_active ? 'active' : 'Inactive'}`}>{row.is_active ? 'Active' : 'In Active'}</button></TableCell>
              <TableCell align="center"> <button className="edit-btn reviewd-btn" onClick={() => handleEdit(row.package_id)}>Edit</button></TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

