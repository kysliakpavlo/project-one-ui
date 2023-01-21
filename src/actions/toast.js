export const actionShowMessage = (payload) => ({
    type: "TOAST_ADD_MESSAGE",
    payload
});

export const actionRemoveMessage = (messageId) => ({
    type: "TOAST_REMOVE_MESSAGE",
    messageId
});

export const actionRemoveAllMessages = () => ({
    type: "TOAST_REMOVE_ALL_MESSAGES"
});


export const showMessage = ({ messageId = new Date().getTime(), duration = 5000, message, autohide = true, type = 'success' }) => dispatch => {
    dispatch(actionShowMessage({ messageId, type, duration, autohide, message }));
    return messageId;
};

export const removeMessage = (messageId) => dispatch => {
    dispatch(actionRemoveMessage(messageId));
};

export const removeAllMessages = () => dispatch => {
    dispatch(actionRemoveAllMessages());
};
