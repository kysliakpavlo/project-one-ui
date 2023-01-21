import _isBoolean from "lodash/isBoolean";

const initialState = {
  advanceSearchOpen: true,
  searchValues: {
    searchQuery: "",
  },
  homeFilters: {},
  homeAuction: null,
  filtersState: {},
  detailsAsset: null,
  auctionFilters: {},
  detailsAuction: null,
};

const advanceSearch = (state = initialState, action) => {
  switch (action.type) {
    case "EXPAND_ADVANCED_SEARCH":
      const advanceSearchOpen = _isBoolean(action.advanceSearchOpen)
        ? action.advanceSearchOpen
        : !state.advanceSearchOpen;
      return {
        ...state,
        advanceSearchOpen,
      };

    case "SET_SEARCH_VALUES":
      return {
        ...state,
        searchValues: action.payload,
      };

    case "SET_SEARCH_FILTERS_STATE":
      return {
        ...state,
        filtersState: action.filters,
      };

    case "SET_DETAILS_ASSET":
      return {
        ...state,
        detailsAsset: action.assetId,
      };

    case "SET_AUCTION_FILTERS_STATE":
      return {
        ...state,
        auctionFilters: action.filters,
      };

    case "SET_DETAILS_AUCTION":
      return {
        ...state,
        detailsAuction: action.auctionId,
      };

    case "SET_HOME_FILTERS_STATE":
      return {
        ...state,
        homeFilters: action.filters,
      };

    case "SET_HOME_AUCTION":
      return {
        ...state,
        homeAuction: action.auctionId,
      };

    default:
      return state;
  }
};

export default advanceSearch;
