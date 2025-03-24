import React, { useContext } from 'react';
import AuthContext from '../../Context/AuthProvider';
import { Link, useLocation } from 'react-router-dom';

function CreditPurchaseCard({ data,buyCredits,loggedIn}) {

    const location = useLocation()
    const handelBuy=(e)=>{
        buyCredits(data.package_id,null,e)
    }
    return (
        <div className="card text-center shadow-sm">
            <div className="card-body">
                <h5 className="card-title">{data.package_name} Package</h5>
                <p className="card-text"><strong>{data.credits}</strong> Credits</p>
                <p className="card-text text-success">₹{data.cost}</p>
                <p className="text-muted">{data.description}</p>

                    <button onClick={(e)=>handelBuy(e)} className="button dark-button">Buy Now</button>
                  
            </div>
        </div>
    );
}

export default CreditPurchaseCard;
