import { createContext ,useEffect,useState} from "react";
import { axiosPrivate } from "../API's/axios";


const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState({});
    const [loggedIn, setLoggedIn] = useState(false)

    useEffect(()=>{
        verifyUser()
        
    },[])
    const verifyUser = async() =>{
        try{
            const response = await axiosPrivate.get("verify-token")
            console.log(response)
            setLoggedIn(true)
        }catch(err){
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