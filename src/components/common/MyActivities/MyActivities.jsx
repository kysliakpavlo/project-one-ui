import React, { useEffect, useRef } from 'react';
import dayjs from "dayjs";
import './MyActivities.scss';
import SvgComponent from '../SvgComponent';

const MyActivities = ({ list, accountId, onScrollToEnd }) => {
    const myActivityRef = useRef(null);

    useEffect(() => {
        myActivityRef.current?.addEventListener('scroll', loadMore);
        return () => {
            myActivityRef.current?.removeEventListener('scroll', loadMore);
        };
    }, []);

    const loadMore = () => {
        const scrolled = myActivityRef.current.scrollTop + myActivityRef.current.clientHeight;
        const scroll = myActivityRef.current.scrollHeight;
        if (scrolled + 1.5 >= scroll) {
            onScrollToEnd();
        }
    }

    return (
        <div className="my-activities">
            <div className="title">My Activities</div>
            <div className="activities" ref={myActivityRef}>
                {Array.isArray(list) && list.map((log, index) => {
                    if (log.accountId === accountId && !log.isBiddingLog) {
                        return (
                            <div className="logWrapper" key={index}>
                                <div className="log-content">
                                    <SvgComponent path="face_black" />
                                    <div className="msg">{log.message}</div>
                                </div>
                                <div className="alias-container">
                                    <span className="alias-name">{log.accountAlias}</span>
                                    <span className="log-posting-time">{dayjs(log.createdAt).format('HH:mm A')}</span>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
        </div>
    )
}

export default MyActivities;