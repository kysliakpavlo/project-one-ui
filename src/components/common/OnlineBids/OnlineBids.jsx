import React, { useEffect, useRef, useState } from 'react';
import Button from "react-bootstrap/Button";
import dayjs from "dayjs";
import Visible from "../Visible";
import './OnlineBids.scss';
import SvgComponent from '../SvgComponent';

const OnlineBids = ({ bids = [], assetId, acceptBid, isDisable }) => {
    const [showAccept, setShowAccept] = useState({});

    const onlineBidRef = useRef(null);
    useEffect(() => {
        scrollToMyRef();
    }, [bids])

    const scrollToMyRef = () => {
        const scroll =
            onlineBidRef.current.scrollHeight -
            onlineBidRef.current.clientHeight;
        onlineBidRef.current.scrollTo(0, scroll);

    };
    const showAcceptBtn = (show, bidId) => {
        const obj = {};
        if (show) {
            obj[bidId] = true;
        }
        setShowAccept(obj);
    }
    return (
        <div className="online-bids" ref={onlineBidRef}>
            <div className="title">Online Bids</div>
            {bids && bids.map((bid, index) => {
                return (
                    <Visible when={bid.assetId === assetId} key={bid.accountAssetBidId} >
                        <div key={bid.accountAssetBidId} className={`onlinebid-container ${bid.actionType === 'Lower Bid Inc Request' ? 'lower-bid-bg' : ''}`} key={index}
                            onMouseEnter={e => {
                                showAcceptBtn(true, bid.accountAssetBidId);
                            }}
                            onMouseLeave={e => {
                                showAcceptBtn(false, bid.accountAssetBidId);
                            }}>
                            <div className="bid-content">
                                <SvgComponent path="face_black" />
                                <Visible when={bid.actionType === 'Lower Bid Inc Request'}>
                                    <div className="label">Request for lower bid</div>
                                </Visible>
                                <Visible when={bid.actionType !== 'Lower Bid Inc Request'}>
                                    <div className="label">{bid.assetBidAccount.firstName}:</div>
                                    <div className="ml-2">{bid.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</div>
                                </Visible>
                            </div>
                            <div className="alias-container">
                                <span className="alias-name">{bid.assetBidAlias.alias}</span>
                                <span className="log-posting-time">{dayjs(bid.createdDate).format('HH:mm A')}</span>
                            </div>
                            <Visible when={bid.actionType !== 'Lower Bid Inc Request' && !bid.isAdmitted && showAccept[bid.accountAssetBidId]}>
                                <div className="btn-wrapper">
                                    <Button className="accept-btn" onClick={() => { acceptBid(bid) }}>Accept</Button>
                                </div>
                            </Visible>
                        </div>
                    </Visible>
                )
            })}
            <div className={`${isDisable ? 'disable-onlinebids' : 'd-none'} `}></div>
        </div >
    )
};

export default OnlineBids;