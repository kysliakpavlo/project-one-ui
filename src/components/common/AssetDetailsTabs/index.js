import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import AssetDetailsTabs from './AssetDetailsTabs';
import { secureApi } from '../../../actions/app';
import { getTransportFee, bidHistory, getAuctionDocuments } from '../../../utils/api';

const mapStateToProps = (state) => {
    return {
    };
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
    getTransportFee: secureApi(getTransportFee),
    bidHistory: secureApi(bidHistory),
    getAuctionDocuments: secureApi(getAuctionDocuments)
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AssetDetailsTabs);
