import React, { useEffect, useState } from 'react'
import { axiosModerator, axiosPrivate } from '../../API\'s/axios';
import { Link } from "react-router-dom";
import '../../Css/UserManagement.css'
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';


export default function UserManagement() {

  const [users, setUsers] = useState([]);

  
  useEffect(() => {
    getAllUsers()
  },[])

  const getAllUsers = async () => {
    // try{
    //   const response = await axiosPrivate.get('list')
    //   console.log(response.data)
    //   setUsers(response.data.users)
    // }catch(err){
    //   console.log(err)
    // }
    try {
    const [usersRes, reportCountRes] = await Promise.all([
      axiosPrivate.get('list'),
      axiosModerator.get('/user-reported-image-counts')
    ]);

    const reportCountsMap = {};
    reportCountRes.data.data.forEach(item => {
     reportCountsMap[item.user_id] = {
        report_count: item.report_count || 0,
        no_action_count: item.no_action_count || 0,
        suspend_count: item.suspend_count || 0,
        // warn: item.warning_count || 0,
        // suspend: item.suspend_count || 0
      };
    });

    const mergedUsers = usersRes.data.users.map(user => ({
      ...user,
      image_report_count: reportCountsMap[user.user_id]?.report_count || 0,
      no_action_count: reportCountsMap[user.user_id]?.no_action_count || 0,
      suspend_count: reportCountsMap[user.user_id]?.suspend_count || 0
      // action_taken_summary: {
      //   warn: reportCountsMap[user.user_id]?.warning || 0,
      //   suspend: reportCountsMap[user.user_id]?.suspended || 0
      // }
    }));
    console.log("user data", mergedUsers)

    setUsers(mergedUsers);
  } catch (err) {
    console.log("Error fetching user data or report counts:", err);
  }
  }

  const handleVerificationStatus = (is_verified) => {
    if(is_verified === 0) {
      return(
        <span className='text-danger fw-semibold'>Not Verified</span>
      )
    }else{
      return(
        <span className='text-success fw-semibold'>Verified</span>
      )
    }
  }


  const handleUserStatus =(status) => {
    if(status === "active") {
      return(
        <span className='text-success fw-semibold'>Active</span>
      )
    }else if(status == "banned") {
      return(
        <span className='text-danger fw-semibold'>Banned</span>
      )
    }else if(status == "suspended") {
      return(
        <span className='text-primary fw-semibold'>Suspended</span>
      )
    }else{
      return(
        <span className='text-danger fw-semibold'>deleted</span>
      )
    }
  }

  const handleBanUser = async (userId, status) => {
    try {
      const response = await axiosModerator.post(`${userId}/ban`);
      console.log(response.data);

      setUsers(prevUsers =>  prevUsers.map(user =>
        user.user_id === userId
          ? { ...user, status: "banned" }
          : user
      ));
    } catch (error) {
      console.error("Error banning user:", error);
    }
  }

  const handleUnBanUser = async (userId) => {
    try {
      const response = await axiosModerator.post(`${userId}/unban`);
      console.log(response.data);
      setUsers(prevUsers =>  prevUsers.map(user =>
        user.user_id === userId
          ? { ...user, status: "active" }
          : user
      ));
      
    } catch (error) {
      console.error("Error unbanning user:", error);
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axiosModerator.post(`${userId}/delete`);
      console.log(response.data);
      setUsers(prevUsers =>  prevUsers.map(user =>
        user.user_id === userId
          ? { ...user, status: "deleted" }
          : user
      ));
      
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  return (
    <div className="p-6 user-management-container">
      <h1 className="text-xl font-bold mb-4">User Management</h1>
      <div className='d-flex justify-content-center'>

        <table className="w-full border-collapse border mx-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">User Id</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Age</th>
              <th className="border p-2">Verification <br/>Status</th>
              <th className="border p-2">Credit Balance</th> 
              <th className="border p-2">Reported Image<br/> count</th> 
              <th className="border p-2">No Action</th> 
              <th className="border p-2">Action taken</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.user_id}>
                <td className="border p-2">{user.user_id}</td>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2">{user.age}</td>
                <td className="border p-2">{handleVerificationStatus(user.is_verified )}</td>
                <td className="border p-2">{user.credits}</td>
                <td className="border p-2">{user.image_report_count}</td>
                <td className="border p-2">{user.no_action_count}</td>
                {/* <td className="border p-2">
                  {Object.entries(user.action_taken_summary).map(([action, count]) => (
                    <div key={action}>{action}: {count}</div>
                  ))}
                </td> */}
               <td className="border p-2">
                  {user.warning_data?.count > 0 ? (
                    <div className={`action-summary ${user.warning_data ? "warn-in" : "warn-out"}`}>
                      Warn: {user.warning_data.count}
                    </div>
                  ) : (
                    <div className="text-muted">--</div>
                  )}

                  {user.suspend_count > 0 ? (
                    <div className={`action-summary ${user.suspend_count ? "suspend-in" : "suspend-out"}`}>
                      Suspend: {user.suspend_count}
                    </div>
                  ) : (
                    <div className="text-muted">--</div>
                  )}
                </td>

                <td className="border p-2">{handleUserStatus(user.status)}</td>
                <td className="border p-3 d-flex justify-content-start align-items-center gap-1">
                  <Link to={`/moderator/user-Detail/${user.user_id}`} title='view details' className=" underline icon-button-style view-icon">
                    <VisibilityRoundedIcon className='action-icon '/>
                  </Link>
                  {
                    (user?.status === "active" || user?.status === "suspended") && (
                        <button className='icon-button-style ban-icon' onClick={() => handleBanUser(user.user_id)}>
                          <BlockRoundedIcon className='action-icon ' title='unban user'/>
                        </button>
                      )
                    }
                    {
                      user.status === "banned" && (
                        <button className='icon-button-style unban-icon' onClick={() => handleUnBanUser(user.user_id, user.status)}>
                          <BlockRoundedIcon className='action-icon ' title='ban user'/>
                        </button>
                      )
                    }
                    {
                      user.status === "deleted" && (
                        <button disabled className='icon-button-style ban-icon ' onClick={() => handleBanUser(user.user_id)}>
                        <BlockRoundedIcon  className='action-icon ' title='unban user'/>
                      </button>
                      )
                    }

                    <button  disabled={user.status == "deleted"} className='icon-button-style delete-icon' onClick={() => handleDeleteUser(user.user_id)}>
                      <DeleteOutlineRoundedIcon  className='action-icon icon' title='delete user'/>
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}