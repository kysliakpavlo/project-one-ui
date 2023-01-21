import AdminConsole from "./AdminConsole";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import _get from 'lodash/get';
import { setLoading } from '../../../actions/app';
import { disableLowerBidBtn } from '../../../actions/adminConsole';
import { toggleLogin } from '../../../actions/auth';
import {
    getAdminAuctionDetails,
    getAdminConsoleAssets,
    getAdminBiddingLogs,
    getAdminAssetDetails,
    addAdminBidddingLog,
    adminConfirmBid,
    getAdminOnlineBids,
    adminInitiateBidding,
    adminPassInAsset,
    adminReferAsset,
    addAdminImpNotes,
    adminSoldAsset,
    adminReopenAsset,
    adminRollbackBid,
    adminAdmitBid,
    adminChangeAssetIncrement,
    adminSuspendAuction,
    adminResumeAuction,
    adminEnableLowerBidButton,
    adminResetAsset,
    lastCallRequest,
    getHighestBidder,
    notifyOtherAdmin
} from '../../../utils/api';
import { secureApi } from '../../../actions/app';

const mapStateToProps = (state) => {
    const islowerBidDisabled = _get(state, 'adminConsole.disableLowerBid', false);

    return {
        islowerBidDisabled
    };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
    disableLowerBidBtn,
    toggleLogin,
    setLoading,
    getAdminAuctionDetails: secureApi(getAdminAuctionDetails),
    getAdminConsoleAssets: secureApi(getAdminConsoleAssets),
    getAdminBiddingLogs: secureApi(getAdminBiddingLogs),
    getAdminAssetDetails: secureApi(getAdminAssetDetails),
    addAdminBidddingLog: secureApi(addAdminBidddingLog),
    adminConfirmBid: secureApi(adminConfirmBid),
    getAdminOnlineBids: secureApi(getAdminOnlineBids),
    adminInitiateBidding: secureApi(adminInitiateBidding),
    adminPassInAsset: secureApi(adminPassInAsset),
    adminReferAsset: secureApi(adminReferAsset),
    addAdminImpNotes: secureApi(addAdminImpNotes),
    adminSoldAsset: secureApi(adminSoldAsset),
    adminReopenAsset: secureApi(adminReopenAsset),
    adminRollbackBid: secureApi(adminRollbackBid),
    adminAdmitBid: secureApi(adminAdmitBid),
    adminChangeAssetIncrement: secureApi(adminChangeAssetIncrement),
    adminSuspendAuction: secureApi(adminSuspendAuction),
    adminResumeAuction: secureApi(adminResumeAuction),
    adminEnableLowerBidButton: secureApi(adminEnableLowerBidButton),
    adminResetAsset: secureApi(adminResetAsset),
    lastCallRequest: secureApi(lastCallRequest),
    getHighestBidder: secureApi(getHighestBidder),
    notifyOtherAdmin: secureApi(notifyOtherAdmin)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AdminConsole);
