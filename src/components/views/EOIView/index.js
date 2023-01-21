import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";
import { setLoading, secureApi } from '../../../actions/app';
import { showMessage } from '../../../actions/toast';
import { toggleLogin } from '../../../actions/auth';
import { setAuctionFilterState, setDetailsAuction } from '../../../actions/advanceSearch';
import { getExpOfInterest } from '../../../utils/api';

import EOIView from "./EOIView";

const mapStateToProps = (state) => {
    const vendor = _get(state, "auth.vendor", {});
    const categories = _get(state, "app.categories", []);
    const locations = _get(state, "app.locations", []);
    const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
    const loggedInUser = _get(state, "auth.loggedInUser", null);
    const auctionFilters = _get(state, "advanceSearch.auctionFilters", {});
    const detailsAuction = _get(state, "advanceSearch.detailsAuction", null);
    const isLoading = _get(state, "app.isLoading", false);

    return {
        vendor,
        locations,
        categories,
        isLoggedIn,
        loggedInUser,
        auctionFilters,
        detailsAuction,
        isLoading
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    showMessage,
    toggleLogin,
    setLoading,
    setDetailsAuction,
    setAuctionFilterState,
    getExpOfInterest: secureApi(getExpOfInterest)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EOIView);
