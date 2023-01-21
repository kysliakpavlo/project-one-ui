const initialState = {
    disableLowerBid: false
};

const adminConsole = (state = initialState, action) => {
    switch (action.type) {
        case "DISABLE_LOWER_BID_INC":
            return {
                ...state,
                disableLowerBid: action.islowerBidDisabled
            }
        case "HIDE_PUBLIC_HEADER":
            return {
                ...state,
                hidePublicHeader: action.hide
            }
        default:
            return state;
    }
};

export default adminConsole;
