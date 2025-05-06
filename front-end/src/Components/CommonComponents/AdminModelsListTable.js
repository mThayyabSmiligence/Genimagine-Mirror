import * as React from 'react';
import '../../Css/AdminModelManagement.css'
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TablePagination from '@mui/material/TablePagination';
import { axiosModerator } from '../../API\'s/axios';    
import { useState } from 'react';
import FeedbackResponsePopUp from './FeedbackResponsePopUp';
import { useEffect } from 'react';
import EscalationPopUp from './EscalationPopUp';


function Row({row}) {
  const [open, setOpen] = React.useState(false);


  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>

        <TableCell component="th" scope="row" align='center'>
          {row.id}
        </TableCell>
        <TableCell align="center">{row.name}</TableCell>
        <TableCell align="center">{row.description || "this is model with super fast"}</TableCell>
        <TableCell align="center">
            <button title={row?.is_active ? 'Active' : 'In Active'} className={`status-btn ${row?.is_active ? 'active' : 'Inactive'}`}>{row.is_active ? 'Active' : 'In Active'}</button>
        </TableCell>

        <TableCell align='center'>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            title='click to open'
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>  
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div" className='model-detail-heading'>
                <span>Model Details</span>
              </Typography>
              <Table aria-label="purchases">    
                    {/* <Box className='model-details-preview'>
                        <Typography><h4>{row.name.charAt(0).toUpperCase() + row.name.slice(1)}</h4></Typography>
                        <Typography><p>{row.description ||  "this is model with super fast"}</p></Typography>
                        <Typography className='model-url'><p>{row.cloudflare_model_url}</p></Typography>
                    </Box> */}

                    <Box className='model-details-preview' sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
                    {/* LEFT COLUMN */}
                    <Box sx={{ flex: 1, minWidth: '300px' }}>

                    <Typography variant="body1" sx={{fontWeight: 'bold',mb: 2 }} className='model-detail-heading'>
                        <span>{row.id}. {row.name.charAt(0).toUpperCase() + row.name.slice(1)}</span>
                    </Typography>

                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Description</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                        {row.description || "This is model with super fast"}
                        </Typography>

                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Cloudflare Model URL</Typography>
                        <Typography variant="body1" className='model-url'>
                        {row.cloudflare_model_url}
                        </Typography>

                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>Created At</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{row.created_at}</Typography>
                    </Box>

                    {/* RIGHT COLUMN */}
                    <Box sx={{ flex: 1, minWidth: '300px' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 5.6, mb: 1 }}>
                        Status
                    </Typography>
                    <button
                        className={`status-btn ${row?.is_active ? 'active' : 'Inactive'}`}
                        title={row?.is_active ? "Active" : "In Active"}
                    >
                        {row?.is_active ? "Active" : "In Active"}
                    </button>

                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
                        Is Default
                    </Typography>
                    <button
                        className={`default-btn ${row?.is_default ? 'isDefault' : 'isNotDefault'}`}
                        title={row?.is_default ? "Unset Default" : "Set Default"}
                    >
                        {row?.is_default ? "Default" : "Set as Default"}
                    </button>

                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
                        Updated At
                    </Typography>
                    <Typography variant="body1">{row.updated_at}</Typography>
                    </Box>
                </Box>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

    </React.Fragment>
  );
}



export default function AdminModelsListTable({models}) {
    const [modelsList, setModelsList] = useState(models);
    useEffect(() => {
        setModelsList(models);
    },[models])
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow >
            <TableCell className='models-table-title' align='center'><span>ID</span></TableCell>
            <TableCell className='models-table-title' align='center'><span>MODEL NAME</span></TableCell>
            <TableCell className='models-table-title' align='center'><span>DESCRIPTION</span></TableCell>
            <TableCell className='models-table-title' align='center'><span>STATUS</span></TableCell>
            <TableCell className='models-table-title' align='center'><span>VIEW DETAILS</span></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {models.length > 0 && 
            models.map((model) => (
              <Row key={model.id} row={model} />
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}