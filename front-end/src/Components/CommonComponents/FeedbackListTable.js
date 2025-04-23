import * as React from 'react';
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { axiosModerator } from '../../API\'s/axios';
import '../../Css/FeedbackListTable.css'
import { useState } from 'react';
import FeedbackResponsePopUp from './FeedbackResponsePopUp';
import { useEffect } from 'react';


function Row({row}) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = useState(row.status || "pending");
  const [showResponsePopup, setShowResponsePopup] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    try {
      const response = await axiosModerator.post(`updatestatus/${row.feedback_id}`, {
        status: newStatus,
      });

      console.log("Status update response:", response.data);
    } catch (error) {
      console.error("Failed to update status:", error);
      // Optionally show a toast/error to the user
    }
  };

  const handleResponseSubmit = async (feedbackId, responseMessage) => {
    try {
      const response = await axiosModerator.post(`/respond/${feedbackId}`, {
        response: responseMessage,
      });
      if (response.data.success) {
        setStatus('reviewed');
      }
      console.log('Response submitted:', response.data);
    } catch (err) {
      console.error('Error responding to feedback:', err);
    }
  };


console.log("Row data:", row);
  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>

        <TableCell component="th" scope="row" align='center'>
          {row.feedback_id}
        </TableCell>
        <TableCell align="center">{row.user_id}</TableCell>
        <TableCell align="center">{row.category}</TableCell>
        <TableCell align="center">
        <select
            value={status}
            onChange={handleStatusChange}
             className={`status-dropdown ${status}`}
          >
            {["pending", "in_progress", "reviewed", "resolved"].map((option) => (
            <option
                className={`status-option`}
                key={option}
                value={option}
                disabled={option === status}
            >
                {option.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase())}
            </option>
            ))}
        </select>
        </TableCell>
        <TableCell align="center">
            <button onClick={() => setShowResponsePopup(true)} className='feedback-response-btn'>Response</button>
        </TableCell>
        <TableCell align="center">
            <button className='notice-feedback-btn'>notify</button>
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
              <Typography variant="h6" gutterBottom component="div">
                Feedback Details
              </Typography>
              <Table aria-label="purchases">
                {/* <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Total price ($)</TableCell>
                  </TableRow>
                </TableHead> */}
                <TableBody>
                  <div className='user-message-container mb-2'>
                    <div className='p-2 '>
                        <p>{row.message}</p>
                    </div>
                  </div>
                  <div className='moderator-response-container'>
                    <div className='p-2 '>
                        <p>{row.response}</p>
                    </div>
                  </div>            
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {showResponsePopup && (
        <FeedbackResponsePopUp
          onHide={() => setShowResponsePopup(false)}
          show={showResponsePopup}
          feedbackId={row.feedback_id}
          handleResponseSubmit={handleResponseSubmit}
        />
      )}
    </React.Fragment>
  );
}



export default function CollapsibleTable({feedbacks}) {
    const [feedbackList, setFeedbackList] = useState(feedbacks);
    useEffect(() => {
        setFeedbackList(feedbacks);
    },[feedbacks])
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow >
            <TableCell className='fw-bold' align='center'>Feedback ID</TableCell>
            <TableCell className='fw-bold' align='center'>User ID</TableCell>
            <TableCell className='fw-bold' align='center'>Category</TableCell>
            <TableCell className='fw-bold' align='center'>Status</TableCell>
            <TableCell className='fw-bold' align='center'>Response</TableCell>
            <TableCell className='fw-bold' align='center'>Notify to admin</TableCell>
            <TableCell className='fw-bold' align='center'>ViewDetails</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
  {feedbacks.length > 0 && 
    [...feedbackList].reverse().map((feedback) => (
      <Row key={feedback.feedback_id} row={feedback} />
    ))
  }
</TableBody>

      </Table>
    </TableContainer>
  );
}
















// Row.propTypes = {
//   row: PropTypes.shape({
//     calories: PropTypes.number.isRequired,
//     carbs: PropTypes.number.isRequired,
//     fat: PropTypes.number.isRequired,
//     history: PropTypes.arrayOf(
//       PropTypes.shape({
//         amount: PropTypes.number.isRequired,
//         customerId: PropTypes.string.isRequired,
//         date: PropTypes.string.isRequired,
//       }),
//     ).isRequired,
//     Feedback_ID: PropTypes.string.isRequired,
//     price: PropTypes.number.isRequired,
//     protein: PropTypes.number.isRequired,
//   }).isRequired,
// };


{/* {row.history.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.date}
                      </TableCell>
                      <TableCell>{historyRow.customerId}</TableCell>
                      <TableCell align="right">{historyRow.amount}</TableCell>
                      <TableCell align="right">
                        {Math.round(historyRow.amount * row.price * 100) / 100}
                      </TableCell>
                    </TableRow>
                  ))} */}