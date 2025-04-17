import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

const PurchasePage = ({ search, purchaseData }) => {
    const [txnData, setTxnData] = useState([]);

    useEffect(() => {
        setTxnData(purchaseData);
    }, [purchaseData]);

    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    return (
        <div className="purchase-container">
            {txnData?.length > 0 ? (
                txnData
                    .filter(
                        (item) =>
                            item?.serviceDetails[0]?.name.toLowerCase().startsWith(search?.toLowerCase()) ||
                            item.purchaseStatus.toLowerCase().startsWith(search?.toLowerCase())
                    )
                    .map((each, i) => (
                        <div className="purchase-card" key={i}>
                            <div className="purchase-info">
                                <h3>{each?.serviceDetails[0]?.name}</h3>
                                <p><strong>Date:</strong> {dateFormat(each?.createdAt)}</p>
                                <p><strong>Customer:</strong> {each?.serviceDetails[0]?.productcreatoremail}</p>
                                <p><strong>Amount:</strong> {each?.serviceDetails[0]?.billing_cycle?.lifetime?.price || 
                                    each?.serviceDetails[0]?.billing_cycle?.monthly?.price || 
                                    each?.serviceDetails[0]?.billing_cycle?.annual?.price} 
                                    {each?.serviceDetails[0]?.billing_cycle?.lifetime?.coin || 
                                    each?.serviceDetails[0]?.billing_cycle?.monthly?.coin || 
                                    each?.serviceDetails[0]?.billing_cycle?.annual?.coin}
                                </p>
                                <p><strong>Billing Frequency:</strong> {each?.serviceDetails[0]?.chargingtype}</p>
                                <p><strong>Status:</strong> {each?.serviceDetails[0]?.purchaseStatus || "N/A"}</p>
                            </div>
                        </div>
                    ))
            ) : (
                <div className="no-data-message">No Purchases Found</div>
            )}
        </div>
    );
};

export default PurchasePage;
