import { Children, createContext ,useEffect,useState} from "react";

const RefreshDataContext = createContext()

export const RefreshDataProvider =({children})=>{

    const [refreshChatList,setRefreshChatList] = useState(true);
    const [refreshCreditBalance,setRefreshCreditBalance] = useState(true)


    return (
        <RefreshDataContext.Provider value={{
            refreshChatList,
            setRefreshChatList,
            refreshCreditBalance,
            setRefreshCreditBalance
        }}>
            {children}
        </RefreshDataContext.Provider>
    )
}
export default RefreshDataContext