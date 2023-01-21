const advanceSearchClicked = (advanceSearchOpen) => ({
    type: "EXPAND_ADVANCED_SEARCH",
    advanceSearchOpen,
});

const actionSetSearchValues = (payload) => ({
    type: "SET_SEARCH_VALUES",
    payload,
});

const actionSetSearchFilterState = (filters) => ({
    type: "SET_SEARCH_FILTERS_STATE",
    filters,
});

const actionSetDetailsAsset = (assetId) => ({
    type: "SET_DETAILS_ASSET",
    assetId,
});

const actionSetAuctionFilterState = (filters) => ({
    type: "SET_AUCTION_FILTERS_STATE",
    filters,
});

const actionSetDetailsAuction = (auctionId) => ({
    type: "SET_DETAILS_AUCTION",
    auctionId,
});

const actionSetHomeAuction = (auctionId) => ({
    type: "SET_HOME_AUCTION",
    auctionId,
});

const actionSetHomeFiltersState = (filters) => ({
    type: "SET_HOME_FILTERS_STATE",
    filters,
});

export const setAdvancedSearchState = (advanceSearchOpen) => dispatch => {
    dispatch(advanceSearchClicked(advanceSearchOpen));
}

export const setSearchValues = (values) => dispatch => {
    dispatch(actionSetSearchValues(values));
}

export const setSearchFilterState = (filters) => dispatch => {
    dispatch(actionSetSearchFilterState(filters));
}

export const setDetailsAsset = (assetId) => dispatch => {
    dispatch(actionSetDetailsAsset(assetId));
}

export const setAuctionFilterState = (filters) => dispatch => {
    dispatch(actionSetAuctionFilterState(filters));
}

export const setDetailsAuction = (auctionId) => dispatch => {
    dispatch(actionSetDetailsAuction(auctionId));
}

export const setHomeAuction = (auctionId) => dispatch => {
    dispatch(actionSetHomeAuction(auctionId));
}

export const setHomeFiltersState = (filters) => dispatch => {
    dispatch(actionSetHomeFiltersState(filters));
}
