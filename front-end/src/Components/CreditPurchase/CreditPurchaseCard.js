import React from 'react';

function CreditPurchaseCard({ data }) {
    return (
        <div className="card text-center shadow-sm">
            <div className="card-body">
                <h5 className="card-title">{data.package_name} Package</h5>
                <p className="card-text"><strong>{data.credit_points}</strong> Credits</p>
                <p className="card-text text-success">₹{data.required_rupees}</p>
                <p className="text-muted">{data.description}</p>
                <button className="button dark-button">Buy Now</button>
            </div>
        </div>
    );
}

export default CreditPurchaseCard;
