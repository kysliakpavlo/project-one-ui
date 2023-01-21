import _cloneDeep from 'lodash/cloneDeep';

const initialState = {
    messages: {}
};

const toast = (state = initialState, action) => {
    switch (action.type) {
        case "TOAST_ADD_MESSAGE":
            return {
                ...state,
                messages: {
                    ...state.messages,
                    [action.payload.messageId]: action.payload
                }
            };
        case "TOAST_REMOVE_MESSAGE":
            const messages = _cloneDeep(state.messages);
            delete messages[action.messageId];
            return {
                ...state,
                messages
            };
        case "TOAST_REMOVE_ALL_MESSAGES":
            const tempMessages = [];
            return {
                ...state,
                messages: tempMessages
            };
        default:
            return state;
    }
};

export default toast;
