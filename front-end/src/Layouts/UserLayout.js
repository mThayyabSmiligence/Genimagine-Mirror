import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AuthContext from '../Context/AuthProvider'

export default function UserLayout() {

    const {loggedIn}= useContext(AuthContext)
  return (
    <div>
        { 
            <Outlet></Outlet>
            
        }
    </div>
  )
}
