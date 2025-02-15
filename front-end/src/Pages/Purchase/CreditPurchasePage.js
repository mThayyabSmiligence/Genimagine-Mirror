import React, { useEffect, useState } from 'react'
import CreditPurchaseCard from '../../Components/CreditPurchase/CreditPurchaseCard';
import '../../Css/CreditPurchasePage.css'


function CreditPurchasePage() {

    const [credits, setCredits] = useState("") 
    const [Amount, setAmount] = useState("")
    
    useEffect(() => {
        setAmount(credits)
    },[credits])

    const CreditPurchaseOptions = [
        { credit_points: "10", required_rupees: 10.00, package_name: "Basic", description: "Start with 10 credits" },
        { credit_points: "50", required_rupees: 50.00, package_name: "Plus", description: "Ideal for small tasks" },
        { credit_points: "100", required_rupees: 100.00, package_name: "Pro", description: "Best for frequent users" },
        { credit_points: "250", required_rupees: 250.00, package_name: "Premium", description: "More credits, better value" },
        { credit_points: "500", required_rupees: 500.00, package_name: "Elite", description: "For power users" },
        { credit_points: "1000", required_rupees: 1000.00, package_name: "Ultimate", description: "Bulk purchase, best savings" },
    ]

  return (
    <div className='mt-5'>
        <div className='container'>
            <div className='text-center mb-4'>
                <h3>Purchase Credits</h3>
            </div>
            <div className='row'>
                {CreditPurchaseOptions.map((option, index) => (
                    <div key={index} className='col-md-4 mb-4'>
                        <CreditPurchaseCard data={option} />
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