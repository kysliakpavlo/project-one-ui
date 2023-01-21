import React from 'react';
import AssetDetail from '../../common/AssetDetail';

const AuctionDetailView = ({ loggedInUser, showMessage, toggleLogin, location, socket }) => {
    return (
        <AssetDetail loggedInUser={loggedInUser} showMessage={showMessage} toggleLogin={toggleLogin} location={location} socket={socket} />
    );
};

export default AuctionDetailView;
