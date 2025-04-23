import React, { useEffect, useState } from 'react'
import CollapsibleTable from '../../Components/CommonComponents/FeedbackListTable'
import { axiosModerator } from '../../API\'s/axios';

function ModeratorFeedbacks() {

    const [feedbacks, setFeedbacks] = useState([]);

    const getfeedbacksData = async() => {
        try{
            const response = await axiosModerator.post('getfeedbacks')
                setFeedbacks(response.data.rows);
                console.log("Feedbacks data:", response.data.rows);
            } catch(err){
            console.error("Error fetching feedbacks:", err);
        }
    }

    useEffect(() => {
      getfeedbacksData()
    }, []);
  
  return (
    <div className='mx-5'>
        <h1 className='h-2 text-start mb-3'>Feedbacks</h1>
        <CollapsibleTable
        feedbacks ={feedbacks}
        />
    </div>
  )
}

export default ModeratorFeedbacks