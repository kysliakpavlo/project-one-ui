import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from "lodash/get";
import { secureApi, setLoading } from '../../../actions/app';
import { toggleLogin } from '../../../actions/auth';
import AuctionStatisticsView from "./AuctionStatisticsView";
import { getAuctionActiveUsers, getAuctionStats, getAuctionAssetsStats, searchAssets } from '../../../utils/api';

const mapStateToProps = (state) => {
    const vendor = _get(state, "auth.vendor", {});
    const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
    return {
        vendor,
        isLoggedIn
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    setLoading,
    searchAssets: secureApi(searchAssets),
    getAuctionStats: secureApi(getAuctionStats),
    getAuctionActiveUsers: secureApi(getAuctionActiveUsers),
    getAuctionAssetsStats: secureApi(getAuctionAssetsStats),
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AuctionStatisticsView);
