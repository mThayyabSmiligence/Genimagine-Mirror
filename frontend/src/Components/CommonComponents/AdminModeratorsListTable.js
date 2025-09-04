import React from 'react'
import '../../Css/ModeratorManagement.css'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import { axiosAdmin } from '../../API\'s/axios';

function AdminModeratorsListTable({moderatorList}) {
  const navigate = useNavigate();

   const handleEdit = (userId) => {
        navigate(`/admin/moderator/update/${userId}`);
    };

  const handleDelete = async (userId) => {
    try {
      const response = await axiosAdmin.post(`/delete-moderator/${userId}`);
      if (response.status === 200) {
        alert("Moderator soft-deleted successfully.");
        window.location.reload(); // or re-fetch data via props
      }
    } catch (err) {
      console.error("Failed to delete moderator", err);
      alert("Error deleting moderator.");
    }
  };

  const  handleViewDetails = (userId) => {
    navigate(`/admin/moderator-detail/${userId}`)
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="caption table">
        <TableHead>
          <TableRow>
            <TableCell className='plans-table-title' align='start'><span>ID</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>MODERATOR NAME</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>EMAIL</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>AGE</span></TableCell>
            {/* <TableCell className='plans-table-title' align='center'><span>DOB</span></TableCell> */}
            <TableCell className='plans-table-title' align='center'><span>CREATED-AT</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>STATUS</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>ACTION</span></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {moderatorList.map((row) => (
            <TableRow  key={row.user_id} 
                className="clickable-row"
                onClick={() => handleViewDetails(row.user_id)}
            >
              <TableCell component="th" scope="row">
                {row.user_id}
              </TableCell>
              <TableCell align="center">{row.username}</TableCell>
              <TableCell align="center">{row.email}</TableCell>
              <TableCell align="center">{row.age}</TableCell>
              {/* <TableCell align="center">{row.DOB.split('T')[0]}</TableCell> */}
              <TableCell align="center">{row.created_at.split('T')[0]}</TableCell>
              <TableCell align="center">
                <button
                  title={row?.is_verified ? 'Active' : 'Inactive'}
                  className={`status-btn ${row?.is_verified ? 'active' : 'Inactive'}`}
                >
                  {row.is_verified ? 'Active' : 'Inactive'}
                </button>
              </TableCell>
              <TableCell align="center"> 
                <button className="edit-btn reviewd-btn" disabled= {row.is_deleted === 1} onClick={(e) => {
                  e.stopPropagation(); 
                  handleEdit(row.user_id)
                }}>
                    Edit
                </button>
                <button className="delete-btn ms-2" disabled= {row.is_deleted === 1} onClick={(e) => {
                    e.stopPropagation(); 
                    handleDelete(row.user_id);
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

export default AdminModeratorsListTable