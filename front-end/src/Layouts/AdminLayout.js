import React, {  useContext,useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
    const navigate= useNavigate()

    
    const userData = JSON.parse(localStorage.getItem("user_data"));
    // if (!userData || userData.role !== "admin") {
    //     return navigate("/unauthorized", {replace:true})
    // }
    useEffect(() => {
        console.log("userData", userData)
        if (!userData || userData.role!== "admin") {
            navigate("/", {replace: true})
        }
    }, [])


    return (
        <div>
            <h2>Admin Panel</h2>
            {/* <nav>
                <ul>
                    <li><a href="/admin/dashboard">Dashboard</a></li>
                    <li><a href="/admin/settings">Settings</a></li>
                </ul>
            </nav> */}
            <Outlet />
        </div>
    );
};