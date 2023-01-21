import React from "react";
import { decrypt } from '../../../utils/helpers';
import PublicConsole from "../../common/PublicConsole";

const PublicConsoleView = ({ match, loggedInUser, socket, showMessage, removeMessage, removeAllMessages, location }) => {
    const auctionId = decrypt(match.params.auctionId);
    return (
        <div style={{ backgroundColor: "#f1efef" }}>
            <PublicConsole auctionId={auctionId} loggedInUser={loggedInUser} socket={socket} showMessage={showMessage} removeMessage={removeMessage} removeAllMessages={removeAllMessages} />
        </div>
    );
};

export default PublicConsoleView;
