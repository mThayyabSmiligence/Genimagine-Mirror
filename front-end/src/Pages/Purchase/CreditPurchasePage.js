import React, { useContext, useEffect, useState } from 'react'
import CreditPurchaseCard from '../../Components/CreditPurchase/CreditPurchaseCard';
import '../../Css/CreditPurchasePage.css'
import { axiosInstance } from "../../API's/axios";
import RefreshDataContext from '../../Context/RefreshDataProvider';


function CreditPurchasePage() {

    const { refreshCreditBalance,setRefreshCreditBalance} = useContext(RefreshDataContext)

    const [credits, setCredits] = useState("") 
    const [Amount, setAmount] = useState("")
    const[CreditPurchaseOptions,setCreditPurchaseOptions] = useState(null)
    const [loading, setLoading] = useState(true)


    const[error,setError] = useState(false)
    const[errorMessage,setErrorMessage] = useState("")

    const [success,setSuccess] = useState(false)
    const [successMessage,setSuccessMessage] = useState("")
    
    useEffect(() => {
        setAmount(credits)
    },[credits])

    useEffect(() => {
        setTimeout(() =>{
            setSuccess(false)
            setError(false)
        },5000)
    },[success,error])


    useEffect(() => {
        // if(sessionStorage.getItem('creditPurchaseOptions')){
        //     const purchaseOptions = sessionStorage.getItem('creditPurchaseOptions')
        //     setCreditPurchaseOptions(JSON.parse(purchaseOptions))
        //     setLoading(false)
        // return
        // }
        getCreditPurchaseOptions()
    }, [])
    
    const getCreditPurchaseOptions = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get('/no-auth/get-packages');
            console.log(response.data)
            setCreditPurchaseOptions(response.data.data);
            sessionStorage.setItem('creditPurchaseOptions', JSON.stringify(response.data.data))
            setLoading(false)
        } catch (error) {
            console.error(error);
        }
    }
    const buyCredits=async(package_id)=>{
        try {
            const response = await axiosInstance.put(`/user/buy-credits/${package_id}`, { package_id: Amount });

            setCredits(response.data.credits)
            setErrorMessage("")
            setError(false)
            setSuccessMessage(response.data.message)
            setSuccess(true)


            const currentCreditsBalance= localStorage.getItem('credit_balance')

            localStorage.setItem("credit_balance",response.data.credits_purchased+Number(currentCreditsBalance))

            setRefreshCreditBalance(!refreshCreditBalance)
        } catch (error) {
            console.error(error);
            setError(true)
            setErrorMessage(error?.response?.data?.message)
        }
    }

  return (
    <div className='mt-5'>
        <div className='container'>
            {
                loading&&
                <h5>Loading...</h5>
            }
            <div className='text-center mb-4'>
                <h3>Purchase Credits</h3>
            </div>
            {
                error &&
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            }
            {
                success &&
                <div className="alert alert-success" role="alert">
                    {successMessage}
                </div>
            }

            <div className='row'>
                {CreditPurchaseOptions&&CreditPurchaseOptions.map((option, index) => (
                    <div key={index} className='col-md-4 mb-4'>
                        <CreditPurchaseCard data={option} buyCredits={buyCredits}/>
                    </div>
                ))}
            </div>
        </div>

        <div className='customise-credit-purchase-container d-flex flex-column align-items-center'>
            <div className='divider d-flex align-items-center mb-3 w-100'>
                <span className='divider-line-2 flex-1'></span>
                <h3 className='divider-or '>Customise Credit Purchase</h3>
                <span className='divider-line-2 flex-1'></span>
            </div>
            <button onClick={()=>getCreditPurchaseOptions()}>load option list</button>

            <div className='customise-credit-purchase card shadow-sm p-2 mt-3'>
                <div className='d-flex flex-wrap my-3 row justify-content-center'>
                    <div className='customise-credit-input col-md-4 d-flex justify-content-end align-items-center p-0 credit-purchase '>
                        <input type="text" placeholder='enter credits' className="credit-input ms-2 " value={credits} onChange={(e) => { setCredits(e.target.value) }}/>
                        <p className='ms-3 mb-0'>credits</p>
                    </div>

                    <div className='col-md-4 p-0 d-flex align-items-center credit-purchase'>
                       <p className='me-3 mb-0 ms-2'>For</p>
                       <span className='me-1'>₹</span>
                       <input type='text' placeholder='amount' className='credit-amount-input br-5' value={Amount} disabled/>
                       <p className='ms-3 mb-0'>Rupees</p>
                    </div>

                    <div className='customise-credit-button col-md-4 p-0 d-flex justify-content-center credit-purchase'>
                        <button className='button dark-button me-2'>Purchase</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CreditPurchasePage;