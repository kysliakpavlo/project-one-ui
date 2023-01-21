import React from "react";
import BuyerCard from "../../common/BuyerCard";

const BuyerCardView = ({ match, loggedInUser, socket }) => {
    const auctionId = match.params.auctionId;

    return (
        <div >
            <BuyerCard loggedInUser={loggedInUser} auctionId={auctionId} socket={socket} />
        </div>
    );
};

export default BuyerCardView;
