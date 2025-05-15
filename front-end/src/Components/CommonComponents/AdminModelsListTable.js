import '../../Css/AdminModelManagement.css'
import * as React from 'react';
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


function Row({row}) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleEdit = (modelId) => {
    navigate(`/admin/model/edit/${modelId}`);
  };

  const handleViewModelDetail = (modelId) => {
    navigate(`/admin/model-detail/${modelId}`)
  }

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>

        <TableCell component="th" scope="row" align='center'>
          {row.id}
        </TableCell>
        <TableCell align="center" className={` model-name-field ${row.name ? "data-acquired" : "no-data-acquired"}`}><span>{row.name || "model name is empty"}</span></TableCell>
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
        <TableCell align="center">
          <button className="edit-btn reviewd-btn" onClick={() => handleEdit(row.id)}>Edit</button>
        </TableCell>
        <TableCell align="center">
          <button className="view-detail-btn" onClick={() => handleViewModelDetail(row.id)}>View Details</button>
        </TableCell>
 
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Left Column - Quality Table */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom className='model-detail-heading'>
                <span>Selected Quality</span>
                </Typography>
                <Table size="small" aria-label="quality" sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
                <TableHead>
                    <TableRow>
                    <TableCell>Quality ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Credit Points</TableCell>
                    </TableRow>
                </TableHead>
                    <TableBody>
                        {row.resolution_config?.map((res) => (
                        <TableRow key={res.quality_level_id}>
                        <TableCell>{res.quality_level_id}</TableCell>
                        <TableCell>{res.name}</TableCell>
                        <TableCell>{res.credit_points}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </Box>

            {/* Right Column - Aspect Ratio Table */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" gutterBottom className='model-detail-heading'>
                <span>Selected Aspect Ratio </span>
                </Typography>
                <Table size="small" aria-label="aspect ratio" sx={{ border: '1px solid #ccc', borderRadius: 10 }}>
                <TableHead>
                    <TableRow>
                    <TableCell>Aspect Ratio ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Credit Points</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {row.aspect_ratio_config?.map((aspect) => (
                        <TableRow key={aspect.aspect_ratio_id}>
                          <TableCell>{aspect.aspect_ratio_id}</TableCell>
                          <TableCell>{aspect.ratio}</TableCell>
                          <TableCell>{aspect.credit_points}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                </Table>
            </Box>
            </Box>
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
            <TableCell></TableCell>
            <TableCell></TableCell>
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



// <Box className='model-details-preview' sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
                    
//                     <Box sx={{ flex: 1, minWidth: '300px' }}>

//                     <Typography variant="body1" sx={{fontWeight: 'bold',mb: 2 }} className='model-detail-heading'>
//                         <span>{row.id}. {row.name.charAt(0).toUpperCase() + row.name.slice(1)}</span>
//                     </Typography>

//                         <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Description</Typography>
//                         <Typography variant="body1" sx={{ mb: 2 }}>
//                         {row.description || "This is model with super fast"}
//                         </Typography>

//                         <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Cloudflare Model URL</Typography>
//                         <Typography variant="body1" className='model-url'>
//                         {row.cloudflare_model_url}
//                         </Typography>

//                         <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>Created At</Typography>
//                         <Typography variant="body1" sx={{ mb: 2 }}>{row.created_at}</Typography>
//                     </Box>

                
//                     <Box sx={{ flex: 1, minWidth: '300px' }}>
//                     <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 5.6, mb: 1 }}>
//                         Status
//                     </Typography>
//                     <button
//                         className={`status-btn ${row?.is_active ? 'active' : 'Inactive'}`}
//                         title={row?.is_active ? "Active" : "In Active"}
//                     >
//                         {row?.is_active ? "Active" : "In Active"}
//                     </button>

//                     <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
//                         Is Default
//                     </Typography>
//                     <button
//                         className={`default-btn ${row?.is_default ? 'isDefault' : 'isNotDefault'}`}
//                         title={row?.is_default ? "Unset Default" : "Set Default"}
//                     >
//                         {row?.is_default ? "Default" : "Set as Default"}
//                     </button>

//                     <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
//                         Updated At
//                     </Typography>
//                     <Typography variant="body1">{row.updated_at}</Typography>
//                     </Box>
//                 </Box>