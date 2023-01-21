import AuctionCard from './AuctionCard';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from 'lodash/get';
import { toggleLogin } from '../../../actions/auth';
import { setHomeAuction, setDetailsAuction } from '../../../actions/advanceSearch';
import { getAuctionImages } from '../../../utils/api';
import { secureApi } from '../../../actions/app';

const mapStateToProps = (state) => {
    const isLoggedIn = !!_get(state, "auth.loggedInUser", false);
    const loggedInUser = _get(state, "auth.loggedInUser", null);
    return {
        isLoggedIn,
        loggedInUser,
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    setHomeAuction,
    setDetailsAuction,
    getAuctionImages: secureApi(getAuctionImages)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AuctionCard);
