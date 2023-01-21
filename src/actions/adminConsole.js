
export const disableLowerBidInc = (islowerBidDisabled) => ({
    type: "DISABLE_LOWER_BID_INC",
    islowerBidDisabled,
});

export const disableLowerBidBtn = (islowerBidDisabled) => async (dispatch, getState) => {
    await dispatch(disableLowerBidInc(islowerBidDisabled))
}

export const hidePublicHeader = (hide) => ({
    type: "HIDE_PUBLIC_HEADER",
    hide,
});

export const hidePublicConsoleHeader = (hide) => async (dispatch, getState) => {
    await dispatch(hidePublicHeader(hide))
}
