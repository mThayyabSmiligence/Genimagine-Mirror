import React, {  useContext, useEffect } from 'react'
import AuthContext from '../Context/AuthProvider'
import { Outlet, useNavigate } from 'react-router-dom'

export default function AuthenticationLayout() {
    const {auth}=useContext(AuthContext)
    const navigate= useNavigate()

    
  return (
    <div>

    <Outlet></Outlet>
    </div>
  )
}
