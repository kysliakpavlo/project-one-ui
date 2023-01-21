import PublicConsole from "./PublicConsole";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from 'lodash/get';
import { setLoading } from '../../../actions/app';
import { toggleLogin } from '../../../actions/auth';
import { disableLowerBidBtn, hidePublicHeader } from '../../../actions/adminConsole';
import { secureApi } from '../../../actions/app';
import {
    getPublicConsoleAssets,
    getPublicAuctionDetails,
    getPublicAssetDetails,
    addPublicBidddingLog,
    getPublicLastBid,
    getImpNotes,
    getPublicBiddingLogs,
    publicConfirmBid,
    requestLowerBidIncrement
} from '../../../utils/api';


const mapStateToProps = (state) => {
    const islowerBidDisabled = _get(state, 'adminConsole.disableLowerBid', false);
    const vendor = _get(state, "auth.vendor", {});
    return {
        vendor,
        islowerBidDisabled
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    toggleLogin,
    disableLowerBidBtn,
    setLoading,
    getPublicConsoleAssets: secureApi(getPublicConsoleAssets),
    getPublicAuctionDetails: secureApi(getPublicAuctionDetails),
    getPublicAssetDetails: secureApi(getPublicAssetDetails),
    addPublicBidddingLog: secureApi(addPublicBidddingLog),
    getPublicLastBid: secureApi(getPublicLastBid),
    getImpNotes: secureApi(getImpNotes),
    getPublicBiddingLogs: secureApi(getPublicBiddingLogs),
    publicConfirmBid: secureApi(publicConfirmBid),
    requestLowerBidIncrement: secureApi(requestLowerBidIncrement),
    hidePublicHeader
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PublicConsole);
