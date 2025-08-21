import React, { createContext, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import RefreshDataContext from './RefreshDataProvider';

const RoleAuthContext = createContext();

export default function RoleAuthProvider({children}) {
    const location = useLocation()
    const path = location.pathname; 
    const navigate = useNavigate();
    console.log("path", path)
    const [userData, setUserData] = useState("");
    const {refreshUserData,setRefreshUserData} = useContext(RefreshDataContext) 

    useEffect(() => {
        const getUserData = localStorage.getItem('user_data');
        if (getUserData) {
          const parsedData = JSON.parse(getUserData);
          setUserData(parsedData);
        }
        else{
            setUserData(null)
        }
      }, [refreshUserData]);

    useEffect(() => {
        if (userData) {
          verifyUserRole();
        }
      }, [userData, location]);

    const verifyUserRole = () => {
        const firstPathSegment = path.split('/')[1];
        if (userData.role === 'admin' && firstPathSegment !== 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userData.role === 'moderator' && firstPathSegment !== 'moderator') {
          navigate('/moderator/dashboard', { replace: true });
        }
    };
    return(
        <RoleAuthContext.Provider value={{ userData }}>
            {children}
        </RoleAuthContext.Provider>
    )
}

