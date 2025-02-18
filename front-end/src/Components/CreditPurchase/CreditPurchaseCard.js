import React from 'react';

function CreditPurchaseCard({ data,buyCredits}) {

    const handelBuy=()=>{
        buyCredits(data.package_id)
    }
    return (
        <div className="card text-center shadow-sm">
            <div className="card-body">
                <h5 className="card-title">{data.package_name} Package</h5>
                <p className="card-text"><strong>{data.credits}</strong> Credits</p>
                <p className="card-text text-success">₹{data.cost}</p>
                <p className="text-muted">{data.description}</p>
                <button onClick={()=>handelBuy()} className="button dark-button">Buy Now</button>
            </div>
        </div>
    );
}

export default CreditPurchaseCard;
