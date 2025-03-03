import { createContext ,useEffect,useState} from "react";
import { axiosPrivate } from "../API's/axios";
import { useLocation } from "react-router-dom";


const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState({});
    const [loggedIn, setLoggedIn] = useState(false)
   

    const location = useLocation()


    useEffect(()=>{
            verifyUser()
    },[])
    const verifyUser = async() =>{
        try{
            const response = await axiosPrivate.get("verify-token")
            console.log(response)
            setLoggedIn(true)
        }catch(err){
            setLoggedIn(false)
            console.error("error verifying user", err)
        }
    }
    return(
        <AuthContext.Provider value={{auth, setAuth,loggedIn,setLoggedIn}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;