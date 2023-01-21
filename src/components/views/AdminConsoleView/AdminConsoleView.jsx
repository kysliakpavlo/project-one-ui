import React from "react";
import { decrypt } from '../../../utils/helpers';
import AdminConsole from "../../common/AdminConsole";

const AdminConsoleView = ({ match, loggedInUser, socket, showMessage, removeMessage, removeAllMessages }) => {
    const auctionId = decrypt(match.params.auctionId);

    return (
        <div style={{ backgroundColor: "#f1efef" }}>
            <AdminConsole loggedInUser={loggedInUser} auctionId={auctionId} socket={socket} showMessage={showMessage} removeMessage={removeMessage} removeAllMessages={removeAllMessages} />
        </div>
    );
};

export default AdminConsoleView;
