import * as React from 'react';
import '../../Css/TopUpManagement.css';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { axiosAdmin } from '../../API\'s/axios';

function AdminTopUpListTable({ TopUpList }) {
  const navigate = useNavigate();
  const [topUpList, setTopUpList] = useState([]);

  useEffect(() => {
    setTopUpList(TopUpList || []);
  }, [TopUpList]);

  const handleEdit = (topup_package_id) => {
    navigate(`/admin/topup/edit/${topup_package_id}`);
  };

  const handleDelete = async(topup_package_id) => {
  if (!window.confirm("Are you sure you want to delete this top-up?")) return;

  try {
    const response = await axiosAdmin.post(`delete-top-up/${topup_package_id}`);

    if (response.data.status === 200) {
      
      setTopUpList(prevList =>
        prevList.filter(item => item.topup_package_id !== topup_package_id)
      );
    } else {
      console.error("Delete failed:", response.data.message);
    }
  } catch (error) {
    console.error("Error deleting top up plan", error);
  }
}

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 900 }} aria-label="top-up list table">
        <TableHead>
          <TableRow>
            <TableCell className='plans-table-title' align='start'><span>ID</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>CREDITS</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>COST</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>CURRENCY</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>STATUS</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>CREATED AT</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>UPDATED AT</span></TableCell>
            <TableCell className='plans-table-title' align='center'><span>ACTION</span></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topUpList.map((row) => (
            <TableRow key={row.topup_package_id}>
              <TableCell component="th" scope="row">{row.topup_package_id}</TableCell>
              <TableCell align="center">{row.credits}</TableCell>
              <TableCell align="center">{row.cost}</TableCell>
              <TableCell align="center">{row.currency}</TableCell>
              <TableCell align="center">
                <button
                //   title={row.is_active ? 'Active' : 'Inactive'}
                  className={`status-btn ${row.is_active ? 'active' : 'Inactive'}`}
                >
                  {row.is_active ? 'Active' : 'Inactive'}
                </button>
              </TableCell>

              <TableCell align="center">
                {new Date(row.created_at).toLocaleString()}
              </TableCell>

              <TableCell align="center">
                {new Date(row.updated_at).toLocaleString()}
              </TableCell>
              
              <TableCell align="center" className='d-flex justify-content-center align-items-center'>
                <button
                  className="edit-topup-btn"
                  onClick={() => handleEdit(row.topup_package_id)}
                  title='edit'
                >
                  <EditRoundedIcon className=''></EditRoundedIcon>
                </button>

                <button onClick={(e) => handleDelete(row.topup_package_id)} className='ms-2 icon-button-style delete-icon delete-topup-btn' title='delete' ><DeleteOutlineRoundedIcon className='action-icon icon'></DeleteOutlineRoundedIcon></button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AdminTopUpListTable;
