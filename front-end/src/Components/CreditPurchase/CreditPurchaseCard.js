import React, { useContext } from 'react';
import AuthContext from '../../Context/AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import '../../Css/CreditPurchaseCard.css'

function CreditPurchaseCard({ data,buyCredits,loggedIn,planStatus}) {

    const location = useLocation()
    const handelBuy=(e)=>{
        buyCredits(data.package_id,null,e)
    }

   const isActivePlan = planStatus?.current_plan?.package_id === data.package_id;
   const isExpiringSoon = isActivePlan && planStatus?.is_expiring_soon;

    let buttonLabel = 'Subscribe';
    if (isActivePlan && isExpiringSoon) {
        buttonLabel = 'Renew';
    }

    return (
        // <div className="card text-center shadow-sm">
        //     <div className="card-body">
        //         <h5 className="card-title">{data.package_name} Package</h5>
        //         <p className="card-text"><strong>{data.credits}</strong> Credits</p>
        //         <p className="card-text text-success">₹{data.cost}</p>
        //         <p className="text-muted">{data.description}</p>

        //             <button onClick={(e)=>handelBuy(e)} className="button dark-button">Buy Now</button>
                  
        //     </div>
        // </div>


        
        <div className={`card text-center shadow-sm rounded-3 p-3 package-card-detail`} >
            
           {
            isActivePlan&&(
                <div className="badge active">Active</div>
            )
           }

            <div className="card-body d-flex flex-column justify-content-between p-0 mt-2">
                <div>
                    <div className='d-flex justify--content-start align-items-center card-content-container mb-2'>
                        <h5 className="card-title title-text">{data.package_name} Package</h5>
                    </div>
                    <div className='card-content-container mb-2'>
                        <p className="card-text plan-credits text-start">{data.credits} Credits</p>    
                    </div>
                    <div className='plan-cost-container card-content-container text-start mb-2'>
                        <p className="card-text plan-cost ">
                            ₹{data.cost} <span>INR/ Month</span>
                        </p>
                    </div>
                    <div className='card-content-container text-start mb-4'> 
                        <p className="card-descrption">{data.description}</p>
                    </div>

                    <button onClick={handelBuy} className={`btn purchase-button ${data.highlight ? 'btn-light text-dark' : 'btn-outline-dark'}`}>
                        {buttonLabel}
                    </button>
                </div>

            </div>
        </div>

        
    );
}

export default CreditPurchaseCard;
