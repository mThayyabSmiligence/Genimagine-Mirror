import React, { useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import AuthContext from '../Context/AuthProvider'

export default function UserLayout() {
  const navigate= useNavigate()
  const {loggedIn}= useContext(AuthContext)
  const [loading,setLoading]=useState(true)
  useEffect(() => {
  setTimeout(() => {
    if(loggedIn){
      setLoading(false)
    }else{
      navigate('/')
    }
    
  }, 1000)
  },[loggedIn])
    
  return loading?
          (
            <div className='w-100 h-100 d-flex justify-content-center align-items-center mt-5 pt-5'>
              <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          )
          :(<div>
          { 
              <Outlet></Outlet>
              
          }
          </div>)
  
}
