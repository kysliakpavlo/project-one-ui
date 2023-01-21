import AuctionWonItems from './AuctionWonItems';
import _get from 'lodash/get';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setLoading, secureApi } from '../../../actions/app';
import { showMessage } from '../../../actions/toast';
import { toggleLogin } from '../../../actions/auth';
import { getAuctionWonAssets, getListAssetDetail } from '../../../utils/api';

const mapStateToProps = (state) => {
    const loggedInUser = _get(state, 'auth.loggedInUser', null);

    return { isLoggedIn: !!loggedInUser, loggedInUser };
};
const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    setLoading,
    showMessage,
    getListAssetDetail: secureApi(getListAssetDetail),
    getAuctionWonAssets: secureApi(getAuctionWonAssets),
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AuctionWonItems);