import React, { useEffect, useState } from 'react'
import CreditPurchaseCard from '../../Components/CreditPurchase/CreditPurchaseCard';
import '../../Css/CreditPurchasePage.css'
import { axiosInstance } from '../../API\'s/axios';


function CreditPurchasePage() {

    const [credits, setCredits] = useState("") 
    const [Amount, setAmount] = useState("")
    const[CreditPurchaseOptions,setCreditPurchaseOptions] = useState({})


    const[error,setError] = useState(false)
    const[errorMessage,setErrorMessage] = useState("")
    
    useEffect(() => {
        setAmount(credits)
    },[credits])



    useEffect(() => {
        if(localStorage.getItem('creditPurchaseOptions')){
            const purchaseOptions = localStorage.getItem('creditPurchaseOptions')
            setCreditPurchaseOptions(JSON.parse(purchaseOptions))
        return
        }
        getCreditPurchaseOptions()
    }, [])
    
    const getCreditPurchaseOptions = async () => {
        try {
            const response = await axiosInstance.get('/no-auth/get-packages');
            console.log(response.data)
            setCreditPurchaseOptions(response.data.data);
            localStorage.setItem('creditPurchaseOptions', JSON.stringify(response.data.data))
        } catch (error) {
            console.error(error);
        }
    }

  return (
    <div className='mt-5'>
        <div className='container'>
            <div className='text-center mb-4'>
                <h3>Purchase Credits</h3>
            </div>
            {
                error &&
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            }
            <div className='row'>
                {/* {CreditPurchaseOptions.map((option, index) => (
                    <div key={index} className='col-md-4 mb-4'>
                        <CreditPurchaseCard data={option} />
                    </div>
                ))} */}
            </div>
        </div>

        <div className='customise-credit-purchase-container d-flex flex-column align-items-center'>
            <div className='divider d-flex align-items-center mb-3 w-100'>
                <span className='divider-line-2 flex-1'></span>
                <h3 className='divider-or '>Customise Credit Purchase</h3>
                <span className='divider-line-2 flex-1'></span>
            </div>

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