import { Children, createContext ,useEffect,useState} from "react";
import { axiosPrivate } from "../API's/axios";

const RefreshDataContext = createContext()

export const RefreshDataProvider =({children})=>{

    const [refreshChatList,setRefreshChatList] = useState(true);
    const [refreshCreditBalance,setRefreshCreditBalance] = useState(true)
    const [tempImageData,setTempImageData] = useState(true)

    const [refreshUserData,setRefreshUserData] = useState(true)

    const [refreshLibraryData,setRefreshLibraryData] = useState(true)

    
    const getUserData=async()=>{
        try{
            const response = await axiosPrivate.get('/user-data')
            console.log(response.data)
            if(response.data.status==200){
                localStorage.setItem('user_data', JSON.stringify(response.data.data))
            }
        }
        catch(err){

            console.error(err)
        }
    }



    return (
        <RefreshDataContext.Provider value={{
            refreshChatList,
            setRefreshChatList,
            refreshCreditBalance,
            setRefreshCreditBalance,
            tempImageData,
            setTempImageData,
            getUserData,
            refreshUserData,
            setRefreshUserData,
            refreshLibraryData,
            setRefreshLibraryData
        }}>
            {children}
        </RefreshDataContext.Provider>
    )
}
export default RefreshDataContext