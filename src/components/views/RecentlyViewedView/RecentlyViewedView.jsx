import React from 'react';
import WatchedItems from '../../common/WatchedItems';

const RecentlyViewedView = ({ socket, activeView, setLoading }) => {
    const recentlyViewed = [];

    return (
        <WatchedItems recentlyViewedItem={true} setLoading={setLoading} recentlyViewedResult={recentlyViewed.result} socket={socket} activeView={activeView} />
    );
};

export default RecentlyViewedView;
