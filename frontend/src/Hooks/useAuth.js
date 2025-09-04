import { useContext,useDebugValue } from "react";
import AuthContext from "../Context/AuthProvider";

const useAuth=()=>{
    const authContext=useContext(AuthContext);
    useDebugValue(authContext);
    return useContext(AuthContext);
}

export default useAuth;